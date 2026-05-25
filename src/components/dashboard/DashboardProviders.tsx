'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { LoadingProvider, useLoading } from '@/components/loading/LoadingProvider'
import { CoinToastProvider, useCoinToasts } from '@/components/coins/CoinToastProvider'

function InitPing() {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()

  useEffect(() => {
    void withLoading(
      fetch('/api/login/ping', { method: 'POST' }).then(async (res) => {
        const json = (await res.json().catch(() => null)) as any
        const amount = Number(json?.coinsAwarded ?? 0)
        if (res.ok && amount > 0) showCoins(amount)
      })
    )
  }, [withLoading, showCoins])

  return null
}

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <CoinToastProvider>
      <LoadingProvider>
        <InitPing />
        {children}
      </LoadingProvider>
    </CoinToastProvider>
  )
}

