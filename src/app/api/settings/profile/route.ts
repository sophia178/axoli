import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { locales } from '@/i18n'

export const runtime = 'nodejs'

const bodySchema = z
  .object({
    username: z.string().min(2).max(24).optional(),
    avatarColour: z.enum(['pink', 'gold', 'mint', 'lavender', 'sky', 'peach']).optional(),
    language: z.enum([...locales]).optional()
  })
  .refine((v) => v.username || v.avatarColour || v.language, { message: 'empty_update' })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const update: Record<string, unknown> = {}
  if (parsed.data.username !== undefined) update.username = parsed.data.username
  if (parsed.data.avatarColour !== undefined) update.avatar_colour = parsed.data.avatarColour
  if (parsed.data.language !== undefined) update.language = parsed.data.language
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
