import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid().nullable(),
  mode: z.enum(['multiple_choice', 'true_false', 'written']),
  questionCount: z.number().int().min(5).max(20),
  correctCount: z.number().int().min(0).max(20),
  durationSeconds: z.number().int().min(0).max(60 * 60)
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId,
    mode: parsed.data.mode,
    question_count: parsed.data.questionCount,
    correct_count: parsed.data.correctCount,
    duration_seconds: parsed.data.durationSeconds
  })

  const perfect = parsed.data.correctCount === parsed.data.questionCount
  const coinsAwarded = perfect ? 25 : 10
  const coins = await awardCoins(user.id, coinsAwarded, perfect ? 'quiz_perfect' : 'quiz_finish')

  return NextResponse.json({ ok: true, coinsAwarded, coins })
}

