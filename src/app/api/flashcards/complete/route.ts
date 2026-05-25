import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

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

  const inserted = await supabase.from('deck_completions').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId
  })

  if (inserted.error) {
    await supabase
      .from('flashcard_decks')
      .update({ last_studied_at: new Date().toISOString() })
      .eq('id', parsed.data.deckId)
    return NextResponse.json({ ok: true, coinsAwarded: 0 })
  }

  await supabase
    .from('flashcard_decks')
    .update({ last_studied_at: new Date().toISOString() })
    .eq('id', parsed.data.deckId)

  try {
    const coins = await awardCoins(user.id, 5, 'deck_review_complete')
    return NextResponse.json({ ok: true, coinsAwarded: 5, coins })
  } catch {
    return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
  }
}
