'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'
import { useDoubleCoins } from '@/hooks/useDoubleCoins'
import { cn } from '@/lib/cn'

type Task = {
  id: string
  title: string
  subject: string
  estimated_minutes: number
  scheduled_date: string
  completed_at: string | null
}

type RevisionItem = {
  key: string
  examId: string
  examName: string
  subject: string
  date: string
  completed: boolean
}

type AiPlanDay = {
  date: string
  items: Array<{ title: string; subject: string }>
}

function colourForSubject(subject: string) {
  const s = subject.toLowerCase()
  if (s.includes('bio')) return '#7AE7B9'
  if (s.includes('chem')) return '#FFD700'
  if (s.includes('phys')) return '#7C5CFF'
  if (s.includes('math')) return '#FF8FAB'
  if (s.includes('history')) return '#FFB86B'
  if (s.includes('psych')) return '#8BE9FD'
  return '#8888AA'
}

export function PlannerBoard({ revision }: { revision: RevisionItem[] }) {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptDouble, modal } = useDoubleCoins()

  const [tasks, setTasks] = useState<Task[]>([])
  const [today, setToday] = useState<string>('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [minutes, setMinutes] = useState(25)
  const [message, setMessage] = useState<string | null>(null)

  const [rev, setRev] = useState<RevisionItem[]>(revision)
  const [aiPlan, setAiPlan] = useState<AiPlanDay[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    void (async () => {
      const res = await withLoading(fetch('/api/planner/tasks'))
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        setMessage('Could not load tasks.')
        return
      }
      setToday(String(json?.today ?? ''))
      setTasks((json?.tasks ?? []) as Task[])
    })()
  }, [withLoading])

  const sortedTasks = useMemo(() => {
    const list = [...tasks]
    list.sort((a, b) => Number(Boolean(a.completed_at)) - Number(Boolean(b.completed_at)))
    return list
  }, [tasks])

  const upcomingRevision = useMemo(() => {
    const list = [...rev]
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    return list
  }, [rev])

  return (
    <div className="space-y-5">
      {modal}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
              {message}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-sm text-subtext">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 20 flashcards" />
            </div>
            <div>
              <div className="text-sm text-subtext">Subject</div>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" />
            </div>
            <div>
              <div className="text-sm text-subtext">Estimated time (min)</div>
              <Input
                type="number"
                min={5}
                max={600}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              disabled={!title.trim() || !subject.trim()}
              onClick={async () => {
                setMessage(null)
                const res = await withLoading(
                  fetch('/api/planner/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: title.trim(),
                      subject: subject.trim(),
                      estimatedMinutes: minutes
                    })
                  })
                )
                const json = (await res.json().catch(() => null)) as any
                if (!res.ok) {
                  setMessage('Could not add task.')
                  return
                }
                setTasks((prev) => [...prev, json.task as Task])
                setTitle('')
              }}
            >
              Add task
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
            Incomplete tasks carry over automatically. Today: {today || '—'}
          </div>

          <div className="space-y-2">
            {sortedTasks.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-subtext">
                No tasks yet. Add one above.
              </div>
            ) : null}
            {sortedTasks.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'flex flex-col justify-between gap-2 rounded-3xl border border-border bg-bg/20 p-4 sm:flex-row sm:items-center',
                  t.completed_at && 'border-success/25'
                )}
              >
                <div>
                  <div className={cn('text-sm font-semibold text-text', t.completed_at && 'line-through text-success')}>
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-subtext">
                    {t.subject} • {t.estimated_minutes} min
                  </div>
                </div>
                <Button
                  variant={t.completed_at ? 'outline' : 'secondary'}
                  disabled={Boolean(t.completed_at)}
                  onClick={async () => {
                    setMessage(null)
                    const res = await withLoading(
                      fetch('/api/planner/tasks/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ taskId: t.id })
                      })
                    )
                    const json = (await res.json().catch(() => null)) as any
                    if (!res.ok) {
                      setMessage('Could not complete task.')
                      return
                    }
                    setTasks((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, completed_at: new Date().toISOString() } : x))
                    )
                    const coinsAwarded = Number(json?.coinsAwarded ?? 0)
                    if (coinsAwarded > 0) {
                      showCoins(coinsAwarded)
                      await promptDouble({ coinsEarned: coinsAwarded, reason: 'planner_task' })
                    }
                  }}
                >
                  {t.completed_at ? 'Completed' : 'Mark complete (+2 coins)'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revision schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-subtext">
            Auto-generated from your exam countdowns.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-subtext">
              Want a smarter plan? Generate a focused schedule.
            </div>
            <Button
              variant="secondary"
              disabled={aiLoading}
              onClick={async () => {
                setMessage(null)
                setAiLoading(true)
                const res = await withLoading(fetch('/api/planner/revision/generate', { method: 'POST' }))
                const json = (await res.json().catch(() => null)) as any
                if (!res.ok) {
                  setMessage(
                    json?.error === 'ai_failed' && typeof json?.message === 'string'
                      ? json.message
                      : 'Could not generate an AI revision plan.'
                  )
                  const fb = Array.isArray(json?.fallback) ? (json.fallback as AiPlanDay[]) : null
                  setAiPlan(fb)
                  setAiLoading(false)
                  return
                }
                setAiPlan((json?.plan ?? null) as AiPlanDay[] | null)
                setAiLoading(false)
              }}
            >
              {aiLoading ? 'Generating…' : 'Generate AI revision plan'}
            </Button>
          </div>
          {upcomingRevision.length === 0 ? (
            <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
              No upcoming exams. Add one in Exam Countdown.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingRevision.map((r) => (
                <div
                  key={r.key}
                  className={cn(
                    'flex flex-col justify-between gap-2 rounded-3xl border border-border bg-bg/20 p-4 sm:flex-row sm:items-center',
                    r.completed && 'border-success/25'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: colourForSubject(r.subject) }}
                    />
                    <div>
                      <div className={cn('text-sm font-semibold text-text', r.completed && 'text-success')}>
                        Revise {r.subject} — {r.examName}
                      </div>
                      <div className="mt-1 text-xs text-subtext">{r.date}</div>
                    </div>
                  </div>
                  <Button
                    variant={r.completed ? 'outline' : 'secondary'}
                    disabled={r.completed}
                    onClick={async () => {
                      setMessage(null)
                      const res = await withLoading(
                        fetch('/api/planner/revision/complete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ examId: r.examId, date: r.date })
                        })
                      )
                      if (!res.ok) {
                        setMessage('Could not mark revision complete.')
                        return
                      }
                      setRev((prev) => prev.map((x) => (x.key === r.key ? { ...x, completed: true } : x)))
                    }}
                  >
                    {r.completed ? 'Completed' : 'Mark complete'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {aiPlan && aiPlan.length > 0 ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl border border-gold/30 bg-gold/10 p-4 text-sm text-text">
                AI plan generated. Adjust as needed and keep your streak alive.
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {aiPlan.slice(0, 14).map((d) => (
                  <div key={d.date} className="rounded-3xl border border-border bg-bg/20 p-4">
                    <div className="text-sm font-semibold text-text">{d.date}</div>
                    <div className="mt-2 space-y-2">
                      {(d.items ?? []).slice(0, 3).map((it) => (
                        <div key={it.title} className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-text">
                          <div className="text-xs text-subtext">{it.subject}</div>
                          <div className="mt-1">{it.title}</div>
                        </div>
                      ))}
                      {(d.items ?? []).length === 0 ? (
                        <div className="text-sm text-subtext">Rest day</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
