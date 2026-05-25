'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useLoading } from '@/components/loading/LoadingProvider'

export function UpgradeButtons() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { withLoading } = useLoading()

  async function go(plan: 'monthly' | 'yearly') {
    setLoading(plan)
    setError(null)
    const apiPlan = plan === 'monthly' ? 'premium_monthly' : 'premium_yearly'
    const res = await withLoading(
      fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: apiPlan })
      })
    )
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok || !json?.url) {
      setError('Checkout failed. Check Stripe env vars.')
      setLoading(null)
      return
    }
    window.location.href = json.url
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-2xl border border-pink/25 bg-pink/10 px-4 py-2 text-sm text-text">
          {error}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => void go('monthly')}
          disabled={loading !== null}
          className="w-full sm:w-auto"
        >
          {loading === 'monthly' ? 'Loading…' : 'Premium monthly £3.99'}
        </Button>
        <Button
          size="lg"
          onClick={() => void go('yearly')}
          disabled={loading !== null}
          className="w-full sm:w-auto"
        >
          {loading === 'yearly' ? 'Loading…' : 'Premium yearly £29.99'}
        </Button>
      </div>
    </div>
  )
}
