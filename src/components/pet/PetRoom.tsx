'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useLoading } from '@/components/loading/LoadingProvider'
import type { Profile } from '@/lib/data/profile'
import type { ShopItemRow } from '@/lib/shop/data'
import { cn } from '@/lib/cn'
import { AxolotlAvatar } from '@/components/pet/AxolotlAvatar'
import { getStageProgress } from '@/lib/pet/stages'

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
        <filter id="glowBlur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sad ? '#0f0a1a' : '#1a0f3d'} />
          <stop offset="0.55" stopColor={sad ? '#0a0510' : '#2d1b4e'} />
          <stop offset="1" stopColor={sad ? '#05030a' : '#3d1f5c'} />
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
      <ellipse cx="150" cy="80" rx="120" ry="100" fill="#6d3fb5" opacity={sad ? 0.08 : 0.15} filter="url(#glowBlur)" />
      <ellipse cx="750" cy="120" rx="140" ry="110" fill="#4a1a8f" opacity={sad ? 0.06 : 0.12} filter="url(#glowBlur)" />
      <ellipse cx="450" cy="280" rx="100" ry="130" fill="#5d2fa5" opacity={sad ? 0.05 : 0.1} filter="url(#glowBlur)" />
      <ellipse cx="80" cy="320" rx="90" ry="80" fill="#7a3fc5" opacity={sad ? 0.07 : 0.13} filter="url(#glowBlur)" />
      <ellipse cx="850" cy="380" rx="110" ry="95" fill="#4a1a8f" opacity={sad ? 0.06 : 0.11} filter="url(#glowBlur)" />
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

      <rect x="0" y="430" width="900" height="90" fill="url(#sand)" opacity="0.95" />

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
  const pct = clamp(value, 0, 100)
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xl leading-none select-none">❤️</span>
      <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-black/30">
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f472b6, #ec4899)',
            borderRadius: '9999px',
            transition: 'width 700ms ease-in-out'
          }}
        />
      </div>
      <span className="text-sm font-semibold text-subtext w-10 text-right">{pct}%</span>
    </div>
  )
}

function HungerBar({ value }: { value: number }) {
  const pct = clamp(value, 0, 100)
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xl leading-none select-none">🍤</span>
      <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-black/30">
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #fb923c, #f97316)',
            borderRadius: '9999px',
            transition: 'width 700ms ease-in-out'
          }}
        />
      </div>
      <span className="text-sm font-semibold text-subtext w-10 text-right">{pct}%</span>
    </div>
  )
}

const LEVEL_SEEN_KEY = 'axoli_pet_level_seen'

function XpBar({ xp }: { xp: number }) {
  const progress = getStageProgress(xp)
  if (progress.isMax) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none select-none">⭐</span>
        <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }} />
        <span className="text-sm font-semibold text-gold w-10 text-right">MAX</span>
      </div>
    )
  }
  const pct = Math.round(progress.ratio * 100)
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xl leading-none select-none">⭐</span>
      <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-black/30">
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            borderRadius: '9999px',
            transition: 'width 700ms ease-in-out'
          }}
        />
      </div>
      <span className="text-sm font-semibold text-subtext w-10 text-right">{pct}%</span>
    </div>
  )
}

type ItemState = { x: number; y: number; size: number }

const MIN_ITEM_SIZE = 30
const MAX_ITEM_SIZE = 150


type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se'

function cornerCursor(corner: ResizeCorner) {
  if (corner === 'nw') return 'nwse-resize'
  if (corner === 'se') return 'nwse-resize'
  return 'nesw-resize'
}

