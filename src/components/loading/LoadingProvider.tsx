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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    activeCount.current += 1
    if (!timer.current) {
      timer.current = setTimeout(() => {
        timer.current = null
        if (activeCount.current > 0) setVisible(true)
      }, 500)
    }
  }, [])

  const stop = useCallback(() => {
    activeCount.current = Math.max(0, activeCount.current - 1)
    if (activeCount.current === 0) {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      setVisible(false)
    }
  }, [])

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
