'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { DeckSummary } from '@/lib/data/flashcards'

type Tab = 'my' | 'discover' | 'shared'

const subjects = [
  'All',
  'Biology',
  'Chemistry',
  'Physics',
  'Maths',
  'History',
  'Psychology',
  'English',
  'Geography',
  'Computer Science',
  'Economics',
  'Other'
] as const

function formatDate(input: string | null) {
  if (!input) return 'Never'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

export function FlashcardsHub({ initialMyDecks }: { initialMyDecks: DeckSummary[] }) {
  const router = useRouter()
  const { withLoading } = useLoading()

  const [tab, setTab] = useState<Tab>('my')
  const [myDecks, setMyDecks] = useState<DeckSummary[]>(initialMyDecks)
  const [discover, setDiscover] = useState<DeckSummary[] | null>(null)
  const [shared, setShared] = useState<DeckSummary[] | null>(null)

  const [subject, setSubject] = useState<(typeof subjects)[number]>('All')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editDeck, setEditDeck] = useState<DeckSummary | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editPublic, setEditPublic] = useState(false)

  const discoverFiltered = useMemo(() => discover ?? [], [discover])
  const sharedFiltered = useMemo(() => shared ?? [], [shared])

  async function loadDiscover() {
    const url = new URL('/api/flashcards/discover', window.location.origin)
    if (subject && subject !== 'All') url.searchParams.set('subject', subject)
    if (query.trim()) url.searchParams.set('q', query.trim())
    const res = await withLoading(fetch(url.toString()))
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) {
      setMessage('Could not load public decks.')
      return
    }
    setDiscover(json.decks ?? [])
  }

  async function loadShared() {
    const res = await withLoading(fetch('/api/flashcards/shared'))
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) {
      setMessage('Could not load shared decks.')
      return
    }
    setShared(json.decks ?? [])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card/70 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-heading text-3xl text-text">Flashcards</div>
          <div className="mt-2 text-sm text-subtext">
            Review decks, discover public sets, and study what your groups share.
          </div>
        </div>
        <Link href="/dashboard/flashcards/create">
          <Button>Create New Deck</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'my' ? 'secondary' : 'outline'}
          onClick={() => {
            setTab('my')
            setMessage(null)
          }}
        >
          My Decks
        </Button>
        <Button
          type="button"
          variant={tab === 'discover' ? 'secondary' : 'outline'}
          onClick={async () => {
            setTab('discover')
            setMessage(null)
            if (discover === null) await loadDiscover()
          }}
        >
          Discover
        </Button>
        <Button
          type="button"
          variant={tab === 'shared' ? 'secondary' : 'outline'}
          onClick={async () => {
            setTab('shared')
            setMessage(null)
            if (shared === null) await loadShared()
          }}
        >
          Shared with me
        </Button>
      </div>

      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}

      {tab === 'my' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {myDecks.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="p-6">
                <div className="text-sm text-subtext">
                  No decks yet — generate some with AI or create manually
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href="/dashboard/generate">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Generate with AI
                    </Button>
                  </Link>
                  <Link href="/dashboard/flashcards/create">
                    <Button className="w-full sm:w-auto">Create manually</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {myDecks.map((deck) => (
            <Card key={deck.id}>
              <CardHeader>
                <CardTitle>{deck.title}</CardTitle>
                <div className="mt-1 text-sm text-subtext">{deck.subject}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-subtext">
                  <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                    {deck.cardCount} cards
                  </span>
                  <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                    Last studied: {formatDate(deck.lastStudiedAt)}
                  </span>
                  {deck.is_public ? (
                    <span className="rounded-full bg-pink/15 px-3 py-1 font-semibold text-pink ring-1 ring-pink/25">
                      Public
                    </span>
                  ) : (
                    <span className="rounded-full bg-card/60 px-3 py-1 font-semibold text-subtext ring-1 ring-border">
                      Private
                    </span>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Link href={`/dashboard/flashcards/${deck.id}`}>
                    <Button variant="secondary" className="w-full">
                      Study
                    </Button>
                  </Link>
                  <Link href={`/dashboard/quiz?deck=${deck.id}`}>
                    <Button className="w-full">Quiz</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditDeck(deck)
                      setEditTitle(deck.title)
                      setEditSubject(deck.subject)
                      setEditPublic(deck.is_public)
                      setEditOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={async () => {
                      const ok = window.confirm('Delete this deck?')
                      if (!ok) return
                      const res = await withLoading(
                        fetch(`/api/flashcards/decks/${deck.id}`, { method: 'DELETE' })
                      )
                      if (!res.ok) {
                        setMessage('Could not delete deck.')
                        return
                      }
                      setMyDecks((prev) => prev.filter((d) => d.id !== deck.id))
                      router.refresh()
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === 'discover' ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-sm text-subtext">Subject</div>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-subtext">Search by title</div>
              <div className="mt-2 flex gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Photosynthesis" />
                <Button variant="secondary" onClick={() => void loadDiscover()}>
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {discoverFiltered.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext md:col-span-2 xl:col-span-3">
                No public decks found.
              </div>
            ) : null}
            {discoverFiltered.map((deck) => (
              <Card key={deck.id}>
                <CardHeader>
                  <CardTitle>{deck.title}</CardTitle>
                  <div className="mt-1 text-sm text-subtext">{deck.subject}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-subtext">
                    <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                      {deck.cardCount} cards
                    </span>
                    <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                      by {deck.creatorUsername ?? 'Unknown'}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      const res = await withLoading(
                        fetch('/api/flashcards/clone', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ deckId: deck.id })
                        })
                      )
                      const json = (await res.json().catch(() => null)) as any
                      if (!res.ok) {
                        setMessage('Could not clone deck.')
                        return
                      }
                      router.push(`/dashboard/flashcards/${json.deckId}`)
                      router.refresh()
                    }}
                  >
                    Clone
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'shared' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sharedFiltered.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext md:col-span-2 xl:col-span-3">
              No shared decks yet.
            </div>
          ) : null}
          {sharedFiltered.map((deck) => (
            <Card key={deck.id}>
              <CardHeader>
                <CardTitle>{deck.title}</CardTitle>
                <div className="mt-1 text-sm text-subtext">{deck.subject}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-subtext">
                  <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                    {deck.cardCount} cards
                  </span>
                  <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                    by {deck.creatorUsername ?? 'Unknown'}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link href={`/dashboard/flashcards/${deck.id}`}>
                    <Button variant="secondary" className="w-full">
                      Study
                    </Button>
                  </Link>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      const res = await withLoading(
                        fetch('/api/flashcards/clone', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ deckId: deck.id })
                        })
                      )
                      const json = (await res.json().catch(() => null)) as any
                      if (!res.ok) {
                        setMessage('Could not clone deck.')
                        return
                      }
                      router.push(`/dashboard/flashcards/${json.deckId}`)
                      router.refresh()
                    }}
                  >
                    Clone
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {editOpen && editDeck ? (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-bg/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card/90 p-5">
            <div className="font-heading text-2xl text-text">Edit deck</div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm text-subtext">Title</div>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <div className="text-sm text-subtext">Subject</div>
                <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
              </div>
              <button
                type="button"
                onClick={() => setEditPublic((v) => !v)}
                className="flex w-full items-center justify-between gap-4 rounded-3xl border border-border bg-bg/20 px-5 py-4 text-left"
                aria-pressed={editPublic}
              >
                <div>
                  <div className="text-sm font-semibold text-text">
                    Share publicly so others can discover this deck
                  </div>
                  <div className="mt-1 text-xs text-subtext">
                    Turn on to show your deck in Discover.
                  </div>
                </div>
                <div
                  className={`relative h-7 w-12 rounded-full ring-1 ring-border transition ${editPublic ? 'bg-pink/40' : 'bg-bg/30'}`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-sm transition ${editPublic ? 'left-6' : 'left-1'}`}
                  />
                </div>
              </button>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false)
                    setEditDeck(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const res = await withLoading(
                      fetch(`/api/flashcards/decks/${editDeck.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: editTitle.trim(),
                          subject: editSubject.trim(),
                          isPublic: editPublic
                        })
                      })
                    )
                    if (!res.ok) {
                      setMessage('Could not update deck.')
                      return
                    }
                    setMyDecks((prev) =>
                      prev.map((d) =>
                        d.id === editDeck.id
                          ? {
                              ...d,
                              title: editTitle.trim(),
                              subject: editSubject.trim(),
                              is_public: editPublic
                            }
                          : d
                      )
                    )
                    setEditOpen(false)
                    setEditDeck(null)
                    router.refresh()
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
