import { requireUser } from '@/lib/auth/user'
import { getDeckWithCardsForStudy } from '@/lib/data/flashcards'
import { DeckStudy } from '@/components/flashcards/DeckStudy'

export default async function DeckStudyPage({
  params
}: {
  params: { deckId: string }
}) {
  const user = await requireUser()
  const deck = await getDeckWithCardsForStudy(user.id, params.deckId)

  if (!deck) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
        Deck not found.
      </div>
    )
  }

  return (
    <DeckStudy
      deckId={deck.deckId}
      title={deck.title}
      subject={deck.subject}
      cards={deck.cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
    />
  )
}