function DraggableItem({
  name,
  imageUrl,
  containerRef,
  containerSize,
  state,
  onStateChange,
  onRemove
}: {
  name: string
  imageUrl: string
  containerRef: { current: HTMLDivElement | null }
  containerSize: { w: number; h: number }
  state: ItemState
  onStateChange: (next: ItemState) => void
  onRemove?: () => void
}) {
  const drag = useRef<{
    active: boolean
    startLeft: number
    startTop: number
    pointerStartX: number
    pointerStartY: number
  }>({ active: false, startLeft: 0, startTop: 0, pointerStartX: 0, pointerStartY: 0 })

  const resize = useRef<{
    active: boolean
    corner: ResizeCorner
    startLeft: number
    startTop: number
    startSize: number
    pointerStartX: number
    pointerStartY: number
  } | null>(null)

  const size = clamp(state.size, MIN_ITEM_SIZE, MAX_ITEM_SIZE)
  const maxLeft = Math.max(0, containerSize.w - size)
  const maxTop = Math.max(0, containerSize.h - size)
  const left = clamp(state.x, 0, 1) * maxLeft
  const top = clamp(state.y, 0, 1) * maxTop

  const setFromPixels = (nextLeft: number, nextTop: number, nextSize: number) => {
    const s = clamp(nextSize, MIN_ITEM_SIZE, MAX_ITEM_SIZE)
    const ml = Math.max(0, containerSize.w - s)
    const mt = Math.max(0, containerSize.h - s)
    const l = clamp(nextLeft, 0, ml)
    const t = clamp(nextTop, 0, mt)
    onStateChange({
      x: ml === 0 ? 0 : l / ml,
      y: mt === 0 ? 0 : t / mt,
      size: s
    })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement | null)?.closest?.('[data-handle],button')) return
    const el = containerRef.current
    if (!el) return
    drag.current = {
      active: true,
      startLeft: left,
      startTop: top,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY
    }
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resize.current?.active) {
      const dx = e.clientX - resize.current.pointerStartX
      const dy = e.clientY - resize.current.pointerStartY
      const base = resize.current.startSize
      const corner = resize.current.corner
      const delta =
        corner === 'se'
          ? Math.max(dx, dy)
          : corner === 'nw'
            ? -Math.max(dx, dy)
            : corner === 'ne'
              ? Math.max(dx, -dy)
              : Math.max(-dx, dy)
      const nextSize = clamp(base + delta, MIN_ITEM_SIZE, MAX_ITEM_SIZE)
      const diff = base - nextSize

      let nextLeft = resize.current.startLeft
      let nextTop = resize.current.startTop
      if (corner === 'nw' || corner === 'sw') nextLeft = resize.current.startLeft + diff
      if (corner === 'nw' || corner === 'ne') nextTop = resize.current.startTop + diff

      setFromPixels(nextLeft, nextTop, nextSize)
      return
    }

    if (!drag.current.active) return
    const dx = e.clientX - drag.current.pointerStartX
    const dy = e.clientY - drag.current.pointerStartY
    const nextLeft = clamp(drag.current.startLeft + dx, 0, maxLeft)
    const nextTop = clamp(drag.current.startTop + dy, 0, maxTop)
    setFromPixels(nextLeft, nextTop, size)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = false
    resize.current = null
    try {
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <div
      className="group absolute z-[20]"
      style={{ left, top, width: size, height: size, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div style={{ width: size, height: size, background: 'transparent' }}>
        <img src={imageUrl} alt={name} width={size} height={size} draggable={false} className="select-none" style={{ objectFit: 'contain' }} />
      </div>
      {onRemove ? (
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
      ) : null}
      {(['nw', 'ne', 'sw', 'se'] as ResizeCorner[]).map((corner) => (
        <div
          key={corner}
          data-handle
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            resize.current = {
              active: true,
              corner,
              startLeft: left,
              startTop: top,
              startSize: size,
              pointerStartX: e.clientX,
              pointerStartY: e.clientY
            }
            ;(e.currentTarget.parentElement as HTMLDivElement).setPointerCapture(e.pointerId)
          }}
          className={cn(
            'absolute hidden h-3 w-3 rounded-sm border border-border bg-card/90 shadow-sm group-hover:block',
            corner === 'nw' && 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
            corner === 'ne' && 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
            corner === 'sw' && 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
            corner === 'se' && 'right-0 bottom-0 translate-x-1/2 translate-y-1/2'
          )}
          style={{ cursor: cornerCursor(corner) }}
        />
      ))}
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
  const xp = Number(profile.xp ?? 0)
  const starving = hunger < 10
  const hungry = hunger < 30
  const sad = happiness <= 30 || starving
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(() => profile.pet_accessories ?? [])
  const [showLevelUp, setShowLevelUp] = useState(false)
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
  useEffect(() => {
    const currentLevel = profile.pet_level ?? 1
    try {
      const stored = window.localStorage.getItem(LEVEL_SEEN_KEY)
      const seenLevel = stored ? Number(stored) : null
      if (seenLevel !== null && currentLevel > seenLevel) {
        setShowLevelUp(true)
        const id = window.setTimeout(() => setShowLevelUp(false), 4000)
        window.localStorage.setItem(LEVEL_SEEN_KEY, String(currentLevel))
        return () => window.clearTimeout(id)
      }
      window.localStorage.setItem(LEVEL_SEEN_KEY, String(currentLevel))
    } catch {}
  }, [profile.pet_level])

  const petStage = getStageProgress(xp).stage.stage
  const showHappyAxolotl = happiness > 50 && hunger > 30
  const tankRef = useRef<HTMLDivElement | null>(null)
  const [tankSize, setTankSize] = useState<{ w: number; h: number }>({ w: 900, h: 520 })
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({})

  useEffect(() => {
    fetch('/api/pet/item-states')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') setItemStates(data as Record<string, ItemState>)
      })
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.setTimeout(() => {
      fetch('/api/pet/item-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states: itemStates })
      }).catch(() => {})
    }, 150)
    return () => window.clearTimeout(id)
  }, [itemStates])
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

  const decorationDefaultsByName: Record<string, ItemState> = useMemo(
    () => ({
      'Extra plant': { x: 0.08, y: 0.72, size: 110 },
      'Fairy lights': { x: 0.45, y: 0.04, size: 100 },
      'Little desk': { x: 0.78, y: 0.74, size: 110 },
      Bookshelf: { x: 0.44, y: 0.76, size: 130 },
      'Disco ball': { x: 0.74, y: 0.10, size: 95 },
      'Treasure chest': { x: 0.18, y: 0.78, size: 110 }
    }),
    []
  )
  const visibleDecorations = useMemo(
    () => ownedDecorations.filter((d) => Boolean(d.image_url)),
    [ownedDecorations]
  )

  const equippedAccessoryItems = useMemo(
    () => items.filter((i) => i.type === 'accessory' && equippedAccessories.includes(i.name) && Boolean(i.image_url)),
    [items, equippedAccessories]
  )

  useEffect(() => {
    setItemStates((prev) => {
      let changed = false
      const next = { ...prev }
      for (let i = 0; i < visibleDecorations.length; i += 1) {
        const d = visibleDecorations[i]
        if (next[d.id]) continue
        const def = decorationDefaultsByName[d.name]
        if (def) {
          next[d.id] = def
        } else {
          const col = i % 5
          const row = Math.floor(i / 5)
          next[d.id] = { x: clamp(0.08 + col * 0.19, 0, 0.85), y: clamp(0.6 + row * 0.14, 0, 0.85), size: 80 }
        }
        changed = true
      }
      for (let i = 0; i < equippedAccessoryItems.length; i += 1) {
        const it = equippedAccessoryItems[i]
        if (next[it.id]) continue
        const baseX = 0.5 + (i % 3 === 0 ? -0.18 : i % 3 === 1 ? 0 : 0.18)
        const baseY = 0.52 + (i % 2 === 0 ? -0.08 : 0.08)
        next[it.id] = { x: clamp(baseX, 0, 1), y: clamp(baseY, 0, 1), size: 60 }
        changed = true
      }
      if (changed) {
        fetch('/api/pet/item-states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ states: next })
        }).catch(() => {})
      }
      return changed ? next : prev
    })
  }, [equippedAccessoryItems, visibleDecorations, decorationDefaultsByName])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card/70 p-4 sm:gap-4 sm:p-6">
        <div>
          <div className="font-heading text-xl text-text sm:text-3xl">
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
        <div ref={tankRef} className="relative h-[320px] sm:h-[520px]">
          <UnderwaterScene sad={sad} />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-white/20"
              style={{
                width: 8 + i * 3,
                height: 8 + i * 3,
                left: `${15 + i * 35}%`,
                bottom: '-10px'
              }}
              animate={{ y: -550 }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
          {visibleDecorations.map((d) => (
            <DraggableItem
              key={d.id}
              name={d.name}
              imageUrl={d.image_url ?? ''}
              containerRef={tankRef}
              containerSize={tankSize}
              state={itemStates[d.id] ?? decorationDefaultsByName[d.name] ?? { x: 0.4, y: 0.7, size: 110 }}
              onStateChange={(nextState) => {
                setItemStates((prev) => ({ ...prev, [d.id]: nextState }))
              }}
            />
          ))}

          {equippedAccessoryItems.map((a) => (
            <DraggableItem
              key={a.id}
              name={a.name}
              imageUrl={a.image_url ?? ''}
              containerRef={tankRef}
              containerSize={tankSize}
              state={itemStates[a.id] ?? { x: 0.5, y: 0.5, size: 60 }}
              onStateChange={(nextState) => {
                setItemStates((prev) => ({ ...prev, [a.id]: nextState }))
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
            className="absolute left-1/2 top-4 w-[min(360px,calc(100%-2rem))] -translate-x-1/2 px-2 sm:top-10 sm:px-4"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative rounded-3xl border border-border bg-card/60 px-5 py-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
              <div className="text-sm font-semibold text-gold whitespace-normal break-words">{speech}</div>
              <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-border bg-card/60" />
            </div>
          </motion.div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AxolotlAvatar
              stage={petStage}
              mood={showHappyAxolotl ? 'happy' : 'sad'}
              colour={profile.pet_colour}
              className="select-none"
              style={{ width: petStage === 'egg' ? 'clamp(90px, 18vw, 140px)' : 'clamp(130px, 30vw, 220px)', height: 'auto' }}
            />
          </div>

          <AnimatePresence>
            {showLevelUp && (
              <motion.div
                key="levelup"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * 360
                  return (
                    <motion.div
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-gold"
                      style={{ top: '50%', left: '50%' }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((angle * Math.PI) / 180) * 72,
                        y: Math.sin((angle * Math.PI) / 180) * 72,
                        opacity: 0,
                        scale: 0.4
                      }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.04 }}
                    />
                  )
                })}
                <motion.div
                  className="rounded-3xl border border-gold/40 bg-card/90 px-5 py-3 text-center shadow-glowGold"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                >
                  <div className="font-heading text-lg text-gold">Your axolotl evolved! ✨</div>
                  <div className="mt-1 text-sm text-subtext">
                    Now a {getStageProgress(xp).stage.label}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-5 mx-auto max-w-sm">
        <div className="font-semibold text-text mb-4">Pet Stats</div>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-subtext mb-2">XP Progress</div>
            <XpBar xp={xp} />
          </div>
          <div>
            <div className="text-xs text-subtext mb-2">Happiness</div>
            <HeartBar value={happiness} />
          </div>
          <div>
            <div className="text-xs text-subtext mb-2">Hunger</div>
            <HungerBar value={hunger} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-5">
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

        <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-5">
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
                    <img src={d.image_url} width={48} height={48} alt="" draggable={false} className="select-none flex-shrink-0" style={{ objectFit: 'contain' }} />
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
