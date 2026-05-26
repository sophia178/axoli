'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'
import { useDoubleCoins } from '@/hooks/useDoubleCoins'

type Card = { id: string; front: string; back: string }

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Rating = 'again' | 'hard' | 'good' | 'easy'

type DeckCompletion = {
  id: string
  created_at: string
  score_percent: number | null
  cards_reviewed: number | null
  correct_count: number | null
  total_count: number | null
}

export function DeckStudy({
  deckId,
  title,
  subject,
  cards,
  initialCompletions
}: {
  deckId: string
  title: string
  subject: string
  cards: Card[]
  initialCompletions: DeckCompletion[]
}) {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptDouble, modal } = useDoubleCoins()

  const allIds = useMemo(() => cards.map((c) => c.id), [cards])
  const [queue, setQueue] = useState<string[]>(() => shuffle(allIds))
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Record<string, Rating | null>>(() => {
    const o: Record<string, Rating | null> = {}
    for (const id of allIds) o[id] = null
    return o
  })
  const [completionSent, setCompletionSent] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [completions, setCompletions] = useState<DeckCompletion[]>(() => initialCompletions ?? [])

  const currentId = queue[0] ?? null
  const current = currentId ? cards.find((c) => c.id === currentId) ?? null : null

  const reviewedCount = useMemo(
    () => Object.values(reviewed).filter((v) => v !== null).length,
    [reviewed]
  )

  const correctCount = useMemo(
    () =>
      Object.values(reviewed).filter((v) => v === 'good' || v === 'easy').length,
    [reviewed]
  )

  const progress = cards.length === 0 ? 0 : Math.round((reviewedCount / cards.length) * 100)

  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (completionSent) return
    if (cards.length === 0) return
    if (reviewedCount !== cards.length) return
    if (completionTimer.current) return
    completionTimer.current = setTimeout(() => {
      void (async () => {
        const res = await withLoading(
          fetch('/api/flashcards/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deckId,
              correctCount,
              totalCount: cards.length,
              cardsReviewed: reviewedCount
            })
          })
        )
        const json = (await res.json().catch(() => null)) as any
        const coinsAwarded = Number(json?.coinsAwarded ?? 0)
        if (res.ok && coinsAwarded > 0) {
          showCoins(coinsAwarded)
          await promptDouble({ coinsEarned: coinsAwarded, reason: 'deck_complete' })
        }
        if (res.ok && json?.completion) {
          setCompletions((prev) => [json.completion as DeckCompletion, ...prev])
        }
        setCompletionSent(true)
      })()
    }, 350)
  }, [
    completionSent,
    cards.length,
    reviewedCount,
    deckId,
    withLoading,
    showCoins,
    promptDouble,
    correctCount
  ])

  if (cards.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
        No cards in this deck yet.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {modal}
      <div className="rounded-3xl border border-border bg-card/70 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="font-heading text-3xl text-text">{title}</div>
            <div className="mt-1 text-sm text-subtext">{subject}</div>
          </div>
          <div className="text-sm text-subtext">
            Progress: <span className="text-text">{reviewedCount}</span> of{' '}
            <span className="text-text">{cards.length}</span>
          </div>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-bg/40 ring-1 ring-border">
          <div className="h-full rounded-full bg-pink" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}

      {current ? (
        <div className="rounded-3xl border border-border bg-bg/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-subtext">
              Card {cards.findIndex((c) => c.id === current.id) + 1} / {cards.length}
            </div>
            <div className="rounded-full bg-card/60 px-3 py-1 text-xs font-semibold text-subtext ring-1 ring-border">
              {reviewed[current.id] === null
                ? 'New'
                : reviewed[current.id] === 'again'
                  ? 'Again'
                  : reviewed[current.id] === 'hard'
                    ? 'Hard'
                    : reviewed[current.id] === 'good'
                      ? 'Good'
                      : 'Easy'}
            </div>
          </div>

          <div className="mt-4">
            <motion.div
              onClick={() => setFlipped((v) => !v)}
              className="relative mx-auto w-full max-w-2xl cursor-pointer select-none"
              style={{ perspective: 1200 }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="relative"
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
              >
                <div
                  className="rounded-3xl border border-border bg-card/70 p-6"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="text-xs text-subtext">Front</div>
                  <div className="mt-2 text-xl font-semibold text-text">{current.front}</div>
                  <div className="mt-4 text-sm text-subtext">Tap to flip</div>
                </div>
                <div
                  className="absolute inset-0 rounded-3xl border border-border bg-card/70 p-6"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-xs text-subtext">Back</div>
                  <div className="mt-2 text-xl font-semibold text-text">{current.back}</div>
                  <div className="mt-4 text-sm text-subtext">Tap to flip</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {flipped ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!currentId) return
                  setMessage(null)
                  setReviewed((prev) => ({ ...prev, [currentId]: prev[currentId] ?? 'again' }))
                  setFlipped(false)
                  setQueue((prev) => {
                    const rest = prev.slice(1)
                    return [...rest, currentId, currentId]
                  })
                  const res = await withLoading(
                    fetch('/api/flashcards/review', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deckId, cardId: currentId, known: false })
                    })
                  )
                  if (!res.ok) setMessage('Could not save progress. Try again.')
                  else setReviewed((prev) => ({ ...prev, [currentId]: 'again' }))
                }}
              >
                Again
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!currentId) return
                  setMessage(null)
                  setReviewed((prev) => ({ ...prev, [currentId]: prev[currentId] ?? 'hard' }))
                  setFlipped(false)
                  setQueue((prev) => {
                    const rest = prev.slice(1)
                    return [...rest, currentId]
                  })
                  const res = await withLoading(
                    fetch('/api/flashcards/review', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deckId, cardId: currentId, known: false })
                    })
                  )
                  if (!res.ok) setMessage('Could not save progress. Try again.')
                  else setReviewed((prev) => ({ ...prev, [currentId]: 'hard' }))
                }}
              >
                Hard
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!currentId) return
                  setMessage(null)
                  setReviewed((prev) => ({ ...prev, [currentId]: prev[currentId] ?? 'good' }))
                  setFlipped(false)
                  setQueue((prev) => prev.slice(1))
                  const res = await withLoading(
                    fetch('/api/flashcards/review', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deckId, cardId: currentId, known: true })
                    })
                  )
                  if (!res.ok) setMessage('Could not save progress. Try again.')
                  else setReviewed((prev) => ({ ...prev, [currentId]: 'good' }))
                }}
              >
                Good
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!currentId) return
                  setMessage(null)
                  setReviewed((prev) => ({ ...prev, [currentId]: prev[currentId] ?? 'easy' }))
                  setFlipped(false)
                  setQueue((prev) => prev.slice(1))
                  const res = await withLoading(
                    fetch('/api/flashcards/review', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deckId, cardId: currentId, known: true })
                    })
                  )
                  if (!res.ok) setMessage('Could not save progress. Try again.')
                  else setReviewed((prev) => ({ ...prev, [currentId]: 'easy' }))
                }}
              >
                Easy
              </Button>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-border bg-card/60 p-4 text-sm text-subtext">
              Flip the card to rate it (Again/Hard/Good/Easy).
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
          Session complete.
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card/70 p-6">
        <div className="font-heading text-2xl text-text">Past results</div>
        <div className="mt-1 text-sm text-subtext">
          Your previous study attempts for this deck.
        </div>
        <div className="mt-4 space-y-2">
          {completions.length === 0 ? (
            <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
              No past results yet. Finish a study session to record one.
            </div>
          ) : (
            completions.slice(0, 20).map((c) => {
              const date = new Date(c.created_at)
              const score =
                typeof c.score_percent === 'number'
                  ? `${c.score_percent}%`
                  : c.correct_count !== null && c.total_count !== null
                    ? `${Math.round((Number(c.correct_count) / Math.max(1, Number(c.total_count))) * 100)}%`
                    : '—'
              const reviewedLabel =
                typeof c.cards_reviewed === 'number'
                  ? `${c.cards_reviewed} cards`
                  : c.total_count !== null
                    ? `${c.total_count} cards`
                    : '—'
              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between gap-2 rounded-3xl border border-border bg-bg/20 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-semibold text-text">
                      {date.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-subtext">{reviewedLabel}</div>
                  </div>
                  <div className="rounded-full bg-card/60 px-4 py-2 text-sm font-semibold text-text ring-1 ring-border">
                    {score}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
