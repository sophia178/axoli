'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { UpgradeButtons } from '@/components/shop/UpgradeButtons'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { ShopItemRow } from '@/lib/shop/data'

type Tab = 'food' | 'decoration' | 'accessory' | 'colour'

function tabName(tab: Tab) {
  if (tab === 'food') return 'Food'
  if (tab === 'decoration') return 'Decorations'
  if (tab === 'accessory') return 'Accessories'
  return 'Colour changes'
}

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

  const [tab, setTab] = useState<Tab>('food')
  const [message, setMessage] = useState<string | null>(null)
  const [upgrade, setUpgrade] = useState(false)

  const owned = useMemo(() => new Set(ownedIds), [ownedIds])
  const grouped = useMemo(() => {
    const g: Record<Tab, ShopItemRow[]> = {
      food: [],
      decoration: [],
      accessory: [],
      colour: []
    }
    for (const item of items) g[item.type as Tab].push(item)
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
          {(['food', 'decoration', 'accessory', 'colour'] as Tab[]).map((t) => (
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grouped[tab].map((item) => {
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
    </div>
  )
}

