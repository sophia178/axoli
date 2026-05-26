import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/user'
import { awardCoins } from '@/lib/coins'
import { changePetHappiness } from '@/lib/pet/pet'

export const runtime = 'nodejs'

const bodySchema = z.object({
  durationSeconds: z.number().int().min(1),
  subject: z.string().min(1).max(60).optional(),
  applyRewards: z.boolean().optional()
})

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

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const applyRewards = parsed.data.applyRewards !== false
  const coinsEarned = applyRewards ? Math.max(0, Math.floor(parsed.data.durationSeconds / 600)) : 0

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,coins,streak,last_study_date')
    .eq('user_id', user.id)
    .maybeSingle()

  const today = new Date()
  const todayISO = toISODate(today)
  const yesterdayISO = toISODate(addDays(today, -1))
  const last = profile?.last_study_date ?? null

  const newStreak = applyRewards
    ? last === todayISO
      ? profile?.streak ?? 0
      : last === yesterdayISO
        ? (profile?.streak ?? 0) + 1
        : 1
    : profile?.streak ?? 0

  let newCoins = profile?.coins ?? 0
  if (applyRewards && coinsEarned > 0) {
    try {
      newCoins = await awardCoins(user.id, coinsEarned, 'study_minutes')
    } catch {
      return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
    }
  }

  const inserted = await supabase.from('study_sessions').insert({
    user_id: user.id,
    duration: parsed.data.durationSeconds,
    subject: parsed.data.subject ?? null,
    coins_earned: coinsEarned
  })
  if (inserted.error) {
    return NextResponse.json({ error: 'session_save_failed' }, { status: 500 })
  }

  let petHappiness: number | null = null
  if (applyRewards) {
    try {
      petHappiness = await changePetHappiness(user.id, 5)
    } catch {
      petHappiness = null
    }

    const updated = await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        last_study_date: todayISO
      })
      .eq('user_id', user.id)
    if (updated.error) {
      return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    coinsEarned,
    coins: newCoins,
    streak: newStreak,
    petHappiness
  })
}
