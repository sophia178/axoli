'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MarketingHeader } from '@/components/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

type Plan =
  | 'premium_monthly'
  | 'premium_yearly'
  | 'coins_50'
  | 'coins_150'
  | 'coins_400'
  | 'coins_1000'

export default function PricingPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<Plan | null>(null)

  async function checkout(plan: Plan) {
    setMsg(null)
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      if (res.status === 401) {
        window.location.href = '/login?redirect=/pricing'
        return
      }
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok || !json?.url) {
        const missing = typeof json?.missing === 'string' ? ` (${json.missing})` : ''
        setMsg(`Could not start checkout. Check Stripe configuration${missing}.`)
        return
      }
      window.location.href = json.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-2xl text-text sm:text-4xl">Pricing</h1>
          <p className="mt-3 text-subtext">
            Axoli is free to start. Upgrade for bigger AI limits and premium pet items.
          </p>
        </div>

        {msg ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
            {msg}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-3xl text-text sm:text-4xl">£0</div>
                <div className="text-sm text-subtext">forever</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>Flashcards, timer, exams</li>
                <li>Basic pet + coins</li>
                <li>Limited AI generation</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Start for free
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-pink/30 md:col-span-1">
            <CardHeader>
              <CardTitle>Premium Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-3xl text-text sm:text-4xl">£3.99</div>
                <div className="text-sm text-subtext">/ month</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>More AI generations</li>
                <li>Premium shop items</li>
                <li>Leaderboards</li>
              </ul>
              <div className="mt-6">
                <Button
                  className="w-full"
                  disabled={loading === 'premium_monthly'}
                  onClick={() => void checkout('premium_monthly')}
                >
                  {loading === 'premium_monthly' ? 'Starting checkout…' : 'Go premium'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Premium Yearly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-3xl text-text sm:text-4xl">£29.99</div>
                <div className="text-sm text-subtext">/ year</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>Best value</li>
                <li>More AI generations</li>
                <li>Premium shop items</li>
              </ul>
              <div className="mt-6">
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={loading === 'premium_yearly'}
                  onClick={() => void checkout('premium_yearly')}
                >
                  {loading === 'premium_yearly' ? 'Starting checkout…' : 'Save yearly'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <div className="font-heading text-2xl text-text">Coin bundles</div>
          <div className="mt-4 grid gap-5 grid-cols-2 md:grid-cols-4">
            {[
              { key: 'coins_50' as const,   label: 'Coins 50',   price: '£0.99' },
              { key: 'coins_150' as const,  label: 'Coins 150',  price: '£1.99' },
              { key: 'coins_400' as const,  label: 'Coins 400',  price: '£4.99' },
              { key: 'coins_1000' as const, label: 'Coins 1000', price: '£9.99' }
            ].map((b) => (
              <Card key={b.key}>
                <CardHeader>
                  <CardTitle>{b.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="font-heading text-2xl text-text sm:text-3xl">{b.price}</div>
                  </div>
                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={loading === b.key}
                      onClick={() => void checkout(b.key)}
                    >
                      {loading === b.key ? 'Starting checkout…' : 'Buy coins'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-sm text-subtext">
            You&apos;ll be asked to log in before checkout if you&apos;re not signed in.
          </div>
        </div>
      </main>
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-subtext sm:flex-row">
          <span>© 2026 Axoli</span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <a href="mailto:hello@suitance.co.uk" className="hover:text-text">
              hello@suitance.co.uk
            </a>
            <Link href="/privacy" className="hover:text-text">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
