'use client'

import type { ReactNode } from 'react'
import { LoadingProvider } from '@/components/loading/LoadingProvider'
import { CoinToastProvider } from '@/components/coins/CoinToastProvider'

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <CoinToastProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </CoinToastProvider>
  )
}
