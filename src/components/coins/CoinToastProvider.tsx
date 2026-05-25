'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CoinToast = { id: string; amount: number }

type CoinToastContextValue = {
  showCoins: (amount: number) => void
}

const CoinToastContext = createContext<CoinToastContextValue | null>(null)

function id() {
  return Math.random().toString(16).slice(2)
}

export function CoinToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<CoinToast[]>([])

  const showCoins = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount === 0) return
    const toast: CoinToast = { id: id(), amount }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 1600)
  }, [])

  const value = useMemo(() => ({ showCoins }), [showCoins])

  return (
    <CoinToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4">
        <div className="w-full max-w-sm space-y-2">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-center justify-center gap-2 rounded-3xl border border-gold/30 bg-card/80 px-4 py-3 text-sm font-semibold text-text shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 ring-1 ring-gold/30">
                  🪙
                </span>
                <span className="text-gold">+{t.amount}</span>
                <span className="text-subtext">coins</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </CoinToastContext.Provider>
  )
}

export function useCoinToasts() {
  const ctx = useContext(CoinToastContext)
  if (!ctx) return { showCoins: (_amount: number) => {} }
  return ctx
}

