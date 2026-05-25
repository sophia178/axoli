'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'
import { useDoubleCoins } from '@/hooks/useDoubleCoins'

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function StudyTimer() {
  const [durationMin, setDurationMin] = useState(25)
  const [subject, setSubject] = useState('')
  const [remaining, setRemaining] = useState(durationMin * 60)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptDouble, modal } = useDoubleCoins()

  const durationSeconds = useMemo(
    () => Math.max(1, Math.round(durationMin)) * 60,
    [durationMin]
  )

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  const prevDuration = useRef(durationSeconds)
  useEffect(() => {
    if (running) return
    if (prevDuration.current !== durationSeconds) {
      setRemaining(durationSeconds)
      prevDuration.current = durationSeconds
    }
  }, [durationSeconds, running])

  useEffect(() => {
    if (remaining !== 0) return
    if (!running) return
    setRunning(false)
    void (async () => {
      setSaving(true)
      setResult(null)
      try {
        const res = await withLoading(
          fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              durationSeconds: durationSeconds,
              subject: subject.trim() ? subject.trim() : undefined
            })
          })
        )
        const json = (await res.json().catch(() => null)) as any
        if (!res.ok) {
          setResult('Could not save session. Try again.')
          return
        }
        const earned = Number(json?.coinsEarned ?? 0)
        if (earned > 0) {
          showCoins(earned)
          try {
            await promptDouble({ coinsEarned: earned, reason: 'study_session' })
          } catch {}
        }
        setResult(`Session saved! +${earned} coins`)
      } catch {
        setResult('Could not save session. Try again.')
      } finally {
        setSaving(false)
      }
    })()
  }, [remaining, running, durationSeconds, subject, withLoading, showCoins, promptDouble])

  const progress = 1 - remaining / durationSeconds

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-subtext">Subject</div>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" />
        </div>
        <div>
          <div className="text-sm text-subtext">Duration</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[10, 25, 45, 60].map((m) => (
              <Button
                key={m}
                type="button"
                variant={durationMin === m ? 'secondary' : 'outline'}
                onClick={() => setDurationMin(m)}
              >
                {m}m
              </Button>
            ))}
            <Input
              type="number"
              min={1}
              max={180}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/70 p-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="w-full max-w-sm">
            <div className="text-sm text-subtext">Time left</div>
            <div className="mt-1 font-heading text-5xl text-text">{format(remaining)}</div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-bg/40 ring-1 ring-border">
              <motion.div
                className="h-full rounded-full bg-pink"
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-3 text-xs text-subtext">
              {Math.round(progress * 100)}% complete
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto">
            <Button
              size="lg"
              variant={running ? 'outline' : 'secondary'}
              onClick={() => setRunning((v) => !v)}
              disabled={saving}
            >
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                setRunning(false)
                setRemaining(durationSeconds)
                setResult(null)
              }}
              disabled={saving}
            >
              Reset
            </Button>
            <div
              className={cn(
                'mt-2 rounded-2xl border border-border bg-bg/30 px-4 py-3 text-sm text-subtext',
                result && 'border-pink/25 text-text'
              )}
            >
              {saving ? 'Saving session…' : result ?? 'Press start and vibe.'}
            </div>
          </div>
        </div>
      </div>
      {modal}
    </div>
  )
}
