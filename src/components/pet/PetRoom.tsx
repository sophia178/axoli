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

function Axolotl({
  happiness,
  colour,
  accessories
}: {
  happiness: number
  colour: string
  accessories: string[]
}) {
  const sad = happiness <= 30
  const bright = happiness >= 71 && !sad
  const baseStops = sad ? ['#6C6C90', '#8888AA'] : colourStops(colour)
  const bodyStroke = sad ? '#6C6C90' : '#2A2A4A'

  const hasSunglasses = accessories.some((a) => /sunglasses/i.test(a))
  const hasBowtie = accessories.some((a) => /bow\s*tie/i.test(a))
  const hasCrown = accessories.some((a) => /^crown$/i.test(a))
  const hasHalo = accessories.some((a) => /^halo$/i.test(a))
  const hasHat = accessories.some((a) => /hat/i.test(a))

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
          {hasHalo ? (
            <g opacity={sad ? 0.55 : 0.9}>
              <ellipse
                cx="324"
                cy="62"
                rx="74"
                ry="22"
                fill="none"
                stroke="#FFD700"
                strokeWidth="10"
                opacity={sad ? 0.35 : 0.55}
              />
              <ellipse cx="324" cy="60" rx="56" ry="14" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.25" />
            </g>
          ) : null}

          {hasCrown ? (
            <g opacity={sad ? 0.6 : 0.95}>
              <path
                d="M270 122l16-32 22 22 16-30 16 30 22-22 16 32v18H270v-18z"
                fill="#FFD700"
                stroke="#2A2A4A"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <circle cx="286" cy="90" r="7" fill="#FF8FAB" />
              <circle cx="324" cy="82" r="7" fill="#6EC7FF" />
              <circle cx="362" cy="90" r="7" fill="#7C5CFF" />
            </g>
          ) : null}

          {hasHat ? (
            <g opacity={sad ? 0.65 : 0.95}>
              <path
                d="M300 78c20-16 56-16 76 0l-10 20c-20-10-36-10-56 0l-10-20z"
                fill="#FF8FAB"
                stroke="#2A2A4A"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <path
                d="M292 98c22 10 70 10 92 0"
                fill="none"
                stroke="#FFD700"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.7"
              />
              <circle cx="338" cy="70" r="8" fill="#FFD700" opacity={sad ? 0.45 : 0.85} />
            </g>
          ) : null}

          {hasSunglasses ? (
            <g opacity={sad ? 0.55 : 0.9}>
              <rect x="244" y="208" width="70" height="46" rx="22" fill="#0A0A1A" opacity="0.78" />
              <rect x="334" y="208" width="70" height="46" rx="22" fill="#0A0A1A" opacity="0.78" />
              <rect x="314" y="226" width="20" height="10" rx="5" fill="#2A2A4A" opacity="0.85" />
              <path
                d="M252 216c14-10 34-10 48 0"
                stroke="#DDE6FF"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.16"
              />
              <path
                d="M342 216c14-10 34-10 48 0"
                stroke="#DDE6FF"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.16"
              />
            </g>
          ) : null}

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

          {hasBowtie ? (
            <g opacity={sad ? 0.6 : 0.95}>
              <path
                d="M304 296l-44 18 44 18 10-18-10-18z"
                fill="#FF8FAB"
                stroke="#2A2A4A"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <path
                d="M344 296l44 18-44 18-10-18 10-18z"
                fill="#FF8FAB"
                stroke="#2A2A4A"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <circle cx="324" cy="314" r="10" fill="#FFD700" stroke="#2A2A4A" strokeWidth="5" />
            </g>
          ) : null}
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
            <Axolotl
              happiness={sad ? Math.min(happiness, 30) : happiness}
              colour={profile.pet_colour ?? 'pink'}
              accessories={equippedAccessories}
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
