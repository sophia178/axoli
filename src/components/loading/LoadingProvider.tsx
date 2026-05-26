'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'

type LoadingContextValue = {
  withLoading<T>(work: Promise<T>): Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

const SHOW_DELAY = 200   // ms before showing spinner (debounce fast requests)
const HARD_MAX  = 3000  // ms maximum — force-hide even if something gets stuck

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const activeCount  = useRef(0)
  const showTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hardTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const forceHide = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null }
    if (hardTimer.current) { clearTimeout(hardTimer.current); hardTimer.current = null }
    activeCount.current = 0
    setVisible(false)
  }, [])

  const start = useCallback(() => {
    activeCount.current += 1
    if (showTimer.current) return          // already scheduled to show
    showTimer.current = setTimeout(() => {
      showTimer.current = null
      if (activeCount.current > 0) {
        setVisible(true)
        // hard safety net — force clear after HARD_MAX ms
        if (hardTimer.current) clearTimeout(hardTimer.current)
        hardTimer.current = setTimeout(forceHide, HARD_MAX)
      }
    }, SHOW_DELAY)
  }, [forceHide])

  const stop = useCallback(() => {
    activeCount.current = Math.max(0, activeCount.current - 1)
    if (activeCount.current > 0) return
    // cancel pending show and hard timer, hide immediately
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null }
    if (hardTimer.current) { clearTimeout(hardTimer.current); hardTimer.current = null }
    setVisible(false)
  }, [])

  const withLoading = useCallback(
    async <T,>(work: Promise<T>): Promise<T> => {
      start()
      try {
        return await work
      } finally {
        stop()
      }
    },
    [start, stop]
  )

  const value = useMemo<LoadingContextValue>(() => ({ withLoading }), [withLoading])

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingScreen visible={visible} />
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) {
    return { withLoading: async <T,>(work: Promise<T>) => work }
  }
  return ctx
}
