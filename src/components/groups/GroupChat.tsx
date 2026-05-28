'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type ChatMessage = { id: string; user_id: string; username: string | null; message: string; created_at: string }

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function GroupChat({
  groupId,
  initialMessages
}: {
  groupId: string
  initialMessages: ChatMessage[]
}) {
  const { withLoading } = useLoading()

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const lastCreatedAt = useMemo(() => messages[messages.length - 1]?.created_at ?? null, [messages])
  const scroller = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages.length])

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) return

    const channel = client
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          void (async () => {
            const url = new URL(`/api/groups/${groupId}/chat`, window.location.origin)
            if (lastCreatedAt) url.searchParams.set('since', lastCreatedAt)
            const res = await fetch(url.toString())
            const json = (await res.json().catch(() => null)) as any
            if (!res.ok) return
            const next = (json?.messages ?? []) as any[]
            if (!next.length) return
            setMessages((prev) => {
              const existing = new Set(prev.map((m) => m.id))
              const add = next
                .filter((m) => m?.id && !existing.has(m.id))
                .map((m) => ({
                  id: m.id as string,
                  user_id: m.user_id as string,
                  username: (m.username as string | null) ?? null,
                  message: m.message as string,
                  created_at: m.created_at as string
                }))
              return add.length ? [...prev, ...add] : prev
            })
          })()
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [groupId, lastCreatedAt])

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (client) return
    const id = setInterval(() => {
      void (async () => {
        const url = new URL(`/api/groups/${groupId}/chat`, window.location.origin)
        if (lastCreatedAt) url.searchParams.set('since', lastCreatedAt)
        const res = await fetch(url.toString())
        const json = (await res.json().catch(() => null)) as any
        if (!res.ok) return
        const next = (json?.messages ?? []) as any[]
        if (!next.length) return
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id))
          const add = next
            .filter((m) => m?.id && !existing.has(m.id))
            .map((m) => ({
              id: m.id as string,
              user_id: m.user_id as string,
              username: (m.username as string | null) ?? null,
              message: m.message as string,
              created_at: m.created_at as string
            }))
          return add.length ? [...prev, ...add] : prev
        })
      })()
    }, 2500)
    return () => clearInterval(id)
  }, [groupId, lastCreatedAt])

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-3xl border border-pink/25 bg-pink/10 p-4 text-sm text-text">
          {error}
        </div>
      ) : null}

      <div
        ref={scroller}
        className="h-52 overflow-y-auto rounded-3xl border border-border bg-bg/20 p-4 sm:h-[360px]"
      >
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-sm text-subtext">No messages yet. Say hi.</div>
          ) : null}
          {messages.map((m) => (
            <div key={m.id} className="rounded-3xl border border-border bg-card/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-text">{m.username ?? 'Member'}</div>
                <div className="text-xs text-subtext">{formatTime(m.created_at)}</div>
              </div>
              <div className="mt-2 text-sm text-subtext">{m.message}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
        />
        <Button
          variant="secondary"
          disabled={!text.trim()}
          onClick={async () => {
            setError(null)
            const content = text.trim()
            setText('')
            const res = await withLoading(
              fetch(`/api/groups/${groupId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content })
              })
            )
            const json = (await res.json().catch(() => null)) as any
            if (!res.ok) {
              setError('Could not send message.')
              setText(content)
              return
            }
            const msg = json?.message
            if (msg?.id) {
              setMessages((prev) => [
                ...prev,
                {
                  id: msg.id as string,
                  user_id: msg.user_id as string,
                  username: (msg.username as string | null) ?? null,
                  message: msg.message as string,
                  created_at: msg.created_at as string
                }
              ])
            }
          }}
        >
          Send
        </Button>
      </div>
    </div>
  )
}
