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

export function DeckStudy({
  deckId,
  title,
  subject,
  cards
}: {
  deckId: string
  title: string
  subject: string
  cards: Card[]
}) {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptDouble, modal } = useDoubleCoins()

  const allIds = useMemo(() => cards.map((c) => c.id), [cards])
  const [queue, setQueue] = useState<string[]>(() => shuffle(allIds))
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Record<string, boolean | null>>(() => {
    const o: Record<string, boolean | null> = {}
    for (const id of allIds) o[id] = null
    return o
  })
  const [completionSent, setCompletionSent] = useState(false)

  const currentId = queue[0] ?? null
  const current = currentId ? cards.find((c) => c.id === currentId) ?? null : null

  const reviewedCount = useMemo(
    () => Object.values(reviewed).filter((v) => v !== null).length,
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
            body: JSON.stringify({ deckId })
          })
        )
        const json = (await res.json().catch(() => null)) as any
        const coinsAwarded = Number(json?.coinsAwarded ?? 0)
        if (res.ok && coinsAwarded > 0) {
          showCoins(coinsAwarded)
          await promptDouble({ coinsEarned: coinsAwarded, reason: 'deck_complete' })
        }
        setCompletionSent(true)
      })()
    }, 350)
  }, [completionSent, cards.length, reviewedCount, deckId, withLoading, showCoins, promptDouble])

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

      {current ? (
        <div className="rounded-3xl border border-border bg-bg/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-subtext">
              Card {cards.findIndex((c) => c.id === current.id) + 1} / {cards.length}
            </div>
            <div className="rounded-full bg-card/60 px-3 py-1 text-xs font-semibold text-subtext ring-1 ring-border">
              {reviewed[current.id] === null ? 'New' : reviewed[current.id] ? 'Known' : 'Unknown'}
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
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="rounded-3xl border border-border bg-card/70 p-6"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-xs text-subtext">Front</div>
                  <div className="mt-2 text-xl font-semibold text-text">{current.front}</div>
                  <div className="mt-4 text-sm text-subtext">Tap to flip</div>
                </div>
                <div
                  className="absolute inset-0 rounded-3xl border border-border bg-card/70 p-6"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-xs text-subtext">Back</div>
                  <div className="mt-2 text-xl font-semibold text-text">{current.back}</div>
                  <div className="mt-4 text-sm text-subtext">Tap to flip</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={async () => {
                if (!currentId) return
                setReviewed((prev) => ({ ...prev, [currentId]: true }))
                setFlipped(false)
                setQueue((prev) => prev.slice(1))
                await withLoading(
                  fetch('/api/flashcards/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deckId, cardId: currentId, known: true })
                  })
                )
              }}
            >
              Known
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!currentId) return
                setReviewed((prev) => ({ ...prev, [currentId]: false }))
                setFlipped(false)
                setQueue((prev) => {
                  const rest = prev.slice(1)
                  return [...rest, currentId, currentId]
                })
                await withLoading(
                  fetch('/api/flashcards/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deckId, cardId: currentId, known: false })
                  })
                )
              }}
            >
              Unknown
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
          Session complete.
        </div>
      )}
    </div>
  )
}
