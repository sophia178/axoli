import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getDeckAccess } from '@/lib/data/flashcards'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { deckId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const access = await getDeckAccess(user.id, params.deckId)
  if (!access.ok) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const supabase = getSupabaseAdmin()
  const { data: deck } = await supabase
    .from('flashcard_decks')
    .select('id,title,subject,user_id')
    .eq('id', params.deckId)
    .maybeSingle()

  const { data: cards } = await supabase
    .from('flashcards')
    .select('id,deck_id,front,back,difficulty,next_review')
    .eq('deck_id', params.deckId)
    .order('id', { ascending: true })

  return NextResponse.json({
    ok: true,
    deck: deck ?? null,
    cards: cards ?? []
  })
}

