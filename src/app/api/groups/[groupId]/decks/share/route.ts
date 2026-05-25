import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid()
})

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: member } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { data: deck } = await supabase
    .from('flashcard_decks')
    .select('id')
    .eq('id', parsed.data.deckId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!deck) return NextResponse.json({ error: 'not_owned' }, { status: 403 })

  const { error } = await supabase.from('group_decks').upsert(
    {
      group_id: params.groupId,
      deck_id: parsed.data.deckId,
      shared_by: user.id
    },
    { onConflict: 'group_id,deck_id' }
  )

  if (error) return NextResponse.json({ error: 'share_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
