import { requireUser } from '@/lib/auth/user'
import { getDecks } from '@/lib/data/flashcards'
import { QuizFlow } from '@/components/quiz/QuizFlow'

export default async function QuizPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const user = await requireUser()
  const deckId = typeof searchParams?.deck === 'string' ? searchParams.deck : null
  const decks = await getDecks(user.id)

  return (
    <QuizFlow
      decks={decks.map((d) => ({ id: d.id, title: d.title, subject: d.subject }))}
      initialDeckId={deckId}
    />
  )
}
