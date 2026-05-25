'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'

export function GroupsManager() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { withLoading } = useLoading()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-bg/20 p-4">
        <div className="font-semibold text-text">Create a group</div>
        <div className="mt-1 text-sm text-subtext">
          Get a join code and invite friends.
        </div>
        <div className="mt-4 space-y-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <Button
            variant="secondary"
            disabled={!name.trim() || !subject.trim() || loading}
            onClick={async () => {
              setLoading(true)
              setMessage(null)
              const res = await withLoading(
                fetch('/api/groups', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'create',
                    name: name.trim(),
                    subject: subject.trim()
                  })
                })
              )
              if (!res.ok) {
                setMessage('Could not create group.')
                setLoading(false)
                return
              }
              setName('')
              setSubject('')
              setMessage('Group created!')
              router.refresh()
              setLoading(false)
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-bg/20 p-4">
        <div className="font-semibold text-text">Join with code</div>
        <div className="mt-1 text-sm text-subtext">
          Ask a friend for their group code.
        </div>
        <div className="mt-4 space-y-2">
          <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. 9K2XQF" />
          <Button
            disabled={!joinCode.trim() || loading}
            onClick={async () => {
              setLoading(true)
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
                setLoading(false)
                return
              }
              setJoinCode('')
              setMessage('Joined!')
              router.refresh()
              setLoading(false)
            }}
          >
            Join
          </Button>
        </div>
      </div>

      {message ? (
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}
    </div>
  )
}
