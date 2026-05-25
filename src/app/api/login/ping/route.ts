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

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data } = await supabase
    .from('profiles')
    .select('last_login_date')
    .eq('user_id', user.id)
    .maybeSingle()

  const today = toISODate(new Date())
  const last = (data as any)?.last_login_date as string | null

  if (last === today) return NextResponse.json({ ok: true, coinsAwarded: 0 })

  await supabase.from('profiles').update({ last_login_date: today }).eq('user_id', user.id)
  await awardCoins(user.id, 2, 'daily_login')

  return NextResponse.json({ ok: true, coinsAwarded: 2 })
}
