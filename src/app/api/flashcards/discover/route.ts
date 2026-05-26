import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

const querySchema = z.object({
  subject: z.string().optional(),
  q: z.string().optional()
})

function getSupabaseFromCookies() {
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

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    subject: url.searchParams.get('subject') ?? undefined,
    q: url.searchParams.get('q') ?? undefined
  })
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin() ?? getSupabaseFromCookies()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })

  let q = supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public,created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (parsed.data.subject && parsed.data.subject !== 'All') q = q.eq('subject', parsed.data.subject)
  if (parsed.data.q) q = q.ilike('title', `%${parsed.data.q}%`)

  const { data: decks, error } = await q.limit(36)
  if (error) return NextResponse.json({ error: 'discover_failed' }, { status: 500 })

  const list = (decks ?? []) as any[]
  if (list.length === 0) return NextResponse.json({ ok: true, decks: [] })

  const deckIds = list.map((d) => d.id as string)
  const userIds = Array.from(new Set(list.map((d) => d.user_id as string)))

  const { data: cardRows } = await supabase.from('flashcards').select('deck_id').in('deck_id', deckIds)
  const countByDeck = new Map<string, number>()
  for (const row of (cardRows ?? []) as any[]) {
    const deckId = row.deck_id as string
    countByDeck.set(deckId, (countByDeck.get(deckId) ?? 0) + 1)
  }

  const { data: profileRows } = await supabase.from('profiles').select('user_id,username').in('user_id', userIds)
  const usernameByUser = new Map<string, string | null>()
  for (const row of (profileRows ?? []) as any[]) {
    usernameByUser.set(row.user_id as string, (row.username as string | null) ?? null)
  }

  return NextResponse.json({
    ok: true,
    decks: list.map((d) => ({
      id: d.id as string,
      user_id: d.user_id as string,
      title: d.title as string,
      subject: d.subject as string,
      is_public: Boolean(d.is_public),
      created_at: d.created_at as string,
      cardCount: countByDeck.get(d.id as string) ?? 0,
      lastStudiedAt: null,
      creatorUsername: usernameByUser.get(d.user_id as string) ?? null
    }))
  })
}
