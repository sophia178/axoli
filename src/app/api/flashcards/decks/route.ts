import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/user'

export const runtime = 'nodejs'

const bodySchema = z.object({
  title: z.string().min(1).max(80),
  subject: z.string().min(1).max(60),
  isPublic: z.boolean().optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1).max(400),
        back: z.string().min(1).max(800),
        difficulty: z.number().int().min(1).max(5).optional()
      })
    )
    .min(1)
    .max(100)
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: deck, error: deckError } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      subject: parsed.data.subject,
      is_public: parsed.data.isPublic ?? false
    })
    .select('id')
    .single()

  if (deckError || !deck) return NextResponse.json({ error: 'deck_insert_failed' }, { status: 500 })

  const cardsPayload = parsed.data.cards.map((c) => ({
    deck_id: deck.id,
    front: c.front,
    back: c.back,
    difficulty: c.difficulty ?? 3
  }))

  const { error: cardsError } = await supabase.from('flashcards').insert(cardsPayload)
  if (cardsError) return NextResponse.json({ error: 'cards_insert_failed' }, { status: 500 })

  return NextResponse.json({ ok: true, deckId: deck.id })
}

