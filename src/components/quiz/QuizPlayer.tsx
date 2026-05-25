'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'

type Card = { id: string; front: string; back: string }

export function QuizPlayer({ title, cards }: { title: string; cards: Card[] }) {
  const [idx, setIdx] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))
  const [claimed, setClaimed] = useState(false)
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()

  const current = cards[idx]
  const progress = useMemo(() => {
    if (cards.length === 0) return 0
    return Math.round(((idx + 1) / cards.length) * 100)
  }, [idx, cards.length])

  useEffect(() => {
    setVisited((prev) => new Set(prev).add(idx))
  }, [idx])

  const completed = visited.size === cards.length

  useEffect(() => {
    if (!completed || claimed) return
    void (async () => {
      const res = await withLoading(
        fetch('/api/coins/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 5, reason: 'deck_complete' })
        })
      )
      const json = (await res.json().catch(() => null)) as any
      if (res.ok) {
        showCoins(Number(json?.coinsAwarded ?? 5))
        setClaimed(true)
      }
    })()
  }, [completed, claimed, withLoading, showCoins])

  if (cards.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
        No cards found. Create a deck first.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-heading text-2xl text-text">{title}</div>
          <div className="mt-1 text-sm text-subtext">
            Card {idx + 1} of {cards.length} • {progress}%
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIdx((i) => (i - 1 + cards.length) % cards.length)
              setReveal(false)
            }}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setIdx((i) => (i + 1) % cards.length)
              setReveal(false)
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => setReveal((v) => !v)}
        className="w-full rounded-3xl border border-border bg-card/70 p-6 text-left"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="text-xs text-subtext">{reveal ? 'Back' : 'Front'}</div>
        <div className="mt-2 text-lg font-semibold text-text">
          {reveal ? current.back : current.front}
        </div>
        <div className="mt-4 text-sm text-subtext">
          Tap to {reveal ? 'hide answer' : 'reveal answer'}
        </div>
      </motion.button>

      <div className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-border bg-bg/20 p-4 sm:flex-row sm:items-center">
        <div className="text-sm text-subtext">
          {completed ? 'Deck completed 🎉' : `Visited ${visited.size} / ${cards.length} cards`}
        </div>
        <Button
          variant="secondary"
          disabled
        >
          {claimed ? 'Deck coins added' : completed ? 'Adding coins…' : 'Finish the deck'}
        </Button>
      </div>
    </div>
  )
}
