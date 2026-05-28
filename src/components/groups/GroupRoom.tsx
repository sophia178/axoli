'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useLoading } from '@/components/loading/LoadingProvider'
import { GroupChat } from '@/components/groups/GroupChat'
import { cn } from '@/lib/cn'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type Group = {
  id: string
  name: string
  subject: string
  join_code: string
  is_private: boolean
}

type Member = {
  user_id: string
  username: string | null
  coins: number
  streak: number
  role: string
}

type DeckOption = { id: string; title: string; subject: string }
type SharedDeck = { id: string; title: string; subject: string; cardCount: number; creatorUsername: string | null }

type LeaderRow = { user_id: string; username: string | null; hours: number; streak: number; coins: number }

type ChatMessage = { id: string; user_id: string; username: string | null; message: string; created_at: string }

type Tab = 'members' | 'decks' | 'leaderboard' | 'chat'

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase()
}

export function GroupRoom({
  currentUserId,
  currentUsername,
  group,
  role,
  members,
  myDecks,
  sharedDecks,
  leaderboard,
  initialMessages
}: {
  currentUserId: string
  currentUsername: string | null
  group: Group
  role: string
  members: Member[]
  myDecks: DeckOption[]
  sharedDecks: SharedDeck[]
  leaderboard: LeaderRow[]
  initialMessages: ChatMessage[]
}) {
  const { withLoading } = useLoading()
  const [tab, setTab] = useState<Tab>('members')
  const [message, setMessage] = useState<string | null>(null)
  const [shareDeckId, setShareDeckId] = useState<string>(myDecks[0]?.id ?? '')
  const [onlineIds, setOnlineIds] = useState<Set<string>>(() => new Set())

  const memberCount = members.length
  const isAdmin = role === 'admin'

  const sortedMembers = useMemo(() => {
    const list = [...members]
    const weight = (r: string) => (r === 'admin' ? 2 : r === 'moderator' ? 1 : 0)
    list.sort((a, b) => weight(b.role) - weight(a.role))
    return list
  }, [members])

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) return

    const channel = client.channel(`presence:${group.id}`, {
      config: { presence: { key: currentUserId } }
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, any[]>
      const ids = new Set<string>()
      for (const key of Object.keys(state)) ids.add(key)
      setOnlineIds(ids)
    })

    void channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track({ user_id: currentUserId, username: currentUsername })
    })

    return () => {
      void client.removeChannel(channel)
    }
  }, [group.id, currentUserId, currentUsername])

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="font-heading text-xl text-text sm:text-3xl">{group.name}</div>
            <div className="mt-2 text-sm text-subtext">
              {group.subject} • {memberCount} members • {group.is_private ? 'Private' : 'Public'}
            </div>
            {isAdmin ? (
              <div className="mt-3 inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                Join code: {group.join_code}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['members', 'decks', 'leaderboard', 'chat'] as Tab[]).map((t) => (
              <Button
                key={t}
                type="button"
                variant={tab === t ? 'secondary' : 'outline'}
                onClick={() => {
                  setTab(t)
                  setMessage(null)
                }}
              >
                {t === 'members'
                  ? 'Members'
                  : t === 'decks'
                    ? 'Decks'
                    : t === 'leaderboard'
                      ? 'Leaderboard'
                      : 'Chat'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}

      {tab === 'members' ? (
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {sortedMembers.map((m) => (
                <div key={m.user_id} className="rounded-3xl border border-border bg-bg/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink/15 text-sm font-semibold text-text ring-1 ring-pink/25">
                        {initials(m.username ?? 'User')}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text">
                          {m.username ?? 'Unknown'}
                        </div>
                        <div className="mt-1 text-xs text-subtext">
                          Role: {m.role} • Online: {onlineIds.has(m.user_id) ? 'online' : 'offline'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-subtext">Streak</div>
                      <div className="font-heading text-lg text-text">{m.streak}🔥</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-subtext">
                    <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                      {m.coins} coins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'decks' ? (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Shared decks</CardTitle>
            </CardHeader>
            <CardContent>
              {sharedDecks.length === 0 ? (
                <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
                  No decks shared yet.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {sharedDecks.map((d) => (
                    <div key={d.id} className="rounded-3xl border border-border bg-bg/20 p-4">
                      <div className="font-semibold text-text">{d.title}</div>
                      <div className="mt-1 text-sm text-subtext">{d.subject}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-subtext">
                        <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                          {d.cardCount} cards
                        </span>
                        <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                          by {d.creatorUsername ?? 'Unknown'}
                        </span>
                      </div>
                      <div className="mt-4">
                        <a
                          href={`/dashboard/flashcards/${d.id}`}
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm font-semibold text-text hover:bg-card/80"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add deck from my library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-subtext">
                Share one of your decks to this group.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={shareDeckId}
                  onChange={(e) => setShareDeckId(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
                >
                  {myDecks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} — {d.subject}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  disabled={!shareDeckId}
                  onClick={async () => {
                    setMessage(null)
                    const res = await withLoading(
                      fetch(`/api/groups/${group.id}/decks/share`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deckId: shareDeckId })
                      })
                    )
                    if (!res.ok) {
                      setMessage('Could not share deck.')
                      return
                    }
                    setMessage('Deck shared!')
                    window.location.reload()
                  }}
                >
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === 'leaderboard' ? (
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
              Ranked by coins.
            </div>
            <div className="mt-4 space-y-2">
              {leaderboard.map((row, i) => (
                <div
                  key={row.user_id}
                  className={cn(
                    'flex flex-col justify-between gap-2 rounded-3xl border border-border bg-bg/20 p-4 sm:flex-row sm:items-center',
                    i === 0 && 'ring-1 ring-gold/25'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-sm font-semibold text-gold ring-1 ring-gold/25">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text">{row.username ?? 'Unknown'}</div>
                      <div className="mt-1 text-xs text-subtext">
                        {row.streak}🔥 • {row.hours}h this week
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-card/60 px-4 py-2 text-sm font-semibold text-text ring-1 ring-border">
                    {row.coins} coins
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'chat' ? (
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupChat groupId={group.id} initialMessages={initialMessages} />
          </CardContent>
        </Card>
      ) : null}

      {tab === 'chat' ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-xs text-subtext">
          Realtime chat uses Supabase realtime when NEXT_PUBLIC_SUPABASE_ANON_KEY is set; otherwise it falls back to polling.
        </div>
      ) : null}

      {tab !== 'chat' ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-xs text-subtext">
          Tip: share decks in the Decks tab to make them appear in “Shared with me” on Flashcards.
        </div>
      ) : null}
    </div>
  )
}
