'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function UnderwaterScene({ sad }: { sad: boolean }) {
  return (
    <svg viewBox="0 0 900 520" className="absolute inset-0 h-full w-full">
      <style>
        {`
          .axoli-bubble-1 { animation: axoli-bubble 6.5s linear infinite; }
          .axoli-bubble-2 { animation: axoli-bubble 7.8s linear infinite 0.8s; }
          .axoli-bubble-3 { animation: axoli-bubble 8.6s linear infinite 1.6s; }
          .axoli-bubble-4 { animation: axoli-bubble 7.2s linear infinite 2.1s; }
          @keyframes axoli-bubble {
            0% { transform: translateY(0px); opacity: 0; }
            10% { opacity: 0.35; }
            80% { opacity: 0.28; }
            100% { transform: translateY(-420px); opacity: 0; }
          }
          .axoli-weed-1 { animation: axoli-weed 4.8s ease-in-out infinite; transform-origin: 210px 420px; }
          .axoli-weed-2 { animation: axoli-weed 5.6s ease-in-out infinite; transform-origin: 180px 420px; }
          .axoli-weed-3 { animation: axoli-weed 5.1s ease-in-out infinite; transform-origin: 720px 420px; }
          @keyframes axoli-weed {
            0% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
            100% { transform: rotate(-3deg); }
          }
          .axoli-caustics { animation: axoli-caustics 11s ease-in-out infinite; }
          @keyframes axoli-caustics {
            0% { transform: translateX(0px); opacity: 0.06; }
            50% { transform: translateX(80px); opacity: 0.085; }
            100% { transform: translateX(0px); opacity: 0.06; }
          }
        `}
      </style>
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sad ? '#101024' : '#07224C'} />
          <stop offset="0.55" stopColor={sad ? '#0A0A1A' : '#0A2A63'} />
          <stop offset="1" stopColor={sad ? '#0A0A1A' : '#071734'} />
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
        <linearGradient id="glassEdge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#DDE6FF" stopOpacity={sad ? 0.05 : 0.12} />
          <stop offset="0.6" stopColor="#DDE6FF" stopOpacity="0" />
          <stop offset="1" stopColor="#DDE6FF" stopOpacity={sad ? 0.03 : 0.08} />
        </linearGradient>
        <linearGradient id="glassSheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.22" stopColor="#FFFFFF" stopOpacity={sad ? 0.03 : 0.08} />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.78" stopColor="#FFFFFF" stopOpacity={sad ? 0.02 : 0.06} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="900" height="520" fill="url(#water)" />
      <rect x="0" y="0" width="900" height="520" fill="url(#light)" />

      <path
        className="axoli-caustics"
        d="M-80 110c120-60 240-60 360 0s240 60 360 0 240-60 360 0v60c-120 60-240 60-360 0s-240-60-360 0-240 60-360 0-240-60-360 0z"
        fill="#FFFFFF"
        opacity={sad ? 0.04 : 0.08}
      />
      <path
        className="axoli-caustics"
        d="M-140 180c140-70 280-70 420 0s280 70 420 0 280-70 420 0v70c-140 70-280 70-420 0s-280-70-420 0-280 70-420 0-280-70-420 0z"
        fill="#FFFFFF"
        opacity={sad ? 0.03 : 0.06}
      />

      <path
        d="M0 410C140 370 220 450 340 420c150-38 210-14 300 12 118 34 170-12 260-24v112H0z"
        fill="url(#sand)"
        opacity="0.95"
      />
      {Array.from({ length: 42 }).map((_, i) => {
        const x = 40 + (i * 19) % 820
        const y = 418 + ((i * 13) % 86)
        const r = 2 + (i % 4)
        const o = sad ? 0.14 : 0.22
        return <circle key={i} cx={x} cy={y} r={r} fill="#FFE59A" opacity={o} />
      })}
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

      <g className="axoli-weed-1">
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
      </g>

      <g className="axoli-weed-2">
        <path
          d="M740 420c14-70-2-112-26-146-24-34-28-58-12-84-56 26-70 74-36 132-42-12-74-2-98 30 72-12 112 34 116 128h56z"
          fill={sad ? '#2A2A4A' : '#2EE59D'}
          opacity="0.88"
        />
        <path
          d="M700 420c12-78-12-132-52-170-24-24-26-50-2-76-54 32-76 84-58 138-28 2-50 20-60 54 34-8 58 10 70 46 4 10 10 28 10 28h92z"
          fill={sad ? '#2A2A4A' : '#7AE7B9'}
          opacity="0.88"
        />
      </g>

      <g className="axoli-weed-3">
        <path
          d="M468 420c-8-74 12-122 40-164 18-26 18-50-2-74 52 34 70 84 44 136 34-2 58 18 72 56-38-8-62 10-74 46-4 10-10 28-10 28h-70z"
          fill={sad ? '#2A2A4A' : '#2EE59D'}
          opacity="0.86"
        />
      </g>

      <g opacity={sad ? 0.18 : 0.28}>
        <g className="axoli-bubble-1" style={{ transform: 'translateY(0px)' }}>
          <circle cx="150" cy="500" r="6" fill="#DDE6FF" />
          <circle cx="176" cy="520" r="3.5" fill="#DDE6FF" opacity="0.8" />
        </g>
        <g className="axoli-bubble-2" style={{ transform: 'translateY(0px)' }}>
          <circle cx="520" cy="510" r="7" fill="#DDE6FF" />
          <circle cx="548" cy="525" r="4" fill="#DDE6FF" opacity="0.8" />
        </g>
        <g className="axoli-bubble-3" style={{ transform: 'translateY(0px)' }}>
          <circle cx="740" cy="500" r="5.5" fill="#DDE6FF" />
          <circle cx="760" cy="524" r="3" fill="#DDE6FF" opacity="0.8" />
        </g>
        <g className="axoli-bubble-4" style={{ transform: 'translateY(0px)' }}>
          <circle cx="340" cy="512" r="6.5" fill="#DDE6FF" />
          <circle cx="362" cy="530" r="3.5" fill="#DDE6FF" opacity="0.8" />
        </g>
      </g>

      <rect x="18" y="14" width="38" height="492" fill="url(#glassEdge)" />
      <rect x="844" y="14" width="38" height="492" fill="url(#glassEdge)" />
      <rect x="0" y="0" width="900" height="520" fill="url(#glassSheen)" opacity={sad ? 0.5 : 0.9} />
      <rect
        x="12"
        y="12"
        width="876"
        height="496"
        fill="none"
        stroke="#DDE6FF"
        strokeOpacity={sad ? 0.08 : 0.16}
        strokeWidth="4"
        rx="26"
      />
    </svg>
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

