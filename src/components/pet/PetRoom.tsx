'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { Profile } from '@/lib/data/profile'
import type { ShopItemRow } from '@/lib/shop/data'
import { cn } from '@/lib/cn'

const messages = [
  "Keep studying! You're doing great!",
  'I believe in you!',
  'Feed me after your next session!',
  "You've got this!"
] as const

function pickMessage() {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function colourStops(colour: string) {
  if (colour === 'pink') return ['#FF8FAB', '#FFB6C8']
  if (colour === 'blue') return ['#6EC7FF', '#3A86FF']
  if (colour === 'purple') return ['#C77DFF', '#7C5CFF']
  if (colour === 'green') return ['#7AE7B9', '#2EE59D']
  if (colour === 'albino') return ['#FFFFFF', '#DDE6FF']
  if (colour === 'spotted') return ['#FFB6C8', '#FF8FAB']
  if (colour === 'striped') return ['#6EC7FF', '#B9A8FF']
  if (colour === 'sakura') return ['#FF8FAB', '#FFD1DC']
  if (colour === 'golden') return ['#FFD700', '#FFE59A']
  if (colour === 'galaxy') return ['#7C5CFF', '#1B1B6B']
  if (colour === 'rainbow') return ['#FF8FAB', '#7AE7B9']
  if (colour === 'cherry') return ['#FF8FAB', '#FFD1DC']
  if (colour === 'midnight') return ['#2A2A4A', '#0A0A1A']
  return ['#FF8FAB', '#FFB6C8']
}

function UnderwaterScene({ sad }: { sad: boolean }) {
  return (
    <svg viewBox="0 0 900 520" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0A0A1A" />
          <stop offset="1" stopColor="#141428" />
        </linearGradient>
        <linearGradient id="floor" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#141428" />
          <stop offset="1" stopColor="#0A0A1A" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="900" height="520" fill="url(#water)" />
      <path
        d="M0 420C140 380 220 460 340 430c150-38 210-14 300 12 118 34 170-12 260-24v102H0z"
        fill="url(#floor)"
        opacity="0.9"
      />
      <path
        d="M130 420c10-40 20-76 48-92 44-26 90 30 98 92"
        fill="none"
        stroke="#2A2A4A"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.7"
      />

      <g transform="translate(120 285)">
        <path
          d={sad ? 'M30 130c60-70 90-90 120-110' : 'M30 130c40-90 90-120 130-130'}
          fill="none"
          stroke="#2A2A4A"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={sad ? 'M130 20c-18 10-30 30-28 52' : 'M130 20c22 10 36 28 38 54'}
          fill="none"
          stroke={sad ? '#8888AA' : '#7AE7B9'}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={sad ? 'M110 40c-16 12-22 28-18 44' : 'M110 40c18 10 28 26 28 46'}
          fill="none"
          stroke={sad ? '#8888AA' : '#7AE7B9'}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      <g transform="translate(650 350)">
        <path
          d="M30 90c60-40 110-50 170-40"
          fill="none"
          stroke="#2A2A4A"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M60 70c36-34 70-46 104-44"
          fill="none"
          stroke="#2A2A4A"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}

function Axolotl({
  happiness,
  colour
}: {
  happiness: number
  colour: string
}) {
  const sad = happiness <= 30
  const bright = happiness >= 71
  const baseStops = sad ? ['#8888AA', '#6C6C90'] : colourStops(colour)

  return (
    <motion.div
      className="relative w-[320px] max-w-[80vw]"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 420 360" className="h-auto w-full">
        <defs>
          <linearGradient id="prBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={baseStops[0]} />
            <stop offset="1" stopColor={baseStops[1]} />
          </linearGradient>
          <linearGradient id="prBelly" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={sad ? '#6C6C90' : '#FFE2EA'} />
            <stop offset="1" stopColor={sad ? '#8888AA' : '#FFC9D7'} />
          </linearGradient>
        </defs>

        <motion.g
          animate={{ rotate: [0, -1.5, 0, 1.5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '210px 190px' }}
        >
          <path
            d="M150 136c-26 0-50 28-50 68 0 74 52 134 110 134s110-60 110-134c0-40-24-68-50-68-14 0-28 8-42 8-18 0-28-14-42-14s-24 14-42 14c-14 0-28-8-42-8z"
            fill="url(#prBody)"
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M174 176c0 56 18 108 36 108s36-52 36-108c0-18-12-32-30-32h-12c-18 0-30 14-30 32z"
            fill="url(#prBelly)"
            opacity="0.95"
          />
          <path
            d="M138 158c-44-10-76-40-88-84 42 4 82 20 106 50"
            fill="url(#prBody)"
            opacity="0.9"
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M282 158c44-10 76-40 88-84-42 4-82 20-106 50"
            fill="url(#prBody)"
            opacity="0.9"
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g opacity={sad ? 0.7 : 0.95}>
            <path
              d="M118 170c18 8 30 20 36 36"
              fill="none"
              stroke="#FF8FAB"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M112 196c20 6 34 18 42 34"
              fill="none"
              stroke="#FFD700"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M126 144c16 10 26 22 30 36"
              fill="none"
              stroke="#FF8FAB"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M302 170c-18 8-30 20-36 36"
              fill="none"
              stroke="#FF8FAB"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M308 196c-20 6-34 18-42 34"
              fill="none"
              stroke="#FFD700"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M294 144c-16 10-26 22-30 36"
              fill="none"
              stroke="#FF8FAB"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>

          <circle cx="178" cy="196" r="22" fill="#FFFFFF" opacity={sad ? 0.85 : 1} />
          <circle cx="242" cy="196" r="22" fill="#FFFFFF" opacity={sad ? 0.85 : 1} />
          <circle cx="180" cy="198" r={sad ? 8 : 10} fill="#0A0A1A" opacity={sad ? 0.8 : 1} />
          <circle cx="244" cy="198" r={sad ? 8 : 10} fill="#0A0A1A" opacity={sad ? 0.8 : 1} />
          <circle cx="174" cy="190" r="4" fill="#FFFFFF" opacity={sad ? 0.55 : 0.95} />
          <circle cx="238" cy="190" r="4" fill="#FFFFFF" opacity={sad ? 0.55 : 0.95} />
          <circle cx="160" cy="228" r="10" fill="#FF8FAB" opacity={sad ? 0.08 : 0.18} />
          <circle cx="260" cy="228" r="10" fill="#FF8FAB" opacity={sad ? 0.08 : 0.18} />
          <path
            d={sad ? 'M198 228c10-8 24-8 34 0' : 'M198 222c10 14 24 14 34 0'}
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="210" cy="214" r="3" fill="#2A2A4A" opacity={sad ? 0.4 : 0.6} />
          <path
            d="M154 270c-18 0-32 16-32 34 0 16 12 28 26 28 12 0 22-10 26-22"
            fill="url(#prBody)"
            opacity="0.9"
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M266 270c18 0 32 16 32 34 0 16-12 28-26 28-12 0-22-10-26-22"
            fill="url(#prBody)"
            opacity="0.9"
            stroke="#2A2A4A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {bright ? (
          <g opacity="0.9">
            <motion.circle
              cx="92"
              cy="120"
              r="7"
              fill="#FFD700"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="330"
              cy="110"
              r="5"
              fill="#FFD700"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="318"
              cy="250"
              r="6"
              fill="#FF8FAB"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ) : null}
      </svg>
    </motion.div>
  )
}

function HeartBar({ value }: { value: number }) {
  const hearts = 10
  const filled = Math.round((clamp(value, 0, 100) / 100) * hearts)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: hearts }).map((_, i) => (
        <span key={i} className={cn('text-base', i < filled ? 'text-pink' : 'text-border')}>
          ♥
        </span>
      ))}
      <span className="ml-2 text-xs text-subtext">{clamp(value, 0, 100)}%</span>
    </div>
  )
}

