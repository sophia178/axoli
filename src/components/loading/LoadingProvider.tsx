'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'

type LoadingContextValue = {
  withLoading<T>(work: Promise<T>): Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const activeCount = useRef(0)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownAt = useRef<number | null>(null)

  const start = useCallback(() => {
    activeCount.current += 1
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    if (!showTimer.current && !visible) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null
        if (activeCount.current > 0) {
          shownAt.current = Date.now()
          setVisible(true)
        }
      }, 200)
    }
  }, [visible])

  const stop = useCallback(() => {
    activeCount.current = Math.max(0, activeCount.current - 1)
    if (activeCount.current === 0) {
      if (showTimer.current) {
        clearTimeout(showTimer.current)
        showTimer.current = null
      }
      if (!visible) return
      const started = shownAt.current ?? Date.now()
      const elapsed = Date.now() - started
      const remaining = Math.max(0, 400 - elapsed)
      if (remaining === 0) {
        shownAt.current = null
        setVisible(false)
        return
      }
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null
        shownAt.current = null
        setVisible(false)
      }, remaining)
    }
  }, [visible])

  const withLoading = useCallback(
    async <T,>(work: Promise<T>) => {
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