type AccessoryPos = { x: number; y: number }

const ACCESSORY_POS_KEY = 'axoli_pet_accessory_pos_v1'

function readAccessoryPositions(): Record<string, AccessoryPos> {
  try {
    const raw = window.localStorage.getItem(ACCESSORY_POS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as any
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, AccessoryPos> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (!v || typeof v !== 'object') continue
      const x = Number((v as any).x)
      const y = Number((v as any).y)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      out[String(k)] = { x: clamp(x, 0, 1), y: clamp(y, 0, 1) }
    }
    return out
  } catch {
    return {}
  }
}

function writeAccessoryPositions(pos: Record<string, AccessoryPos>) {
  try {
    window.localStorage.setItem(ACCESSORY_POS_KEY, JSON.stringify(pos))
  } catch {}
}

function DraggableAccessory({
  id,
  name,
  imageUrl,
  containerRef,
  containerSize,
  pos,
  onPosChange,
  onRemove
}: {
  id: string
  name: string
  imageUrl: string
  containerRef: { current: HTMLDivElement | null }
  containerSize: { w: number; h: number }
  pos: AccessoryPos
  onPosChange: (next: AccessoryPos) => void
  onRemove: () => void
}) {
  const dragging = useRef<{
    active: boolean
    startLeft: number
    startTop: number
    pointerStartX: number
    pointerStartY: number
  }>({ active: false, startLeft: 0, startTop: 0, pointerStartX: 0, pointerStartY: 0 })

  const size = 60
  const maxLeft = Math.max(0, containerSize.w - size)
  const maxTop = Math.max(0, containerSize.h - size)
  const left = clamp(pos.x, 0, 1) * maxLeft
  const top = clamp(pos.y, 0, 1) * maxTop

  return (
    <div
      className="group absolute z-[20]"
      style={{
        left,
        top,
        width: size,
        height: size,
        touchAction: 'none'
      }}
      onPointerDown={(e) => {
        const el = containerRef.current
        if (!el) return
        dragging.current = {
          active: true,
          startLeft: left,
          startTop: top,
          pointerStartX: e.clientX,
          pointerStartY: e.clientY
        }
        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current.active) return
        const dx = e.clientX - dragging.current.pointerStartX
        const dy = e.clientY - dragging.current.pointerStartY
        const nextLeft = clamp(dragging.current.startLeft + dx, 0, maxLeft)
        const nextTop = clamp(dragging.current.startTop + dy, 0, maxTop)
        onPosChange({
          x: maxLeft === 0 ? 0 : nextLeft / maxLeft,
          y: maxTop === 0 ? 0 : nextTop / maxTop
        })
      }}
      onPointerUp={(e) => {
        dragging.current.active = false
        try {
          ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
        } catch {}
      }}
    >
      <img src={imageUrl} alt={name} className="h-full w-full select-none" draggable={false} />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card/90 text-xs font-semibold text-text shadow-sm group-hover:flex"
        aria-label={`Remove ${name}`}
      >
        ×
      </button>
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
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(() => profile.pet_accessories ?? [])
  useEffect(() => {
    setEquippedAccessories(profile.pet_accessories ?? [])
  }, [profile.pet_accessories])

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
  const showHappyAxolotl = happiness > 50 && hunger > 30
  const tankRef = useRef<HTMLDivElement | null>(null)
  const [tankSize, setTankSize] = useState<{ w: number; h: number }>({ w: 900, h: 520 })
  const [accessoryPositions, setAccessoryPositions] = useState<Record<string, AccessoryPos>>({})

  useEffect(() => {
    setAccessoryPositions(readAccessoryPositions())
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.setTimeout(() => writeAccessoryPositions(accessoryPositions), 150)
    return () => window.clearTimeout(id)
  }, [accessoryPositions])
  useEffect(() => {
    const el = tankRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setTankSize({ w: Math.max(1, r.width), h: Math.max(1, r.height) })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const equippedAccessoryItems = useMemo(
    () => items.filter((i) => i.type === 'accessory' && equippedAccessories.includes(i.name) && Boolean(i.image_url)),
    [items, equippedAccessories]
  )

  useEffect(() => {
    if (equippedAccessoryItems.length === 0) return
    setAccessoryPositions((prev) => {
      let changed = false
      const next = { ...prev }
      for (let i = 0; i < equippedAccessoryItems.length; i += 1) {
        const it = equippedAccessoryItems[i]
        if (next[it.id]) continue
        const baseX = 0.5 + (i % 3 === 0 ? -0.18 : i % 3 === 1 ? 0 : 0.18)
        const baseY = 0.52 + (i % 2 === 0 ? -0.08 : 0.08)
        next[it.id] = { x: clamp(baseX, 0, 1), y: clamp(baseY, 0, 1) }
        changed = true
      }
      if (changed) writeAccessoryPositions(next)
      return changed ? next : prev
    })
  }, [equippedAccessoryItems])

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
        <div ref={tankRef} className="relative h-[520px]">
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

          {equippedAccessoryItems.map((a) => (
            <DraggableAccessory
              key={a.id}
              id={a.id}
              name={a.name}
              imageUrl={a.image_url ?? ''}
              containerRef={tankRef}
              containerSize={tankSize}
              pos={accessoryPositions[a.id] ?? { x: 0.5, y: 0.5 }}
              onPosChange={(nextPos) => {
                setAccessoryPositions((prev) => ({ ...prev, [a.id]: nextPos }))
              }}
              onRemove={async () => {
                const res = await withLoading(
                  fetch('/api/pet/equip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId: a.id })
                  })
                )
                const json = (await res.json().catch(() => null)) as any
                if (!res.ok) return
                if (Array.isArray(json?.pet_accessories)) {
                  setEquippedAccessories(json.pet_accessories as string[])
                }
              }}
            />
          ))}

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

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src={showHappyAxolotl ? '/axolotl-happy.png' : '/axolotl-sad.png'}
              alt="Axolotl"
              width={220}
              height={220}
              draggable={false}
              style={{ width: 220, height: 220, objectFit: 'contain', mixBlendMode: 'multiply' }}
            />
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
                const equipped = equippedAccessories.includes(a.name)
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
                          const json = (await res.json().catch(() => null)) as any
                          if (!res.ok) return
                          if (Array.isArray(json?.pet_accessories)) {
                            setEquippedAccessories(json.pet_accessories as string[])
                          }
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