function Decoration({
  item,
  className
}: {
  item: ShopItemRow
  className: string
}) {
  if (!item.image_url) return null
  return (
    <div className={className}>
      <img
        src={item.image_url}
        alt=""
        className="h-full w-full select-none"
        draggable={false}
      />
    </div>
  )
}

export function PetRoom({
  profile,
  items,
  ownedIds,
  plan
}: {
  profile: Profile
  items: ShopItemRow[]
  ownedIds: string[]
  plan: string
}) {
  const { withLoading } = useLoading()

  const owned = useMemo(() => new Set(ownedIds), [ownedIds])
  const happiness = clamp(profile.pet_happiness ?? 100, 0, 100)
  const sad = happiness <= 30

  const [speech, setSpeech] = useState(() => pickMessage())
  useEffect(() => {
    const id = setInterval(() => setSpeech(pickMessage()), 30_000)
    return () => clearInterval(id)
  }, [])

  const ownedDecorations = useMemo(
    () => items.filter((i) => i.type === 'decoration' && owned.has(i.id)),
    [items, owned]
  )
  const ownedAccessories = useMemo(
    () => items.filter((i) => i.type === 'accessory' && owned.has(i.id)),
    [items, owned]
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card/70 p-6">
        <div>
          <div className="font-heading text-3xl text-text">
            Level {profile.pet_level ?? 1} Axolotl
          </div>
          <div className="mt-2 text-sm text-subtext">Coins: {profile.coins ?? 0}</div>
        </div>
        <div className="rounded-3xl border border-border bg-bg/30 px-4 py-3 text-right">
          <div className="text-xs text-subtext">Happiness</div>
          <div className="mt-1">
            <HeartBar value={happiness} />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-bg/30">
        <div className="relative h-[520px]">
          <UnderwaterScene sad={sad} />
          {ownedDecorations.map((d) => {
            if (d.name === 'Extra plant') {
              return <Decoration key={d.id} item={d} className="absolute left-10 bottom-12 h-28 w-28" />
            }
            if (d.name === 'Fairy lights') {
              return <Decoration key={d.id} item={d} className="absolute left-1/2 top-4 h-24 w-24 -translate-x-1/2" />
            }
            if (d.name === 'Little desk') {
              return <Decoration key={d.id} item={d} className="absolute right-12 bottom-14 h-28 w-28" />
            }
            if (d.name === 'Bookshelf') {
              return <Decoration key={d.id} item={d} className="absolute left-1/2 bottom-10 h-32 w-32 -translate-x-1/2" />
            }
            if (d.name === 'Disco ball') {
              return <Decoration key={d.id} item={d} className="absolute right-24 top-6 h-24 w-24" />
            }
            if (d.name === 'Treasure chest') {
              return <Decoration key={d.id} item={d} className="absolute left-28 bottom-10 h-28 w-28" />
            }
            return null
          })}

          <motion.div
            className="absolute left-1/2 top-10 w-[360px] -translate-x-1/2 px-4"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative rounded-3xl border border-border bg-card/60 px-5 py-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
              <div className="text-sm font-semibold text-gold">{speech}</div>
              <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-border bg-card/60" />
            </div>
          </motion.div>

          <div className="absolute left-1/2 top-40 -translate-x-1/2">
            <Axolotl happiness={happiness} colour={profile.pet_colour ?? 'pink'} />
            <div className="mt-3 flex justify-center">
              <HeartBar value={happiness} />
            </div>
          </div>

          <div className="absolute left-8 bottom-10 grid gap-2">
            {ownedDecorations.slice(0, 4).map((d, idx) => (
              <motion.div
                key={d.id}
                className="flex items-center gap-3 rounded-3xl border border-border bg-card/60 px-4 py-3 text-sm text-text"
                animate={
                  d.is_premium
                    ? { y: [0, -8, 0] }
                    : idx % 2 === 0
                      ? { y: [0, -4, 0] }
                      : undefined
                }
                transition={
                  d.is_premium
                    ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt=""
                    className="h-10 w-10 select-none"
                    draggable={false}
                  />
                ) : null}
                <span>{d.name}</span>
              </motion.div>
            ))}
          </div>

          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-[-20px] h-3 w-3 rounded-full bg-pink/15 ring-1 ring-pink/20"
              style={{ left: `${10 + i * 8}%` }}
              animate={{ y: [0, -560], opacity: [0, 0.8, 0] }}
              transition={{
                duration: 4 + (i % 4) * 0.6,
                repeat: Infinity,
                delay: i * 0.25
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/70 p-5">
          <div className="font-semibold text-text">Accessories</div>
          <div className="mt-1 text-sm text-subtext">
            Tap to wear or remove.
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ownedAccessories.length === 0 ? (
              <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext sm:col-span-2">
                No accessories yet. Visit the shop.
              </div>
            ) : (
              ownedAccessories.map((a) => {
                const equipped = (profile.pet_accessories ?? []).includes(a.name)
                const locked = a.is_premium && plan === 'free'
                return (
                  <div key={a.id} className="rounded-3xl border border-border bg-bg/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-text">{a.name}</div>
                      {a.is_premium ? (
                        <div className="rounded-full bg-pink/15 px-3 py-1 text-xs font-semibold text-pink">
                          Premium
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant={equipped ? 'outline' : 'secondary'}
                        disabled={locked}
                        onClick={async () => {
                          const res = await withLoading(
                            fetch('/api/pet/equip', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ itemId: a.id })
                            })
                          )
                          if (res.ok) window.location.reload()
                        }}
                        className="w-full"
                      >
                        {locked ? 'Premium only' : equipped ? 'Remove' : 'Wear'}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/70 p-5">
          <div className="font-semibold text-text">Room items</div>
          <div className="mt-1 text-sm text-subtext">
            Decorations you own appear in the room.
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ownedDecorations.length === 0 ? (
              <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext sm:col-span-2">
                No extra decorations yet.
              </div>
            ) : (
              ownedDecorations.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-3xl border border-border bg-bg/20 p-4 text-sm text-text">
                  {d.image_url ? (
                    <img src={d.image_url} alt="" className="h-10 w-10 select-none" draggable={false} />
                  ) : null}
                  <span>{d.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
