import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  amount: z.number().int().min(1).max(500),
  reason: z.string().min(1).max(60)
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  try {
    const coins = await awardCoins(user.id, parsed.data.amount, parsed.data.reason)
    return NextResponse.json({ ok: true, coins, coinsAwarded: parsed.data.amount })
  } catch {
    return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
  }
}
