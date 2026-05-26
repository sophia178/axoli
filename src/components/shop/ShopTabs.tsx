'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { UpgradeButtons } from '@/components/shop/UpgradeButtons'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { ShopItemRow } from '@/lib/shop/data'

const COIN_BUNDLES = [
  { id: 'coins_50',   coins: 50,   price: '£0.99', label: 'Starter' },
  { id: 'coins_150',  coins: 150,  price: '£1.99', label: 'Popular' },
  { id: 'coins_400',  coins: 400,  price: '£4.99', label: 'Great value' },
  { id: 'coins_1000', coins: 1000, price: '£9.99', label: 'Best value' },
]

type Tab = 'food' | 'decoration' | 'accessory' | 'colour' | 'coins'

function tabName(tab: Tab) {
  if (tab === 'food') return 'Food'
  if (tab === 'decoration') return 'Decorations'
  if (tab === 'accessory') return 'Accessories'
  if (tab === 'coins') return 'Get Coins'
  return 'Colour changes'
}

const VALID_TABS: Tab[] = ['food', 'decoration', 'accessory', 'colour', 'coins']

export function ShopTabs({
  items,
  ownedIds,
  plan,
  coins
}: {
  items: ShopItemRow[]
  ownedIds: string[]
  plan: string
  coins: number
}) {
  const router = useRouter()
  const { withLoading } = useLoading()
  const params = useSearchParams()

  const initialTab: Tab = (() => {
    const p = params?.get('tab') as Tab | null
    return p && VALID_TABS.includes(p) ? p : 'food'
  })()

  const [tab, setTab] = useState<Tab>(initialTab)
  const [message, setMessage] = useState<string | null>(null)
  const [upgrade, setUpgrade] = useState(false)
  const [coinBuyingId, setCoinBuyingId] = useState<string | null>(null)

  const owned = useMemo(() => new Set(ownedIds), [ownedIds])
  const grouped = useMemo(() => {
    const g: Record<Exclude<Tab, 'coins'>, ShopItemRow[]> = {
      food: [],
      decoration: [],
      accessory: [],
      colour: []
    }
    for (const item of items) g[item.type as Exclude<Tab, 'coins'>]?.push(item)
    return g
  }, [items])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card/70 p-5">
        <div>
          <div className="font-heading text-2xl text-text">Shop</div>
          <div className="mt-1 text-sm text-subtext">
            Coins balance: <span className="text-text">{coins}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {VALID_TABS.map((t) => (
            <Button
              key={t}
              type="button"
              variant={tab === t ? 'secondary' : 'outline'}
              onClick={() => {
                setTab(t)
                setMessage(null)
                setUpgrade(false)
              }}
            >
              {tabName(t)}
            </Button>
          ))}
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}

      {upgrade ? (
        <div className="rounded-3xl border border-pink/25 bg-pink/10 p-5">
          <div className="font-heading text-2xl text-text">Premium only</div>
          <div className="mt-2 text-sm text-subtext">
            Upgrade to unlock premium items (and more AI generations).
          </div>
          <div className="mt-4">
            <UpgradeButtons />
          </div>
        </div>
      ) : null}

      {tab === 'coins' ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/70 p-6">
            <div className="font-heading text-2xl text-text">Buy coins</div>
            <div className="mt-1 text-sm text-subtext">
              Purchase coins to spend in the shop on food, decorations, and accessories.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COIN_BUNDLES.map((bundle) => (
              <div key={bundle.id} className="rounded-3xl border border-border bg-bg/20 p-5 flex flex-col gap-3">
                <div className="font-heading text-4xl text-gold">{bundle.coins}</div>
                <div className="text-sm text-subtext">coins</div>
                <div className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold w-fit">
                  {bundle.label}
                </div>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={coinBuyingId === bundle.id}
                    onClick={async () => {
                      setCoinBuyingId(bundle.id)
                      setMessage(null)
                      try {
                        const res = await withLoading(
                          fetch('/api/stripe/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: bundle.id })
                          })
                        )
                        const json = (await res.json().catch(() => null)) as any
                        if (!res.ok || !json?.url) {
                          setMessage('Could not start checkout. Please try again.')
                          return
                        }
                        window.location.href = json.url
                      } finally {
                        setCoinBuyingId(null)
                      }
                    }}
                  >
                    {coinBuyingId === bundle.id ? 'Loading…' : `${bundle.price}`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped[tab as Exclude<Tab, 'coins'>].map((item) => {
            const isOwned = owned.has(item.id)
            const premiumLocked = item.is_premium && plan === 'free'
            const canBuy = !premiumLocked && coins >= item.cost
            return (
              <div key={item.id} className="rounded-3xl border border-border bg-bg/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text">{item.name}</div>
                    <div className="mt-2 inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                      {item.cost} coins
                    </div>
                  </div>
                  {item.is_premium ? (
                    <div className="rounded-full bg-pink/15 px-3 py-1 text-xs font-semibold text-pink">
                      Premium
                    </div>
                  ) : item.is_seasonal ? (
                    <div className="rounded-full bg-card/60 px-3 py-1 text-xs font-semibold text-subtext">
                      Seasonal
                    </div>
                  ) : null}
                </div>

                {item.image_url ? (
                  <div className="mt-4 flex items-center justify-center">
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={item.image_url} width={48} height={48} alt="" draggable={false} className="select-none" style={{ objectFit: 'contain' }} />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4">
                  {tab !== 'food' && isOwned ? (
                    <div className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-subtext">
                      Owned
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={premiumLocked ? 'outline' : 'secondary'}
                      disabled={!canBuy && !premiumLocked}
                      onClick={async () => {
                        setMessage(null)
                        setUpgrade(false)
                        if (premiumLocked) {
                          setUpgrade(true)
                          return
                        }
                        if (coins < item.cost) {
                          setMessage('Not enough coins.')
                          return
                        }
                        const res = await withLoading(
                          fetch('/api/shop/purchase', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ itemId: item.id })
                          })
                        )
                        const json = (await res.json().catch(() => null)) as any
                        if (!res.ok) {
                          if (json?.error === 'not_enough_coins') setMessage('Not enough coins.')
                          else if (json?.error === 'premium_only') setUpgrade(true)
                          else setMessage('Purchase failed.')
                          return
                        }
                        setMessage(tab === 'food' ? 'Yum! Happiness boosted.' : 'Purchased!')
                        router.refresh()
                      }}
                    >
                      {premiumLocked ? 'Premium only' : tab === 'food' ? 'Feed' : 'Buy'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
