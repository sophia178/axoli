import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid(),
  correctCount: z.number().int().min(0).max(1000),
  totalCount: z.number().int().min(1).max(1000),
  cardsReviewed: z.number().int().min(1).max(5000).optional()
})

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log('[FlashcardsComplete] user:', user?.id ?? 'NONE')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    console.log('[FlashcardsComplete] bad_request:', parsed.error.issues)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const totalCount = parsed.data.totalCount
  const correctCount = Math.max(0, Math.min(totalCount, parsed.data.correctCount))
  const cardsReviewed = parsed.data.cardsReviewed ?? totalCount
  const scorePercent = Math.round((correctCount / Math.max(1, totalCount)) * 100)

  const { data: completion, error: insertError } = await supabase
    .from('deck_completions')
    .insert({
      user_id: user.id,
      deck_id: parsed.data.deckId,
      score_percent: scorePercent,
      cards_reviewed: cardsReviewed
    })
    .select('id,created_at,score_percent,cards_reviewed')
    .single()

  if (insertError) {
    console.error('[FlashcardsComplete] deck_completions insert error:', insertError.message)
  }

  await supabase
    .from('flashcard_decks')
    .update({ last_studied_at: new Date().toISOString() })
    .eq('id', parsed.data.deckId)

  console.log('[FlashcardsComplete] done')
  return NextResponse.json({ ok: true, coinsAwarded: 5, promptDouble: true, completion })
}
