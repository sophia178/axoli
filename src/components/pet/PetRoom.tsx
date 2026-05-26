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
          <stop offset="0" stopColor={sad ? '#141428' : '#0B2A5B'} />
          <stop offset="0.55" stopColor={sad ? '#0A0A1A' : '#0A1633'} />
          <stop offset="1" stopColor="#0A0A1A" />
        </linearGradient>
        <linearGradient id="sand" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D9C29A" />
          <stop offset="1" stopColor="#9B7B52" />
        </linearGradient>
        <linearGradient id="rock" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2A2A4A" />
          <stop offset="1" stopColor="#0F1030" />
        </linearGradient>
        <radialGradient id="light" cx="50%" cy="0%" r="80%">
          <stop offset="0" stopColor="#6EC7FF" stopOpacity={sad ? 0.06 : 0.14} />
          <stop offset="1" stopColor="#6EC7FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="520" fill="url(#water)" />
      <rect x="0" y="0" width="900" height="520" fill="url(#light)" />

      <motion.path
        d="M-80 110c120-60 240-60 360 0s240 60 360 0 240-60 360 0v60c-120 60-240 60-360 0s-240-60-360 0-240 60-360 0-240-60-360 0z"
        fill="#FFFFFF"
        opacity={sad ? 0.04 : 0.08}
        animate={{ x: [0, 80, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M-140 180c140-70 280-70 420 0s280 70 420 0 280-70 420 0v70c-140 70-280 70-420 0s-280-70-420 0-280 70-420 0-280-70-420 0z"
        fill="#FFFFFF"
        opacity={sad ? 0.03 : 0.06}
        animate={{ x: [0, -90, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <path
        d="M0 410C140 370 220 450 340 420c150-38 210-14 300 12 118 34 170-12 260-24v112H0z"
        fill="url(#sand)"
        opacity="0.95"
      />
      <path
        d="M0 402C160 360 240 430 360 406c150-30 210-10 300 16 120 34 180-16 240-22"
        fill="none"
        stroke="#FFE59A"
        strokeWidth="8"
        strokeLinecap="round"
        opacity={sad ? 0.08 : 0.14}
      />

      <path
        d="M120 444c0-46 42-84 88-84 58 0 94 42 98 84-24 20-58 30-98 30-38 0-68-10-88-30z"
        fill="url(#rock)"
        opacity="0.88"
      />
      <path
        d="M640 458c0-58 54-106 116-106 76 0 124 54 128 106-30 26-76 38-128 38-48 0-86-12-116-38z"
        fill="url(#rock)"
        opacity="0.88"
      />

      <motion.g
        animate={{ rotate: sad ? [-2, 2, -2] : [-4, 4, -4] }}
        transition={{ duration: sad ? 6 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '210px 420px' }}
      >
        <path
          d="M220 420c-10-70 6-110 30-140 26-32 30-56 12-84 54 24 64 70 30 126 40-14 70-6 92 24-68-10-104 34-108 132h-56z"
          fill={sad ? '#2A2A4A' : '#2EE59D'}
          opacity="0.9"
        />
        <path
          d="M170 420c-10-78 12-126 46-164 26-30 26-54 0-80 54 30 74 78 54 130 30 0 52 18 62 56-34-10-58 8-70 46-4 10-8 28-8 28h-84z"
          fill={sad ? '#2A2A4A' : '#7AE7B9'}
          opacity="0.9"
        />
      </motion.g>

      {Array.from({ length: 14 }).map((_, i) => {
        const x = 80 + i * 54
        const delay = (i % 7) * 0.35
        const size = 3 + (i % 4)
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={540}
            r={size}
            fill="#DDE6FF"
            opacity={sad ? 0.14 : 0.22}
            animate={{ cy: [540, 120], opacity: [0, sad ? 0.18 : 0.32, 0] }}
            transition={{ duration: 6 + (i % 3) * 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
          />
        )
      })}
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
  const bright = happiness >= 71 && !sad
  const baseStops = sad ? ['#6C6C90', '#8888AA'] : colourStops(colour)
  const bodyStroke = sad ? '#6C6C90' : '#2A2A4A'

  return (
    <motion.div
      className="relative w-[340px] max-w-[86vw]"
      animate={{ y: sad ? [0, -6, 0] : [0, -12, 0] }}
      transition={{ duration: sad ? 4 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 520 420" className="h-auto w-full">
        <defs>
          <linearGradient id="axBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={baseStops[0]} />
            <stop offset="1" stopColor={baseStops[1]} />
          </linearGradient>
          <linearGradient id="axBelly" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={sad ? '#505072' : '#FFEAF0'} />
            <stop offset="1" stopColor={sad ? '#6C6C90' : '#FFC9D7'} />
          </linearGradient>
          <linearGradient id="axFin" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={sad ? '#6C6C90' : '#FF8FAB'} stopOpacity="0.35" />
            <stop offset="1" stopColor={sad ? '#6C6C90' : '#FFD700'} stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id="eyeShine" cx="35%" cy="30%" r="60%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g
          animate={{ rotate: sad ? [0, -1, 0, 1, 0] : [0, -1.8, 0, 1.8, 0] }}
          transition={{ duration: sad ? 5.2 : 4.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '260px 230px' }}
        >
          <path
            d="M370 232c86 28 112 88 78 144-34 56-104 56-132 24 26-18 48-48 52-84 4-34-2-62-18-84 8-2 14-2 20 0z"
            fill="url(#axFin)"
            opacity="0.9"
          />
          <path
            d="M404 280c40 26 52 56 34 82-18 26-54 26-72 8 18-10 30-28 34-54 4-22 0-40-12-56 6-1 10-1 16 0z"
            fill="url(#axBody)"
            opacity="0.65"
          />

          <path
            d="M170 244c0-86 70-154 156-154 92 0 168 72 168 162 0 102-84 176-192 176-104 0-132-70-132-184z"
            fill="url(#axBody)"
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M230 270c0-54 36-96 88-96s88 42 88 96c0 66-36 118-88 118s-88-52-88-118z"
            fill="url(#axBelly)"
            opacity="0.95"
          />

          <path
            d="M220 134c-52-16-86-52-98-108 52 8 92 30 116 66"
            fill="url(#axFin)"
            opacity="0.7"
          />
          <path
            d="M436 140c52-16 86-52 98-108-52 8-92 30-116 66"
            fill="url(#axFin)"
            opacity="0.7"
          />

          <g opacity={sad ? 0.65 : 0.95}>
            {Array.from({ length: 3 }).map((_, i) => {
              const x = 210 - i * 22
              const y = 138 + i * 18
              return (
                <g key={`lg-${i}`}>
                  <path
                    d={`M${x} ${y}c-38-30-54-60-48-88 34 14 54 40 60 78`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FF8FAB'}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x - 6} ${y - 6}c-20-18-28-34-24-50`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FFD700'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d={`M${x + 6} ${y + 4}c-18-14-28-28-30-42`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FFD700'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                </g>
              )
            })}
            {Array.from({ length: 3 }).map((_, i) => {
              const x = 430 + i * 22
              const y = 138 + i * 18
              return (
                <g key={`rg-${i}`}>
                  <path
                    d={`M${x} ${y}c38-30 54-60 48-88-34 14-54 40-60 78`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FF8FAB'}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x + 6} ${y - 6}c20-18 28-34 24-50`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FFD700'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d={`M${x - 6} ${y + 4}c18-14 28-28 30-42`}
                    fill="none"
                    stroke={sad ? '#8888AA' : '#FFD700'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                </g>
              )
            })}
          </g>

          <motion.path
            d="M238 128c54-44 126-44 180 0"
            fill="none"
            stroke="url(#axFin)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity={sad ? 0.18 : 0.28}
            animate={{ opacity: sad ? [0.14, 0.2, 0.14] : [0.22, 0.32, 0.22] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <path
            d="M232 332c-20 0-34 18-34 38 0 18 14 32 30 32 14 0 26-12 30-26"
            fill="url(#axBody)"
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M356 332c20 0 34 18 34 38 0 18-14 32-30 32-14 0-26-12-30-26"
            fill="url(#axBody)"
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M252 338c-10 14-22 18-34 12"
            fill="none"
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d="M338 338c10 14 22 18 34 12"
            fill="none"
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.25"
          />

          <path
            d="M216 300c-10 0-18 10-18 22 0 10 8 18 18 18 8 0 14-6 16-14"
            fill="url(#axBody)"
            stroke={bodyStroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M372 300c10 0 18 10 18 22 0 10-8 18-18 18-8 0-14-6-16-14"
            fill="url(#axBody)"
            stroke={bodyStroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          <circle cx="276" cy="230" r="34" fill="#FFFFFF" opacity={sad ? 0.85 : 1} />
          <circle cx="372" cy="230" r="34" fill="#FFFFFF" opacity={sad ? 0.85 : 1} />
          <circle cx="276" cy="232" r={sad ? 12 : 14} fill="#0A0A1A" opacity={sad ? 0.78 : 1} />
          <circle cx="372" cy="232" r={sad ? 12 : 14} fill="#0A0A1A" opacity={sad ? 0.78 : 1} />
          <circle cx="266" cy="220" r="10" fill="url(#eyeShine)" />
          <circle cx="362" cy="220" r="10" fill="url(#eyeShine)" />
          <circle cx="288" cy="242" r="4" fill="#FFFFFF" opacity={sad ? 0.4 : 0.75} />
          <circle cx="384" cy="242" r="4" fill="#FFFFFF" opacity={sad ? 0.4 : 0.75} />

          <circle cx="244" cy="266" r="14" fill="#FF8FAB" opacity={sad ? 0.06 : 0.16} />
          <circle cx="404" cy="266" r="14" fill="#FF8FAB" opacity={sad ? 0.06 : 0.16} />
          <path
            d={sad ? 'M304 274c16-10 40-10 56 0' : 'M304 270c16 18 40 18 56 0'}
            stroke={bodyStroke}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={sad ? 'M322 256c-8 6-14 12-16 18' : 'M322 256c-10 8-16 14-18 20'}
            stroke={bodyStroke}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d={sad ? 'M350 256c8 6 14 12 16 18' : 'M350 256c10 8 16 14 18 20'}
            stroke={bodyStroke}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.22"
          />
        </motion.g>

        {bright ? (
          <g opacity="0.9">
            <motion.circle
              cx="94"
              cy="120"
              r="7"
              fill="#FFD700"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="462"
              cy="124"
              r="5"
              fill="#FFD700"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="450"
              cy="290"
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

function HungerBar({ value }: { value: number }) {
  const chunks = 10
  const filled = Math.round((clamp(value, 0, 100) / 100) * chunks)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: chunks }).map((_, i) => (
        <span key={i} className={cn('text-base', i < filled ? 'text-gold' : 'text-border')}>
          🍤
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
  const hunger = clamp((profile as any).hunger_level ?? 100, 0, 100)
  const starving = hunger < 10
  const hungry = hunger < 30
  const sad = happiness <= 30 || starving

  const [speech, setSpeech] = useState(() => (starving ? 'Please feed me... 😢' : hungry ? "I'm hungry! 🍤" : pickMessage()))
  useEffect(() => {
    if (starving) {
      setSpeech('Please feed me... 😢')
      return
    }
    if (hungry) {
      setSpeech("I'm hungry! 🍤")
      return
    }
    const id = setInterval(() => setSpeech(pickMessage()), 30_000)
    return () => clearInterval(id)
  }, [hungry, starving])

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
        <div className="grid gap-3 rounded-3xl border border-border bg-bg/30 px-4 py-3 text-right">
          <div>
            <div className="text-xs text-subtext">Happiness</div>
            <div className="mt-1">
              <HeartBar value={happiness} />
            </div>
          </div>
          <div>
            <div className="text-xs text-subtext">Hunger</div>
            <div className="mt-1">
              <HungerBar value={hunger} />
            </div>
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
            <Axolotl happiness={sad ? Math.min(happiness, 30) : happiness} colour={profile.pet_colour ?? 'pink'} />
            <div className="mt-3 flex justify-center">
              <div className="grid gap-2 text-center">
                <HeartBar value={happiness} />
                <HungerBar value={hunger} />
              </div>
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
