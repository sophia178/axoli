import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid().nullable(),
  mode: z.enum(['multiple_choice', 'true_false', 'written']),
  questionCount: z.number().int().min(5).max(20),
  correctCount: z.number().int().min(0).max(20),
  durationSeconds: z.number().int().min(0).max(60 * 60)
})

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log('[QuizComplete] user:', user?.id ?? 'NONE')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    console.log('[QuizComplete] bad_request:', parsed.error.issues)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId,
    mode: parsed.data.mode,
    score: parsed.data.correctCount,
    total: parsed.data.questionCount,
    time_seconds: parsed.data.durationSeconds
  })
  if (insertError) {
    console.error('[QuizComplete] quiz_attempts insert error:', insertError.message)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('user_id', user.id)
    .maybeSingle()

  const newCoins = (profile?.coins ?? 0) + 5

  const { error: ledgerError } = await supabase
    .from('coins_ledger')
    .insert({ user_id: user.id, amount: 5, reason: 'quiz_complete' })
  if (ledgerError) {
    console.error('[QuizComplete] coins_ledger insert error:', ledgerError.message)
  }

  const { error: coinsError } = await supabase
    .from('profiles')
    .update({ coins: newCoins })
    .eq('user_id', user.id)
  if (coinsError) {
    console.error('[QuizComplete] coins update error:', coinsError.message)
  }

  console.log('[QuizComplete] done — coins now:', newCoins)
  return NextResponse.json({ ok: true, coinsAwarded: 5, promptDouble: true })
}
