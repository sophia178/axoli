import { requireUser } from '@/lib/auth/user'
import { getMyDeckSummaries } from '@/lib/data/flashcards'
import { FlashcardsHub } from '@/components/flashcards/FlashcardsHub'

export default async function FlashcardsPage() {
  const user = await requireUser()
  const decks = await getMyDeckSummaries(user.id)

  return <FlashcardsHub initialMyDecks={decks} />
}
