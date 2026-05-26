import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type FlashcardDeck = {
  id: string
  user_id: string
  title: string
  subject: string
  is_public: boolean
  last_studied_at?: string | null
  created_at: string
}

export type Flashcard = {
  id: string
  deck_id: string
  front: string
  back: string
  difficulty: number
  next_review: string | null
}

export type DeckSummary = {
  id: string
  user_id: string
  title: string
  subject: string
  is_public: boolean
  created_at: string
  cardCount: number
  lastStudiedAt: string | null
  creatorUsername?: string | null
}

export async function getDecks(userId: string): Promise<FlashcardDeck[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public,last_studied_at,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []) as FlashcardDeck[]
}

export async function getDeckCards(deckId: string, userId: string): Promise<Flashcard[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,flashcards(id,deck_id,front,back,difficulty,next_review)')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle()

  const cards = (data as any)?.flashcards ?? []
  return cards as Flashcard[]
}

export async function getDeckForQuiz(deckId: string, userId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,flashcards(id,front,back)')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return null
  return {
    id: (data as any).id as string,
    title: (data as any).title as string,
    cards: ((data as any).flashcards ?? []) as Array<{ id: string; front: string; back: string }>
  }
}

export async function getMyDeckSummaries(userId: string): Promise<DeckSummary[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data: decks } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public,last_studied_at,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const list = (decks ?? []) as Array<any>
  if (list.length === 0) return []
  const deckIds = list.map((d) => d.id as string)

  const { data: cardRows } = await supabase
    .from('flashcards')
    .select('deck_id')
    .in('deck_id', deckIds)

  const countByDeck = new Map<string, number>()
  for (const row of (cardRows ?? []) as any[]) {
    const deckId = row.deck_id as string
    countByDeck.set(deckId, (countByDeck.get(deckId) ?? 0) + 1)
  }

  const { data: reviewRows } = await supabase
    .from('flashcard_reviews')
    .select('deck_id,created_at')
    .eq('user_id', userId)
    .in('deck_id', deckIds)
    .order('created_at', { ascending: false })
    .limit(5000)

  const lastByDeck = new Map<string, string>()
  for (const row of (reviewRows ?? []) as any[]) {
    const deckId = row.deck_id as string
    if (!lastByDeck.has(deckId)) lastByDeck.set(deckId, row.created_at as string)
  }

  return list.map((d) => ({
    id: d.id as string,
    user_id: d.user_id as string,
    title: d.title as string,
    subject: d.subject as string,
    is_public: Boolean(d.is_public),
    created_at: d.created_at as string,
    cardCount: countByDeck.get(d.id as string) ?? 0,
    lastStudiedAt: lastByDeck.get(d.id as string) ?? (d.last_studied_at as string | null) ?? null
  }))
}

export async function getPublicDeckSummaries(input: {
  viewerUserId: string
  subject?: string | null
  query?: string | null
  limit?: number
}): Promise<DeckSummary[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  let q = supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public,created_at')
    .eq('is_public', true)
    .neq('user_id', input.viewerUserId)
    .order('created_at', { ascending: false })

  if (input.subject && input.subject !== 'All') {
    q = q.eq('subject', input.subject)
  }
  if (input.query) {
    q = q.ilike('title', `%${input.query}%`)
  }
  const { data: decks } = await q.limit(input.limit ?? 24)

  const list = (decks ?? []) as Array<any>
  if (list.length === 0) return []
  const deckIds = list.map((d) => d.id as string)
  const userIds = Array.from(new Set(list.map((d) => d.user_id as string)))

  const { data: cardRows } = await supabase
    .from('flashcards')
    .select('deck_id')
    .in('deck_id', deckIds)
  const countByDeck = new Map<string, number>()
  for (const row of (cardRows ?? []) as any[]) {
    const deckId = row.deck_id as string
    countByDeck.set(deckId, (countByDeck.get(deckId) ?? 0) + 1)
  }

  const { data: profileRows } = await supabase
    .from('profiles')
    .select('user_id,username')
    .in('user_id', userIds)
  const usernameByUser = new Map<string, string | null>()
  for (const row of (profileRows ?? []) as any[]) {
    usernameByUser.set(row.user_id as string, (row.username as string | null) ?? null)
  }

  return list.map((d) => ({
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
}

export async function getSharedDeckSummaries(userId: string): Promise<DeckSummary[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  const groupIds = Array.from(new Set((memberRows ?? []).map((r: any) => r.group_id as string)))
  if (groupIds.length === 0) return []

  const { data: sharedRows } = await supabase
    .from('group_decks')
    .select('deck_id')
    .in('group_id', groupIds)
    .order('created_at', { ascending: false })
    .limit(100)

  const deckIds = Array.from(new Set((sharedRows ?? []).map((r: any) => r.deck_id as string)))
  if (deckIds.length === 0) return []

  const { data: decks } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,is_public,created_at')
    .in('id', deckIds)

  const list = (decks ?? []) as any[]
  if (list.length === 0) return []

  const { data: cardRows } = await supabase
    .from('flashcards')
    .select('deck_id')
    .in('deck_id', deckIds)

  const countByDeck = new Map<string, number>()
  for (const row of (cardRows ?? []) as any[]) {
    const deckId = row.deck_id as string
    countByDeck.set(deckId, (countByDeck.get(deckId) ?? 0) + 1)
  }

  const userIds = Array.from(new Set(list.map((d) => d.user_id as string)))
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('user_id,username')
    .in('user_id', userIds)
  const usernameByUser = new Map<string, string | null>()
  for (const row of (profileRows ?? []) as any[]) {
    usernameByUser.set(row.user_id as string, (row.username as string | null) ?? null)
  }

  return list.map((d) => ({
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
}

export async function getDeckAccess(userId: string, deckId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false as const }
  const { data: deck } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,is_public,title,subject')
    .eq('id', deckId)
    .maybeSingle()

  if (!deck) return { ok: false as const }
  if ((deck as any).user_id === userId) return { ok: true as const, owner: true, deck }
  if ((deck as any).is_public) return { ok: true as const, owner: false, deck }

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  const groupIds = Array.from(new Set((memberRows ?? []).map((r: any) => r.group_id as string)))
  if (groupIds.length === 0) return { ok: false as const }

  const { data: shared } = await supabase
    .from('group_decks')
    .select('id')
    .eq('deck_id', deckId)
    .in('group_id', groupIds)
    .maybeSingle()

  if (!shared) return { ok: false as const }
  return { ok: true as const, owner: false, deck }
}

export async function getDeckWithCardsForStudy(userId: string, deckId: string) {
  const access = await getDeckAccess(userId, deckId)
  if (!access.ok) return null
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data } = await supabase
    .from('flashcard_decks')
    .select('id,user_id,title,subject,flashcards(id,deck_id,front,back)')
    .eq('id', deckId)
    .maybeSingle()
  if (!data) return null
  return {
    deckId: (data as any).id as string,
    title: (data as any).title as string,
    subject: (data as any).subject as string,
    ownerUserId: (data as any).user_id as string,
    cards: ((data as any).flashcards ?? []) as Array<{
      id: string
      deck_id: string
      front: string
      back: string
    }>
  }
}

export type DeckCompletion = {
  id: string
  created_at: string
  score_percent: number | null
  cards_reviewed: number | null
  correct_count: number | null
  total_count: number | null
}

export async function getDeckCompletionHistory(userId: string, deckId: string): Promise<DeckCompletion[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('deck_completions')
    .select('id,created_at,score_percent,cards_reviewed,correct_count,total_count')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as DeckCompletion[]
}
