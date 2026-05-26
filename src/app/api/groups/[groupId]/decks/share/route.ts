import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid()
})

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function getSupabaseServer() {
  const admin = getSupabaseAdmin()
  if (admin) return admin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: CookieToSet[]) {
        for (const c of toSet) cookieStore.set(c.name, c.value, c.options)
      }
    }
  })
}

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
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
