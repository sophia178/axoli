'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/cn'

type ProfileLike = {
  username: string | null
  avatar_colour?: string
  language?: string
  pet_name?: string | null
  notify_daily?: boolean
  notify_streak_risk?: boolean
  notify_exam?: boolean
  notify_group?: boolean
  plan?: string
  stripe_renewal_at?: string | null
  stripe_customer_id?: string | null
}

type Tab = 'profile' | 'subscription' | 'notifications' | 'account'

const avatarColours = [
  { key: 'pink', hex: '#FF8FAB' },
  { key: 'gold', hex: '#FFD700' },
  { key: 'mint', hex: '#7AE7B9' },
  { key: 'lavender', hex: '#7C5CFF' },
  { key: 'sky', hex: '#8BE9FD' },
  { key: 'peach', hex: '#FFB86B' }
] as const

function formatRenewal(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString()
}

export function SettingsTabs({
  email,
  initialProfile,
  initialPlan,
  initialTab,
  checkout
}: {
  email: string
  initialProfile: ProfileLike | null
  initialPlan: string
  initialTab?: string | null
  checkout?: string | null
}) {
  const { withLoading } = useLoading()

  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab === 'subscription') return 'subscription'
    if (initialTab === 'notifications') return 'notifications'
    if (initialTab === 'account') return 'account'
    return 'profile'
  })

  const [msg, setMsg] = useState<string | null>(() => {
    if (checkout === 'success') return 'Checkout complete. It can take a moment to sync.'
    if (checkout === 'cancel') return 'Checkout cancelled.'
    return null
  })

  const [username, setUsername] = useState(initialProfile?.username ?? '')
  const [avatar, setAvatar] = useState<string>(() => initialProfile?.avatar_colour ?? 'pink')
  const [petName, setPetName] = useState<string>(() => initialProfile?.pet_name ?? '')

  const [daily, setDaily] = useState(Boolean(initialProfile?.notify_daily ?? true))
  const [streakRisk, setStreakRisk] = useState(Boolean(initialProfile?.notify_streak_risk ?? true))
  const [exam, setExam] = useState(Boolean(initialProfile?.notify_exam ?? true))
  const [group, setGroup] = useState(Boolean(initialProfile?.notify_group ?? true))

  const [deleteText, setDeleteText] = useState('')
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')

  const plan = initialPlan === 'premium_monthly' || initialPlan === 'premium_yearly' ? 'premium' : initialPlan
  const planLabel =
    initialPlan === 'premium_monthly'
      ? 'Premium Monthly'
      : initialPlan === 'premium_yearly'
        ? 'Premium Yearly'
        : plan === 'premium'
          ? 'Premium'
          : 'Free'
  const renewal = useMemo(() => formatRenewal(initialProfile?.stripe_renewal_at ?? null), [initialProfile?.stripe_renewal_at])

  async function goCheckout(kind:
    | 'premium_monthly'
    | 'premium_yearly'
    | 'coins_50'
    | 'coins_150'
    | 'coins_400'
    | 'coins_1000') {
    setMsg(null)
    const res = await withLoading(
      fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: kind })
      })
    )
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok || !json?.url) {
      setMsg('Could not start checkout. Check Stripe env vars.')
      return
    }
    window.location.href = json.url
  }

  async function goPortal() {
    setMsg(null)
    const res = await withLoading(fetch('/api/stripe/portal', { method: 'POST' }))
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok || !json?.url) {
      setMsg('Could not open portal yet (no Stripe customer found).')
      return
    }
    window.location.href = json.url
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-6">
        <div className="font-heading text-xl text-text sm:text-3xl">Settings</div>
        <div className="mt-2 text-sm text-subtext">Control your profile, plan, and notifications.</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['profile', 'subscription', 'notifications', 'account'] as Tab[]).map((t) => (
          <Button
            key={t}
            type="button"
            variant={tab === t ? 'secondary' : 'outline'}
            onClick={() => {
              setTab(t)
              setMsg(null)
            }}
          >
            {t === 'profile'
              ? 'Profile'
              : t === 'subscription'
                ? 'Subscription'
                : t === 'notifications'
                  ? 'Notifications'
                  : 'Account'}
          </Button>
        ))}
      </div>

      {msg ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">{msg}</div>
      ) : null}

      {tab === 'profile' ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-subtext">Username</div>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <div className="text-sm text-subtext">Email (read only)</div>
                <Input value={email} readOnly />
              </div>
            </div>

            <div>
              <div className="text-sm text-subtext">Avatar colour</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {avatarColours.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setAvatar(c.key)}
                    className={cn(
                      'h-10 w-10 rounded-2xl ring-2 transition',
                      avatar === c.key ? 'ring-gold' : 'ring-border'
                    )}
                    style={{ background: c.hex }}
                    aria-label={c.key}
                  />
                ))}
              </div>
            </div>

            {plan === 'premium' ? (
              <div>
                <div className="text-sm text-subtext">Name your axolotl</div>
                <div className="mt-2 flex w-full gap-2 sm:max-w-sm">
                  <Input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Mochi"
                    maxLength={24}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setMsg(null)
                      const name = petName.trim()
                      const res = await withLoading(
                        fetch('/api/settings/profile', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ petName: name ? name : null })
                        })
                      )
                      if (!res.ok) {
                        setMsg('Could not update pet name.')
                        return
                      }
                      setMsg('Saved successfully.')
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={async () => {
                  setMsg(null)
                  const res = await withLoading(
                    fetch('/api/settings/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        username: username.trim(),
                        avatarColour: avatar
                      })
                    })
                  )
                  if (!res.ok) {
                    setMsg('Could not save changes. Username must be 2–24 characters.')
                    return
                  }
                  setMsg('Saved successfully.')
                }}
              >
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'subscription' ? (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border bg-bg/20 p-5">
                <div className="text-xs text-subtext">Current plan</div>
                <div className="mt-1 font-heading text-2xl text-text">
                  {planLabel}
                </div>
                {plan === 'premium' ? (
                  <div className="mt-2 text-sm text-subtext">
                    Renewal date: <span className="text-text">{renewal ?? '—'}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-subtext">
                    Upgrade for premium AI limits, premium shop items, and more.
                  </div>
                )}
              </div>

              {plan !== 'premium' ? (
                <div className="rounded-3xl border border-gold/30 bg-card/60 p-5">
                  <div className="font-heading text-2xl text-text">Premium benefits</div>
                  <ul className="mt-3 space-y-2 text-sm text-subtext">
                    <li>More AI generations per month</li>
                    <li>Premium-only items (shop + colours)</li>
                    <li>Extra motivation features</li>
                  </ul>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Button variant="secondary" onClick={() => void goCheckout('premium_monthly')}>
                      Upgrade to Premium £3.99/month
                    </Button>
                    <Button variant="outline" onClick={() => void goCheckout('premium_yearly')}>
                      £29.99/year — Save 37%
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card/60 p-5">
                  <div className="font-semibold text-text">Manage</div>
                  <div className="mt-2 text-sm text-subtext">
                    Use Stripe portal to update payment method, cancel, or view invoices.
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => void goPortal()}
                      disabled={!initialProfile?.stripe_customer_id}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coin bundles</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                { key: 'coins_50' as const, label: '50 coins', price: '£0.99' },
                { key: 'coins_150' as const, label: '150 coins', price: '£1.99' },
                { key: 'coins_400' as const, label: '400 coins', price: '£4.99' },
                { key: 'coins_1000' as const, label: '1000 coins', price: '£9.99' }
              ].map((b) => (
                <div key={b.key} className="rounded-3xl border border-border bg-bg/20 p-5">
                  <div className="font-semibold text-text">{b.label}</div>
                  <div className="mt-2 text-sm text-subtext">{b.price}</div>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => void goCheckout(b.key)}>
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === 'notifications' ? (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between rounded-3xl border border-border bg-bg/20 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-text">Daily study reminder</div>
                <div className="mt-1 text-xs text-subtext">Nudge to keep your streak alive.</div>
              </div>
              <input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-3xl border border-border bg-bg/20 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-text">Streak at risk warning</div>
                <div className="mt-1 text-xs text-subtext">Heads up when you might lose streak.</div>
              </div>
              <input type="checkbox" checked={streakRisk} onChange={(e) => setStreakRisk(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-3xl border border-border bg-bg/20 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-text">Exam countdown alerts</div>
                <div className="mt-1 text-xs text-subtext">Reminders as exams get closer.</div>
              </div>
              <input type="checkbox" checked={exam} onChange={(e) => setExam(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-3xl border border-border bg-bg/20 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-text">Group activity notifications</div>
                <div className="mt-1 text-xs text-subtext">Messages and deck sharing.</div>
              </div>
              <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} />
            </label>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={async () => {
                  setMsg(null)
                  const res = await withLoading(
                    fetch('/api/settings/notifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ daily, streakRisk, exam, group })
                    })
                  )
                  if (!res.ok) {
                    setMsg('Could not save notification preferences.')
                    return
                  }
                  setMsg('Preferences saved.')
                }}
              >
                Save preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'account' ? (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-border bg-bg/20 p-5">
                <div className="font-semibold text-text">Change password</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <Input
                    type="password"
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="New password"
                  />
                  <Input
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    disabled={!pw1 || pw1.length < 8 || pw1 !== pw2}
                    onClick={async () => {
                      setMsg(null)
                      const res = await withLoading(
                        fetch('/api/user/password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ newPassword: pw1 })
                        })
                      )
                      if (!res.ok) {
                        setMsg('Could not change password.')
                        return
                      }
                      setPw1('')
                      setPw2('')
                      setMsg('Password updated.')
                    }}
                  >
                    Change password
                  </Button>
                </div>
                <div className="mt-2 text-xs text-subtext">Minimum 8 characters.</div>
              </div>

              <div className="rounded-3xl border border-pink/25 bg-pink/10 p-5">
                <div className="font-semibold text-text">Delete account</div>
                <div className="mt-2 text-sm text-subtext">
                  Type DELETE to confirm. This cannot be undone.
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE" />
                  <Button
                    className="bg-pink text-bg"
                    disabled={deleteText !== 'DELETE'}
                    onClick={async () => {
                      setMsg(null)
                      const res = await withLoading(fetch('/api/user/delete', { method: 'POST' }))
                      if (!res.ok) {
                        setMsg('Could not delete account.')
                        return
                      }
                      window.location.href = '/login'
                    }}
                  >
                    Delete account
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-bg/20 p-5">
                <div className="font-semibold text-text">Session</div>
                <div className="mt-3">
                  <form action={logoutAction}>
                    <Button variant="outline" type="submit">
                      Log out
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
