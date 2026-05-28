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

type StoredTimer = {
  id: string
  startedAt: number
  durationSeconds: number
  subject: string
  running: boolean
  remainingSeconds?: number
  awarded?: boolean
}

const STORAGE_KEY = 'axoli_timer_v1'

function readTimer(): StoredTimer | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredTimer
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.id !== 'string') return null
    if (typeof parsed.startedAt !== 'number') return null
    if (typeof parsed.durationSeconds !== 'number') return null
    if (typeof parsed.subject !== 'string') return null
    if (typeof parsed.running !== 'boolean') return null
    return parsed
  } catch {
    return null
  }
}

function writeTimer(timer: StoredTimer | null) {
  try {
    if (!timer) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
  } catch {}
}

function makeId() {
  return Math.random().toString(16).slice(2)
}

export function StudyTimer() {
  const [durationMin, setDurationMin] = useState(25)
  const [subject, setSubject] = useState('')
  const [remaining, setRemaining] = useState(durationMin * 60)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [quitConfirm, setQuitConfirm] = useState(false)
  const [timerId, setTimerId] = useState<string>(() => makeId())
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptDouble, modal } = useDoubleCoins()

  const durationSeconds = useMemo(
    () => Math.max(1, Math.round(durationMin)) * 60,
    [durationMin]
  )

  useEffect(() => {
    const stored = readTimer()
    if (!stored) return
    if (stored.running) {
      setTimerId(stored.id)
      setSubject(stored.subject)
      setDurationMin(Math.max(1, Math.round(stored.durationSeconds / 60)))
      setStartedAt(stored.startedAt)
      const elapsed = Math.floor((Date.now() - stored.startedAt) / 1000)
      setRemaining(Math.max(0, stored.durationSeconds - elapsed))
      setRunning(true)
    } else if (typeof stored.remainingSeconds === 'number') {
      setTimerId(stored.id)
      setSubject(stored.subject)
      setDurationMin(Math.max(1, Math.round(stored.durationSeconds / 60)))
      setStartedAt(null)
      setRemaining(Math.max(0, stored.remainingSeconds))
      setRunning(false)
    }
  }, [])

  const prevDuration = useRef(durationSeconds)
  useEffect(() => {
    if (running) return
    if (prevDuration.current !== durationSeconds) {
      setRemaining(durationSeconds)
      prevDuration.current = durationSeconds
    }
  }, [durationSeconds, running])

  useEffect(() => {
    if (!running) return
    if (startedAt === null) return
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setRemaining(Math.max(0, durationSeconds - elapsed))
    }, 1000)
    return () => clearInterval(id)
  }, [running, startedAt, durationSeconds])

  useEffect(() => {
    const stored = readTimer()
    if (!stored) return
    if (stored.id !== timerId) return
    if (!stored.running) return
    writeTimer({ ...stored, subject })
  }, [subject, timerId])

  useEffect(() => {
    if (remaining !== 0) return
    if (!running) return
    setRunning(false)
    void (async () => {
      setSaving(true)
      setResult(null)
      try {
        const stored = readTimer()
        if (stored && stored.id === timerId) {
          writeTimer({ ...stored, running: false, awarded: true, remainingSeconds: 0 })
        }
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
        writeTimer(null)
        setSaving(false)
      }
    })()
  }, [remaining, running, durationSeconds, subject, withLoading, showCoins, promptDouble, timerId])

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

      <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row">
          <div className="w-full max-w-sm">
            <div className="text-sm text-subtext">Time left</div>
            <div className="mt-1 font-heading text-3xl text-text sm:text-5xl">{format(remaining)}</div>
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
              onClick={() => {
                if (saving) return
                setResult(null)
                if (!running) {
                  const id = timerId || makeId()
                  const start = Date.now() - Math.max(0, durationSeconds - remaining) * 1000
                  setTimerId(id)
                  setStartedAt(start)
                  setRunning(true)
                  writeTimer({
                    id,
                    startedAt: start,
                    durationSeconds,
                    subject,
                    running: true
                  })
                  return
                }
                setRunning(false)
                setStartedAt(null)
                writeTimer({
                  id: timerId,
                  startedAt: Date.now(),
                  durationSeconds,
                  subject,
                  running: false,
                  remainingSeconds: remaining
                })
              }}
              disabled={saving}
            >
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (saving) return
                const studiedSeconds = Math.max(0, Math.floor(durationSeconds - remaining))
                if (studiedSeconds <= 0) {
                  setRunning(false)
                  setStartedAt(null)
                  setRemaining(durationSeconds)
                  setResult(null)
                  setTimerId(makeId())
                  writeTimer(null)
                  return
                }
                setQuitConfirm(true)
              }}
              disabled={saving}
            >
              Quit
            </Button>
            {quitConfirm ? (
              <div
                className="rounded-2xl p-4"
                style={{ background: '#0A0A1A', border: '1px solid #FF8FAB44' }}
              >
                <div className="text-sm font-semibold" style={{ color: '#FF8FAB' }}>
                  Quit session?
                </div>
                <div className="mt-1 text-xs" style={{ color: '#8888AA' }}>
                  Your progress so far will be saved and the timer will reset.
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl px-4 py-2 text-xs font-semibold transition"
                    style={{ background: '#FF8FAB', color: '#0A0A1A' }}
                    onClick={() => {
                      setQuitConfirm(false)
                      const studiedSeconds = Math.max(0, Math.floor(durationSeconds - remaining))
                      setRunning(false)
                      setStartedAt(null)
                      void (async () => {
                        setSaving(true)
                        setResult(null)
                        try {
                          const res = await withLoading(
                            fetch('/api/sessions', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                durationSeconds: Math.max(1, studiedSeconds),
                                subject: subject.trim() ? subject.trim() : undefined,
                                applyRewards: false
                              })
                            })
                          )
                          if (!res.ok) {
                            setResult('Could not save progress. Try again.')
                            return
                          }
                          setResult('Progress saved.')
                        } catch {
                          setResult('Could not save progress. Try again.')
                        } finally {
                          writeTimer(null)
                          setSaving(false)
                          setRemaining(durationSeconds)
                          setTimerId(makeId())
                        }
                      })()
                    }}
                  >
                    Yes, quit
                  </button>
                  <button
                    type="button"
                    className="rounded-xl px-4 py-2 text-xs font-semibold transition"
                    style={{ background: '#1A1A2E', color: '#FF8FAB', border: '1px solid #FF8FAB44' }}
                    onClick={() => setQuitConfirm(false)}
                  >
                    Keep going
                  </button>
                </div>
              </div>
            ) : null}
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                setRunning(false)
                setStartedAt(null)
                setRemaining(durationSeconds)
                setResult(null)
                setTimerId(makeId())
                writeTimer(null)
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
