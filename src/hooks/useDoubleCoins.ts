'use client'

import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DoubleCoinsModal } from '@/components/coins/DoubleCoinsModal'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'

type Phase = 'offer' | 'playing' | 'success'

type PromptArgs = {
  coinsEarned: number
  reason: string
}

export function useDoubleCoins() {
  const { showCoins } = useCoinToasts()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('offer')
  const [coins, setCoins] = useState(0)
  const [reason, setReason] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(15)

  const [adsWatchedToday, setAdsWatchedToday] = useState(0)
  const [limit, setLimit] = useState(3)
  const [canWatch, setCanWatch] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ticking = useRef<ReturnType<typeof setInterval> | null>(null)
  const claiming = useRef(false)

  const refreshStatus = useCallback(async () => {
    const res = await fetch('/api/coins/double', { method: 'GET' })
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) return
    setAdsWatchedToday(Number(json?.adsWatchedToday ?? 0))
    setLimit(Number(json?.limit ?? 3))
    setCanWatch(Boolean(json?.canWatch ?? true))
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setError(null)
    setPhase('offer')
    setSecondsLeft(15)
  }, [])

  const keep = useCallback(() => {
    close()
    router.refresh()
  }, [close, router])

  const promptDouble = useCallback(
    async ({ coinsEarned, reason }: PromptArgs) => {
      if (!Number.isFinite(coinsEarned) || coinsEarned <= 0) return
      // Award base coins immediately before showing modal
      await fetch('/api/coins/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(coinsEarned), reason })
      })
      setCoins(Math.round(coinsEarned))
      setReason(reason)
      setSecondsLeft(15)
      setPhase('offer')
      setError(null)
      setOpen(true)
      await refreshStatus()
    },
    [refreshStatus]
  )

  const promptFromResponse = useCallback(
    async (json: unknown, reason: string) => {
      const j = json as any
      if (!j || typeof j !== 'object') return
      if (!j.promptDouble) return
      const amount = Number(j.coinsAwarded ?? j.coinsEarned ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) return
      await promptDouble({ coinsEarned: amount, reason })
    },
    [promptDouble]
  )

  const watchAd = useCallback(() => {
    if (!canWatch) return
    // Replace with real ad SDK (e.g. Google AdMob) before production
    setPhase('playing')
    setError(null)
    setSecondsLeft(15)
  }, [canWatch])

  useEffect(() => {
    if (!open) return
    if (phase !== 'playing') return
    if (ticking.current) return

    ticking.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    return () => {
      if (ticking.current) clearInterval(ticking.current)
      ticking.current = null
    }
  }, [open, phase])

  useEffect(() => {
    if (!open) return
    if (phase !== 'playing') return
    if (secondsLeft !== 0) return
    if (claiming.current) return
    claiming.current = true

    void (async () => {
      const res = await fetch('/api/coins/double', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: coins, reason })
      })
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        if (res.status === 429) {
          setAdsWatchedToday(Number(json?.adsWatchedToday ?? 3))
          setLimit(Number(json?.limit ?? 3))
          setCanWatch(false)
          setPhase('offer')
          setError('Daily ad limit reached. Keep your coins and come back tomorrow.')
          claiming.current = false
          return
        }
        setPhase('offer')
        setError(
          json?.error === 'missing_supabase_admin'
            ? 'Double coins is temporarily unavailable. Please try again later.'
            : 'Couldn’t double coins. Please try again.'
        )
        claiming.current = false
        return
      }

      const bonus = Number(json?.bonusCoinsAwarded ?? coins)
      if (bonus > 0) showCoins(bonus)
      setAdsWatchedToday(Number(json?.adsWatchedToday ?? adsWatchedToday))
      setLimit(Number(json?.limit ?? limit))
      setCanWatch(Boolean(json?.canWatch ?? (adsWatchedToday + 1 < limit)))
      setPhase('success')
      router.refresh()
      claiming.current = false
    })()
  }, [open, phase, secondsLeft, coins, reason, showCoins, adsWatchedToday, limit, router])

  const modal = createElement(DoubleCoinsModal, {
    open,
    phase,
    coins,
    secondsLeft,
    canWatch,
    adsWatchedToday,
    limit,
    error,
    onKeep: keep,
    onWatch: watchAd,
    onClose: close
  })

  return { promptDouble, promptFromResponse, modal, close }
}
