import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSharedDeckSummaries } from '@/lib/data/flashcards'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const decks = await getSharedDeckSummaries(user.id)
  return NextResponse.json({ ok: true, decks })
}

