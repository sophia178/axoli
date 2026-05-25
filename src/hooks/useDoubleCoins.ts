'use client'

import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DoubleCoinsModal } from '@/components/coins/DoubleCoinsModal'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'

type Phase = 'offer' | 'playing' | 'success'

type PromptArgs = {
  coinsEarned: number
  reason: string
}

export function useDoubleCoins() {
  const t = useTranslations('doubleCoins')
  const { showCoins } = useCoinToasts()

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

  const promptDouble = useCallback(
    async ({ coinsEarned, reason }: PromptArgs) => {
      if (!Number.isFinite(coinsEarned) || coinsEarned <= 0) return
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
          setError(t('limitError'))
          return
        }
        setPhase('offer')
        setError(t('genericError'))
        return
      }

      const bonus = Number(json?.bonusCoinsAwarded ?? coins)
      if (bonus > 0) showCoins(bonus)
      setAdsWatchedToday(Number(json?.adsWatchedToday ?? adsWatchedToday))
      setLimit(Number(json?.limit ?? limit))
      setCanWatch(Boolean(json?.canWatch ?? (adsWatchedToday + 1 < limit)))
      setPhase('success')
    })()
  }, [open, phase, secondsLeft, coins, reason, showCoins, t, adsWatchedToday, limit])

  const modal = createElement(DoubleCoinsModal, {
    open,
    phase,
    coins,
    secondsLeft,
    canWatch,
    adsWatchedToday,
    limit,
    error,
    onKeep: close,
    onWatch: watchAd,
    onClose: close
  })

  return { promptDouble, modal, close }
}
