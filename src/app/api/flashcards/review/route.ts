import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid(),
  cardId: z.string().uuid(),
  known: z.boolean()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })

  await supabase.from('flashcard_reviews').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId,
    card_id: parsed.data.cardId,
    known: parsed.data.known
  })

  const { data: mastery } = await supabase
    .from('flashcard_mastery')
    .select('known_count,unknown_count')
    .eq('user_id', user.id)
    .eq('card_id', parsed.data.cardId)
    .maybeSingle()

  const knownCount = (mastery as any)?.known_count ?? 0
  const unknownCount = (mastery as any)?.unknown_count ?? 0

  const nextKnown = parsed.data.known ? knownCount + 1 : knownCount
  const nextUnknown = parsed.data.known ? unknownCount : unknownCount + 1
  const mastered = nextKnown >= 1

  await supabase.from('flashcard_mastery').upsert(
    {
      user_id: user.id,
      card_id: parsed.data.cardId,
      known_count: nextKnown,
      unknown_count: nextUnknown,
      mastered,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,card_id' }
  )

  return NextResponse.json({ ok: true, mastered })
}
