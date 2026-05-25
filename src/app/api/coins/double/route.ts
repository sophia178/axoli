import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const LIMIT_PER_DAY = 3

const postSchema = z.object({
  amount: z.number().int().min(1).max(500),
  reason: z.string().min(1).max(60)
})

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

async function getAndMaybeReset(userId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const today = todayISO()
    return { watchedToday: 0, today }
  }
  const { data } = await supabase
    .from('profiles')
    .select('ads_watched_today,ads_reset_date')
    .eq('user_id', userId)
    .maybeSingle()

  const today = todayISO()
  const watched = Number((data as any)?.ads_watched_today ?? 0)
  const resetDate = ((data as any)?.ads_reset_date as string | null) ?? today

  if (resetDate !== today) {
    await supabase
      .from('profiles')
      .update({ ads_watched_today: 0, ads_reset_date: today })
      .eq('user_id', userId)
    return { watchedToday: 0, today }
  }

  return { watchedToday: watched, today }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { watchedToday } = await getAndMaybeReset(user.id)
  return NextResponse.json({
    ok: true,
    adsWatchedToday: watchedToday,
    limit: LIMIT_PER_DAY,
    canWatch: watchedToday < LIMIT_PER_DAY
  })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { watchedToday, today } = await getAndMaybeReset(user.id)
  if (watchedToday >= LIMIT_PER_DAY) {
    return NextResponse.json(
      { error: 'limit_reached', adsWatchedToday: watchedToday, limit: LIMIT_PER_DAY },
      { status: 429 }
    )
  }

  const bonusCoins = parsed.data.amount
  let coins = 0
  try {
    coins = await awardCoins(user.id, bonusCoins, `double_${parsed.data.reason}`)
  } catch {
    return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
  }

  const supabase = getSupabaseAdmin()
  if (supabase) {
    await supabase
      .from('profiles')
      .update({ ads_watched_today: watchedToday + 1, ads_reset_date: today })
      .eq('user_id', user.id)
  }

  return NextResponse.json({
    ok: true,
    coins,
    bonusCoinsAwarded: bonusCoins,
    totalFromAction: parsed.data.amount * 2,
    adsWatchedToday: watchedToday + 1,
    limit: LIMIT_PER_DAY
  })
}
