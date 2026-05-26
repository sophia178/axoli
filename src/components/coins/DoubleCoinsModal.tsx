'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

type Phase = 'offer' | 'playing' | 'success'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}


function CoinBadge({ amount }: { amount: number }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className="mx-auto flex w-fit items-center gap-3 rounded-3xl border border-gold/30 bg-gold/10 px-4 py-3"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 ring-1 ring-gold/30">
        🪙
      </div>
      <div className="text-left">
        <div className="text-xs text-subtext">+{amount}</div>
        <div className="font-heading text-2xl text-gold">{amount}</div>
      </div>
    </motion.div>
  )
}

function CoinRain({ visible }: { visible: boolean }) {
  const coins = useMemo(() => {
    const out: Array<{ id: string; left: number; delay: number; duration: number; size: number }> = []
    for (let i = 0; i < 18; i += 1) {
      out.push({
        id: `${i}-${Math.random().toString(16).slice(2)}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 0.9 + Math.random() * 0.8,
        size: 14 + Math.random() * 12
      })
    }
    return out
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {coins.map((c) => (
            <motion.div
              key={c.id}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 420, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ delay: c.delay, duration: c.duration, ease: 'easeIn' }}
              style={{ left: `${c.left}%` }}
              className="absolute top-0"
            >
              <div style={{ fontSize: c.size }} className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
                🪙
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export function DoubleCoinsModal({
  open,
  phase,
  coins,
  secondsLeft,
  canWatch,
  adsWatchedToday,
  limit,
  error,
  onKeep,
  onWatch,
  onClose
}: {
  open: boolean
  phase: Phase
  coins: number
  secondsLeft: number
  canWatch: boolean
  adsWatchedToday: number
  limit: number
  error?: string | null
  onKeep: () => void
  onWatch: () => void
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (phase === 'playing') return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, phase])

  const clientId = 'ca-pub-9710441137160587'
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID
  const adPushed = useRef(false)
  useEffect(() => {
    if (!open) return
    if (phase !== 'playing') return
    if (!clientId || !slotId) return
    if (adPushed.current) return
    adPushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {}
  }, [open, phase, clientId, slotId])

  const progress = phase === 'playing' ? clamp(secondsLeft / 15, 0, 1) : 0

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur"
        onClick={() => {
          if (phase === 'playing') return
          onClose()
        }}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card/90 shadow-[0_18px_70px_rgba(0,0,0,0.65)]">
        <CoinRain visible={phase === 'success'} />
        <div className="relative p-6">
          {phase !== 'playing' ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl text-subtext ring-1 ring-border hover:bg-bg/20 hover:text-text [[dir=rtl]_&]:left-4 [[dir=rtl]_&]:right-auto"
              aria-label="Close"
            >
              ✕
            </button>
          ) : null}

          <div className="mx-auto max-w-sm">
            <div className="text-center">
              <div className="font-heading text-3xl text-text">
                {phase === 'offer'
                  ? `You earned ${coins} coins!`
                  : phase === 'playing'
                    ? 'Ad playing...'
                    : 'Nice!'}
              </div>
              <div className="mt-2 text-sm text-subtext">
                {phase === 'playing' ? `Ad playing... ${secondsLeft} seconds` : null}
                {phase === 'offer' && !canWatch
                  ? `Daily limit reached (${adsWatchedToday}/${limit})`
                  : null}
                {phase === 'success' ? `You doubled your coins! +${coins * 2}` : null}
              </div>
            </div>

            <div className="mt-6">
              <motion.div
                animate={phase === 'offer' ? { y: [0, -6, 0] } : { y: [0, 0, 0] }}
                transition={{ duration: 2.2, repeat: phase === 'offer' ? Infinity : 0, ease: 'easeInOut' }}
                className="mx-auto w-[260px] max-w-full"
              >
                <div className="relative">
                  {phase === 'offer' ? (
                    <>
                      <motion.div
                        className="absolute -left-2 -top-6 text-gold"
                        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        ✨
                      </motion.div>
                      <motion.div
                        className="absolute -right-3 -top-3 text-pink"
                        animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        ✨
                      </motion.div>
                    </>
                  ) : null}
                  <img src="/axolotl-happy.png" width="120" height="120" alt="" style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block', margin: '0 auto' }} />
                </div>
              </motion.div>
            </div>

            {phase === 'offer' ? (
              <div className="mt-5 space-y-3">
                <CoinBadge amount={coins} />
                {error ? (
                  <div className="rounded-2xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-text">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-2">
                  {canWatch ? (
                    <Button
                      variant="secondary"
                      className="w-full justify-between"
                      onClick={onWatch}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">📺</span>
                        <span>Watch a short ad to double it!</span>
                      </span>
                      <span className="text-bg/90">{`2x = ${coins * 2} coins`}</span>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      {`Daily limit reached (${adsWatchedToday}/${limit})`}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={onKeep}>
                    {`Keep my ${coins} coins`}
                  </Button>
                </div>
              </div>
            ) : null}

            {phase === 'playing' ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-3xl border border-border bg-bg/20 p-4">
                  {slotId ? (
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block', minHeight: 180 }}
                      data-ad-client={clientId}
                      data-ad-slot={slotId}
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  ) : (
                    <div className="text-sm text-subtext">
                      Ad is loading… (missing AdSense env vars in this environment)
                    </div>
                  )}
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-bg/40 ring-1 ring-border">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    animate={{ width: `${Math.round(progress * 100)}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
                <div className="text-xs text-subtext">Please wait — you can’t skip this ad.</div>
              </div>
            ) : null}

            {phase === 'success' ? (
              <div className="mt-6 space-y-3">
                <CoinBadge amount={coins * 2} />
                <Button variant="secondary" className="w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
