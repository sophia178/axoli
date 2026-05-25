import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getPublicDeckSummaries } from '@/lib/data/flashcards'

export const runtime = 'nodejs'

const querySchema = z.object({
  subject: z.string().optional(),
  q: z.string().optional()
})

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    subject: url.searchParams.get('subject') ?? undefined,
    q: url.searchParams.get('q') ?? undefined
  })
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const decks = await getPublicDeckSummaries({
    viewerUserId: user.id,
    subject: parsed.data.subject ?? null,
    query: parsed.data.q ?? null
  })

  return NextResponse.json({ ok: true, decks })
}

