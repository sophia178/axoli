'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

type LoadingContextValue = {
  withLoading<T>(work: Promise<T>): Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const withLoading = useCallback(<T,>(work: Promise<T>): Promise<T> => work, [])
  const value = useMemo<LoadingContextValue>(() => ({ withLoading }), [withLoading])

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) {
    return { withLoading: <T,>(work: Promise<T>): Promise<T> => work }
  }
  return ctx
}
