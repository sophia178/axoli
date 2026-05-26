'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'

type DraftCard = { front: string; back: string }

export function CreateDeckForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [cards, setCards] = useState<DraftCard[]>([{ front: '', back: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { withLoading } = useLoading()

  const canSave = useMemo(() => {
    if (!title.trim() || !subject.trim()) return false
    const validCards = cards.filter((c) => c.front.trim() && c.back.trim())
    return validCards.length > 0
  }, [title, subject, cards])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-subtext">Deck title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis" />
        </div>
        <div>
          <div className="text-sm text-subtext">Subject</div>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsPublic((v) => !v)}
        className="flex w-full items-center justify-between gap-4 rounded-3xl border border-border bg-bg/20 px-5 py-4 text-left"
        aria-pressed={isPublic}
      >
        <div>
          <div className="text-sm font-semibold text-text">
            Share publicly so others can discover this deck
          </div>
          <div className="mt-1 text-xs text-subtext">
            Turn on to show your deck in Discover (you can change this later).
          </div>
        </div>
        <div
          className={`relative h-7 w-12 rounded-full ring-1 ring-border transition ${isPublic ? 'bg-pink/40' : 'bg-bg/30'}`}
        >
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-sm transition ${isPublic ? 'left-6' : 'left-1'}`}
          />
        </div>
      </button>

      <div className="space-y-3">
        {cards.map((card, idx) => (
          <div key={idx} className="grid gap-3 rounded-3xl border border-border bg-bg/20 p-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-subtext">Front</div>
              <Input
                value={card.front}
                onChange={(e) =>
                  setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, front: e.target.value } : c)))
                }
                placeholder="Question / prompt"
              />
            </div>
            <div>
              <div className="text-sm text-subtext">Back</div>
              <Input
                value={card.back}
                onChange={(e) =>
                  setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, back: e.target.value } : c)))
                }
                placeholder="Answer"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <div className="text-xs text-subtext">Card {idx + 1}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCards((prev) => prev.filter((_, i) => i !== idx))}
                disabled={cards.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCards((prev) => [...prev, { front: '', back: '' }])}
        >
          Add card
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {error ? (
            <div className="rounded-2xl border border-pink/25 bg-pink/10 px-4 py-2 text-sm text-text">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-2 text-sm text-text">
              {success}
            </div>
          ) : null}
          <Button
            type="button"
            disabled={!canSave || saving}
            onClick={async () => {
              setSaving(true)
              setError(null)
              setSuccess(null)
              try {
                const payload = {
                  title: title.trim(),
                  subject: subject.trim(),
                  isPublic,
                  cards: cards
                    .filter((c) => c.front.trim() && c.back.trim())
                    .map((c) => ({ front: c.front.trim(), back: c.back.trim() }))
                }
                const res = await withLoading(
                  fetch('/api/flashcards/decks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  })
                )
                const json = (await res.json().catch(() => null)) as any
                if (!res.ok || !json?.deckId) {
                  setError('Could not save deck. Try again.')
                  return
                }
                setSuccess('Deck saved!')
                window.setTimeout(() => {
                  router.push('/dashboard/flashcards')
                  router.refresh()
                }, 650)
              } catch {
                setError('Could not save deck. Try again.')
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Saving…' : 'Save deck'}
          </Button>
        </div>
      </div>
    </div>
  )
}
