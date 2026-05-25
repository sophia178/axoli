'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { MyGroupCard } from '@/lib/data/groups'

const subjects = [
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

export function GroupsHub({ initialGroups }: { initialGroups: MyGroupCard[] }) {
  const router = useRouter()
  const { withLoading } = useLoading()

  const [groups, setGroups] = useState<MyGroupCard[]>(initialGroups)
  const [message, setMessage] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState<(typeof subjects)[number]>('Biology')
  const [isPrivate, setIsPrivate] = useState(false)

  const [joinCode, setJoinCode] = useState('')

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card/70 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-heading text-3xl text-text">Study Groups</div>
          <div className="mt-2 text-sm text-subtext">
            Study together, share decks, and compete on the leaderboard.
          </div>
        </div>
        <Button variant="secondary" onClick={() => setCreateOpen(true)}>
          Create group
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
                You&apos;re not in any groups yet. Create one or join with a code.
              </div>
            ) : (
              <div className="grid gap-3">
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    href={`/dashboard/groups/${g.id}`}
                    className="rounded-3xl border border-border bg-bg/20 p-4 transition hover:bg-bg/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-text">{g.name}</div>
                        <div className="mt-1 text-sm text-subtext">{g.subject}</div>
                      </div>
                      <div className="rounded-full bg-card/60 px-3 py-1 text-xs font-semibold text-subtext ring-1 ring-border">
                        {g.role}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-subtext">
                      <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                        {g.memberCount} members
                      </span>
                      <span className="rounded-full bg-bg/30 px-3 py-1 ring-1 ring-border">
                        {g.is_private ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {message ? (
              <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
                {message}
              </div>
            ) : null}
            <div className="text-sm text-subtext">Enter join code</div>
            <div className="flex gap-2">
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. 9K2XQF" />
              <Button
                disabled={!joinCode.trim()}
                onClick={async () => {
                  setMessage(null)
                  const res = await withLoading(
                    fetch('/api/groups', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'join', joinCode: joinCode.trim() })
                    })
                  )
                  const json = (await res.json().catch(() => null)) as any
                  if (!res.ok) {
                    setMessage(json?.error === 'not_found' ? 'Group not found.' : 'Could not join group.')
                    return
                  }
                  router.push(`/dashboard/groups/${json.groupId}`)
                  router.refresh()
                }}
              >
                Join
              </Button>
            </div>
            <div className="text-xs text-subtext">
              Tip: admins can see the code inside the group page.
            </div>
          </CardContent>
        </Card>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-bg/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card/90 p-5">
            <div className="font-heading text-2xl text-text">Create group</div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm text-subtext">Group name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A-level Bio Crew" />
              </div>
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
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-bg/20 px-4 py-3 text-sm text-text">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Privacy (public/private)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  disabled={!name.trim()}
                  onClick={async () => {
                    setMessage(null)
                    const res = await withLoading(
                      fetch('/api/groups', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'create',
                          name: name.trim(),
                          subject,
                          isPrivate
                        })
                      })
                    )
                    const json = (await res.json().catch(() => null)) as any
                    if (!res.ok) {
                      setMessage('Could not create group.')
                      return
                    }
                    setCreateOpen(false)
                    setName('')
                    setIsPrivate(false)
                    router.push(`/dashboard/groups/${json.groupId}`)
                    router.refresh()
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

