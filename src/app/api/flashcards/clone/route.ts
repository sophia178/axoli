import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: deck } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public')
    .eq('id', parsed.data.deckId)
    .maybeSingle()

  if (!deck || !(deck as any).is_public) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const { data: cards } = await supabase
    .from('flashcards')
    .select('front,back,difficulty')
    .eq('deck_id', parsed.data.deckId)

  const title = `${(deck as any).title} (Copy)`
  const { data: inserted, error: insertError } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: user.id,
      title,
      subject: (deck as any).subject,
      is_public: false
    })
    .select('id')
    .single()

  if (insertError || !inserted) return NextResponse.json({ error: 'clone_failed' }, { status: 500 })

  const payload = (cards ?? []).map((c: any) => ({
    deck_id: inserted.id,
    front: c.front,
    back: c.back,
    difficulty: c.difficulty ?? 3
  }))
  if (payload.length > 0) await supabase.from('flashcards').insert(payload)

  return NextResponse.json({ ok: true, deckId: inserted.id })
}
