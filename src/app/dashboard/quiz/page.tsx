import Link from 'next/link'
import { requireUser } from '@/lib/auth/user'
import { getDecks } from '@/lib/data/flashcards'
import { QuizFlow } from '@/components/quiz/QuizFlow'
import { Button } from '@/components/ui/Button'

export default async function QuizPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const user = await requireUser()
  const deckId = typeof searchParams?.deck === 'string' ? searchParams.deck : null
  let decks: Awaited<ReturnType<typeof getDecks>> = []
  try {
    decks = await getDecks(user.id)
  } catch {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-subtext sm:p-6">
        Could not load your decks. Please try again.
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-4 sm:p-6">
        <div className="font-heading text-xl text-text sm:text-2xl">No decks yet</div>
        <div className="mt-2 text-sm text-subtext">
          Create a flashcard deck first, then come back to quiz yourself.
        </div>
        <div className="mt-4">
          <Link href="/dashboard/flashcards/create">
            <Button>Create a deck</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <QuizFlow
      decks={decks.map((d) => ({ id: d.id, title: d.title, subject: d.subject }))}
      initialDeckId={deckId}
    />
  )
}
