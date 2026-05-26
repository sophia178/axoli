import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid(),
  correctCount: z.number().int().min(0).max(1000),
  totalCount: z.number().int().min(1).max(1000),
  cardsReviewed: z.number().int().min(1).max(5000).optional()
})

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const cookieStore = cookies()
  const supabaseAuth = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const c of toSet) cookieStore.set(c.name, c.value, c.options as Parameters<typeof cookieStore.set>[2])
      }
    }
  })

  const { data, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !data.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const user = data.user

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })

  const totalCount = parsed.data.totalCount
  const correctCount = Math.max(0, Math.min(totalCount, parsed.data.correctCount))
  const cardsReviewed = parsed.data.cardsReviewed ?? totalCount
  const scorePercent = Math.round((correctCount / Math.max(1, totalCount)) * 100)

  const inserted = await supabase
    .from('deck_completions')
    .insert({
      user_id: user.id,
      deck_id: parsed.data.deckId,
      score_percent: scorePercent,
      cards_reviewed: cardsReviewed,
      correct_count: correctCount,
      total_count: totalCount
    })
    .select('id,created_at,score_percent,cards_reviewed,correct_count,total_count')
    .single()

  if (inserted.error) {
    console.error('[flashcards/complete] insert error:', inserted.error)
    return NextResponse.json({ error: 'completion_save_failed' }, { status: 500 })
  }

  await supabase
    .from('flashcard_decks')
    .update({ last_studied_at: new Date().toISOString() })
    .eq('id', parsed.data.deckId)

  try {
    await awardCoins(user.id, 5, 'deck_review_complete')
  } catch (e) {
    console.error('[flashcards/complete] awardCoins error:', e)
  }

  return NextResponse.json({ ok: true, coinsAwarded: 5, promptDouble: true, completion: inserted.data })
}
