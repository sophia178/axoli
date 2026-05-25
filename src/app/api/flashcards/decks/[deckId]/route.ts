import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const patchSchema = z.object({
  title: z.string().min(1).max(80).optional(),
  subject: z.string().min(1).max(60).optional(),
  isPublic: z.boolean().optional()
})

export async function PATCH(
  req: Request,
  { params }: { params: { deckId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (typeof parsed.data.title === 'string') updates.title = parsed.data.title
  if (typeof parsed.data.subject === 'string') updates.subject = parsed.data.subject
  if (typeof parsed.data.isPublic === 'boolean') updates.is_public = parsed.data.isPublic

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { error } = await supabase
    .from('flashcard_decks')
    .update(updates)
    .eq('id', params.deckId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { deckId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', params.deckId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
