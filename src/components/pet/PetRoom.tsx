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

function TankBackground({ sad }: { sad: boolean }) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      {/* Deep dark blue/purple gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${sad ? '#080514' : '#0D0C3A'} 0%, ${sad ? '#110820' : '#2A1A6E'} 50%, ${sad ? '#080810' : '#0F0525'} 100%)`
        }}
      />

      {/* Animated floating bubble elements */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute rounded-full"
          style={{
            width: 14 + i * 12,
            height: 14 + i * 12,
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: `inset -1px -1px 3px rgba(0, 0, 0, 0.4), 0 0 14px rgba(180, 200, 255, 0.2)`,
            left: `${15 + i * 35}%`,
            bottom: '-50px'
          }}
          animate={{
            y: [-50, -600],
            x: [0, Math.sin(i * Math.PI / 3) * 20]
          }}
          transition={{
            duration: 15 + i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5
          }}
        />
      ))}

      {/* Warm and rich sandy floor */}
      <div
        className="absolute bottom-0 w-full h-1/3"
        style={{
          background: `linear-gradient(180deg, rgba(230, 185, 155, 0.7) 0%, #8B7555 100%)`
        }}
      />
    </div>
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
        body: JSON.stringify(itemStates)
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
          body: JSON.stringify(next)
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
          <TankBackground sad={sad} />
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
