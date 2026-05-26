import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log('[Ping] user:', user?.id ?? 'NONE')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('last_login_date,streak,coins')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[Ping] profile load error:', profileError.message)
    return NextResponse.json({ error: 'profile_load_failed' }, { status: 500 })
  }

  const now = new Date()
  const today = toISODate(now)
  const yesterday = toISODate(addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), -1))
  const last = (data as any)?.last_login_date as string | null
  const currentStreak = Number((data as any)?.streak ?? 0)
  const currentCoins = Number((data as any)?.coins ?? 0)

  console.log('[Ping] last_login_date:', last, '| today:', today, '| streak:', currentStreak)

  if (last === today) {
    console.log('[Ping] already pinged today')
    return NextResponse.json({ ok: true, coinsAwarded: 0, streak: currentStreak })
  }

  const nextStreak = last === yesterday ? currentStreak + 1 : 1
  const newCoins = currentCoins + 2

  const { error: ledgerError } = await supabase
    .from('coins_ledger')
    .insert({ user_id: user.id, amount: 2, reason: 'daily_login' })
  if (ledgerError) console.error('[Ping] ledger insert error:', ledgerError.message)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ last_login_date: today, streak: nextStreak, coins: newCoins })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[Ping] profile update error:', updateError.message)
    return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 })
  }

  console.log('[Ping] streak ->', nextStreak, '| coins ->', newCoins)
  return NextResponse.json({ ok: true, coinsAwarded: 2, streak: nextStreak })
}
