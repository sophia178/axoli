'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'

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
    if (typeof parsed.durationSeconds !== 'number') return null
    if (typeof parsed.running !== 'boolean') return null
    if (typeof parsed.subject !== 'string') return null
    if (typeof parsed.startedAt !== 'number') return null
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

function format(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`
}

export function TimerPill() {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const [timer, setTimer] = useState<StoredTimer | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const refresh = () => setTimer(readTimer())
    refresh()
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      refresh()
    }
    window.addEventListener('storage', onStorage)
    const pollId = window.setInterval(refresh, 1000)
    const onVisibility = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(pollId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!timer?.running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer?.running])

  const remainingSeconds = useMemo(() => {
    if (!timer) return null
    if (!timer.running) return null
    const elapsed = Math.floor((now - timer.startedAt) / 1000)
    return Math.max(0, timer.durationSeconds - elapsed)
  }, [timer, now])

  useEffect(() => {
    if (!timer?.running) return
    if (remainingSeconds === null) return
    if (remainingSeconds > 0) return
    if (timer.awarded) {
      writeTimer(null)
      setTimer(null)
      return
    }
    const next: StoredTimer = { ...timer, running: false, awarded: true }
    writeTimer(next)
    setTimer(next)
    void (async () => {
      const res = await withLoading(
        fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationSeconds: timer.durationSeconds,
            subject: timer.subject.trim() ? timer.subject.trim() : undefined
          })
        })
      )
      const json = (await res.json().catch(() => null)) as any
      const earned = Number(json?.coinsEarned ?? 0)
      if (res.ok && earned > 0) showCoins(earned)
      writeTimer(null)
      setTimer(null)
    })()
  }, [timer, remainingSeconds, withLoading, showCoins])

  if (!timer?.running || remainingSeconds === null) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9997]">
      <Link
        href="/dashboard/timer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-3 text-sm font-semibold text-text shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink/15 ring-1 ring-pink/25">
          ⏳
        </span>
        <span>Timer running</span>
        <span className="text-gold">{format(remainingSeconds)}</span>
      </Link>
    </div>
  )
}
