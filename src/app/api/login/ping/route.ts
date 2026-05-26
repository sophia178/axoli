import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('last_login_date,streak')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) return NextResponse.json({ error: 'profile_load_failed' }, { status: 500 })

  const now = new Date()
  const today = toISODate(now)
  const yesterday = toISODate(addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -1))
  const last = (data as any)?.last_login_date as string | null
  const currentStreak = Number((data as any)?.streak ?? 0)

  if (last === today) {
    return NextResponse.json({ ok: true, coinsAwarded: 0, streak: currentStreak })
  }

  const nextStreak = last === yesterday ? Math.max(1, currentStreak + 1) : 1
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ last_login_date: today, streak: nextStreak })
    .eq('user_id', user.id)
  if (updateError) return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 })

  try {
    await awardCoins(user.id, 2, 'daily_login')
    return NextResponse.json({ ok: true, coinsAwarded: 2, streak: nextStreak })
  } catch {
    return NextResponse.json({ ok: true, coinsAwarded: 0, streak: nextStreak })
  }
}
