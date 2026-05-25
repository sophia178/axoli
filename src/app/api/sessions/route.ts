import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/user'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  durationSeconds: z.number().int().min(30),
  subject: z.string().min(1).max(60).optional()
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

function daysBetween(fromISO: string, toISO: string) {
  const from = new Date(`${fromISO}T00:00:00.000Z`)
  const to = new Date(`${toISO}T00:00:00.000Z`)
  const diff = to.getTime() - from.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const coinsEarned = Math.max(0, Math.floor(parsed.data.durationSeconds / 600))

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,coins,streak,last_study_date,pet_happiness,pet_last_updated')
    .eq('user_id', user.id)
    .maybeSingle()

  const today = new Date()
  const todayISO = toISODate(today)
  const yesterdayISO = toISODate(addDays(today, -1))
  const last = profile?.last_study_date ?? null

  const newStreak =
    last === todayISO ? profile?.streak ?? 0 : last === yesterdayISO ? (profile?.streak ?? 0) + 1 : 1

  let newCoins = profile?.coins ?? 0
  if (coinsEarned > 0) {
    try {
      newCoins = await awardCoins(user.id, coinsEarned, 'study_minutes')
    } catch {
      return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
    }
  }

  const lastUpdated = (profile as any)?.pet_last_updated as string | null
  const baseHappiness = profile?.pet_happiness ?? 100
  const days = daysBetween(lastUpdated ?? todayISO, todayISO)
  const decayed = Math.max(0, Math.min(100, baseHappiness - days * 10))
  const newHappiness = Math.max(0, Math.min(100, decayed + 20))

  const inserted = await supabase.from('study_sessions').insert({
    user_id: user.id,
    duration: parsed.data.durationSeconds,
    subject: parsed.data.subject ?? null,
    coins_earned: coinsEarned
  })
  if (inserted.error) {
    return NextResponse.json({ error: 'session_save_failed' }, { status: 500 })
  }

  const updated = await supabase
    .from('profiles')
    .update({
      streak: newStreak,
      last_study_date: todayISO,
      pet_happiness: newHappiness,
      pet_last_updated: todayISO
    })
    .eq('user_id', user.id)
  if (updated.error) {
    return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    coinsEarned,
    coins: newCoins,
    streak: newStreak,
    petHappiness: newHappiness
  })
}
