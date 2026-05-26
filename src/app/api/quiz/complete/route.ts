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
    correct_count: parsed.data.correctCount,
    question_count: parsed.data.questionCount,
    duration_seconds: parsed.data.durationSeconds
  })
  if (insertError) {
    console.error('[QuizComplete] quiz_attempts insert error:', insertError.message)
  }

  console.log('[QuizComplete] done')
  return NextResponse.json({ ok: true, coinsAwarded: 5, promptDouble: true })
}
