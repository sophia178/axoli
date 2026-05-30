'use client'

import type React from 'react'
import { useId } from 'react'
import { motion } from 'framer-motion'
import type { PetStage } from '@/lib/pet/stages'
import { getColourStops, NAVY, PINK } from '@/lib/pet/colours'

type Mood = 'happy' | 'sad'

const FRILL = '#FF9DBA'
const FRILL_TIP = '#FFC2D6'
const GOLD_STAR = '#FFD700'

function Gill({ x, y, rot, scale = 1 }: { x: number; y: number; rot: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path
        d="M0 0 C -3.2 -8 -3.2 -16 0 -23 C 3.2 -16 3.2 -8 0 0 Z"
        fill={FRILL}
        stroke={NAVY}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={-20} r={2.4} fill={FRILL_TIP} />
    </g>
  )
}

function Gills({ x, y, side, scale = 1 }: { x: number; y: number; side: 1 | -1; scale?: number }) {
  const rots = side === 1 ? [38, 64, 90] : [-38, -64, -90]
  const sc = [0.82, 1, 0.82]
  return (
    <g>
      {rots.map((r, i) => (
        <Gill key={i} x={x} y={y} rot={r} scale={sc[i] * scale} />
      ))}
    </g>
  )
}

function Face({
  mood,
  cx,
  eyeY,
  gap,
  mouthY,
  r = 3.2
}: {
  mood: Mood
  cx: number
  eyeY: number
  gap: number
  mouthY: number
  r?: number
}) {
  const lx = cx - gap
  const rx = cx + gap
  return (
    <g>
      <ellipse cx={lx - 3} cy={eyeY + 5.5} rx={3.6} ry={2.6} fill={PINK} opacity={0.4} />
      <ellipse cx={rx + 3} cy={eyeY + 5.5} rx={3.6} ry={2.6} fill={PINK} opacity={0.4} />
      {mood === 'happy' ? (
        <>
          <circle cx={lx} cy={eyeY} r={r} fill={NAVY} />
          <circle cx={rx} cy={eyeY} r={r} fill={NAVY} />
          <circle cx={lx - r * 0.35} cy={eyeY - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
          <circle cx={rx - r * 0.35} cy={eyeY - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
          <path
            d={`M${cx - 5.5} ${mouthY} q5.5 5 11 0`}
            fill="none"
            stroke={NAVY}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d={`M${lx - 3.2} ${eyeY - 0.5} q3.2 3.4 6.4 0`} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${rx - 3.2} ${eyeY - 0.5} q3.2 3.4 6.4 0`} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${cx - 5} ${mouthY + 2} q5 -4.5 10 0`} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
          <path
            d={`M${rx + 1} ${eyeY + 3} q2.4 4 0 6.4 q-2.4 -2.4 0 -6.4 Z`}
            fill="#6EC7FF"
            stroke={NAVY}
            strokeWidth={1}
            opacity={0.9}
          />
        </>
      )}
    </g>
  )
}

function Sparkle({ x, y, s = 1, fill = GOLD_STAR }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -6 C 0.8 -2 2 -0.8 6 0 C 2 0.8 0.8 2 0 6 C -0.8 2 -2 0.8 -6 0 C -2 -0.8 -0.8 -2 0 -6 Z"
      fill={fill}
      opacity={0.9}
    />
  )
}

function EggFace({ mood }: { mood: Mood }) {
  const cx = 60, lx = 51, rx = 69, eyeY = 72, mouthY = 84
  return (
    <g>
      <ellipse cx={lx - 1} cy={eyeY + 7} rx={4.5} ry={2.8} fill={PINK} opacity={0.38} />
      <ellipse cx={rx + 1} cy={eyeY + 7} rx={4.5} ry={2.8} fill={PINK} opacity={0.38} />
      {mood === 'happy' ? (
        <>
          <circle cx={lx} cy={eyeY} r={3.8} fill={NAVY} />
          <circle cx={rx} cy={eyeY} r={3.8} fill={NAVY} />
          <circle cx={lx - 1.3} cy={eyeY - 1.3} r={1.3} fill="#FFFFFF" />
          <circle cx={rx - 1.3} cy={eyeY - 1.3} r={1.3} fill="#FFFFFF" />
          <path d={`M${cx - 6} ${mouthY} q6 6 12 0`} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M${lx - 4} ${eyeY - 1} q4 4.5 8 0`} fill="none" stroke={NAVY} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${rx - 4} ${eyeY - 1} q4 4.5 8 0`} fill="none" stroke={NAVY} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${cx - 6} ${mouthY + 2} q6 -5.5 12 0`} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${rx + 2} ${eyeY + 3} q3 5 0 8 q-3 -3 0 -8 Z`} fill="#6EC7FF" stroke={NAVY} strokeWidth={0.8} opacity={0.92} />
        </>
      )}
    </g>
  )
}

function Egg({ gid, mood }: { gid: string; mood: Mood }) {
  const filterId = `${gid}-eglow`
  return (
    <motion.g
      animate={{ rotate: [-2.5, 2.5, -2.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '60px 106px' }}
    >
      <defs>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#C0B4FF" floodOpacity="0.5" />
        </filter>
      </defs>
      <ellipse cx={60} cy={108} rx={22} ry={4.5} fill="#000000" opacity={0.14} />
      <path
        d="M60 24 C 42 24 30 44 30 66 C 30 88 44 106 60 106 C 76 106 90 88 90 66 C 90 44 78 24 60 24 Z"
        fill={`url(#${gid})`}
        stroke={NAVY}
        strokeWidth={4}
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
      <ellipse cx={46} cy={58} rx={2.5} ry={1.8} fill={NAVY} opacity={0.13} transform="rotate(-25 46 58)" />
      <ellipse cx={73} cy={50} rx={2} ry={1.5} fill={NAVY} opacity={0.12} transform="rotate(20 73 50)" />
      <ellipse cx={78} cy={74} rx={2.5} ry={1.8} fill={NAVY} opacity={0.13} transform="rotate(-15 78 74)" />
      <ellipse cx={42} cy={82} rx={2} ry={1.5} fill={NAVY} opacity={0.11} transform="rotate(30 42 82)" />
      <ellipse cx={65} cy={92} rx={2} ry={1.4} fill={NAVY} opacity={0.12} transform="rotate(-10 65 92)" />
      <ellipse cx={56} cy={38} rx={1.8} ry={1.3} fill={NAVY} opacity={0.10} transform="rotate(15 56 38)" />
      <ellipse cx={68} cy={64} rx={1.5} ry={1.2} fill={NAVY} opacity={0.10} transform="rotate(-20 68 64)" />
      <ellipse cx={47} cy={52} rx={7} ry={11} fill="#FFFFFF" opacity={0.18} />
      <circle cx={43} cy={58} r={3.5} fill="#FFFFFF" opacity={0.5} />
      <circle cx={72} cy={52} r={3} fill="#FFFFFF" opacity={0.45} />
      <EggFace mood={mood} />
    </motion.g>
  )
}

function Baby({ gid, mood }: { gid: string; mood: Mood }) {
  return (
    <g>
      <ellipse cx={60} cy={100} rx={24} ry={5} fill="#000000" opacity={0.18} />
      <path d="M82 76 q14 -4 16 6 q-4 10 -16 2 Z" fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
      <Gills x={42} y={62} side={-1} scale={0.7} />
      <Gills x={78} y={62} side={1} scale={0.7} />
      <ellipse cx={60} cy={74} rx={26} ry={24} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={60} cy={82} rx={15} ry={11} fill="#FFFFFF" opacity={0.16} />
      <Face mood={mood} cx={60} eyeY={72} gap={8} mouthY={82} r={3.4} />
    </g>
  )
}

function Juvenile({ gid, mood }: { gid: string; mood: Mood }) {
  return (
    <g>
      <ellipse cx={60} cy={104} rx={30} ry={6} fill="#000000" opacity={0.18} />
      <path d="M86 72 q18 -8 20 6 q-2 16 -20 4 Z" fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={46} cy={96} rx={7} ry={5} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={72} cy={96} rx={7} ry={5} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <Gills x={38} y={58} side={-1} scale={0.92} />
      <Gills x={82} y={58} side={1} scale={0.92} />
      <path
        d="M28 66 C 28 46 42 36 60 36 C 78 36 92 46 92 66 C 92 86 78 96 60 96 C 42 96 28 86 28 66 Z"
        fill={`url(#${gid})`}
        stroke={NAVY}
        strokeWidth={4}
      />
      <ellipse cx={60} cy={78} rx={18} ry={12} fill="#FFFFFF" opacity={0.15} />
      <Face mood={mood} cx={60} eyeY={64} gap={9} mouthY={76} r={3.5} />
    </g>
  )
}

function Adult({ gid, mood }: { gid: string; mood: Mood }) {
  return (
    <g>
      <ellipse cx={60} cy={106} rx={34} ry={6} fill="#000000" opacity={0.2} />
      <path d="M88 66 q22 -10 24 8 q-2 20 -24 6 Z" fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={42} cy={98} rx={8} ry={5.5} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={60} cy={102} rx={8} ry={5.5} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={78} cy={98} rx={8} ry={5.5} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <Gills x={34} y={54} side={-1} scale={1.1} />
      <Gills x={86} y={54} side={1} scale={1.1} />
      <path
        d="M24 62 C 24 40 40 30 60 30 C 80 30 96 40 96 62 C 96 86 80 98 60 98 C 40 98 24 86 24 62 Z"
        fill={`url(#${gid})`}
        stroke={NAVY}
        strokeWidth={4}
      />
      <ellipse cx={60} cy={76} rx={22} ry={14} fill="#FFFFFF" opacity={0.14} />
      <Face mood={mood} cx={60} eyeY={60} gap={10} mouthY={74} r={3.8} />
    </g>
  )
}

function Elder({ gid, mood }: { gid: string; mood: Mood }) {
  return (
    <g>
      <ellipse cx={60} cy={108} rx={37} ry={6.5} fill="#000000" opacity={0.2} />
      <path d="M90 64 q24 -12 26 8 q-2 22 -26 7 Z" fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={40} cy={100} rx={8.5} ry={6} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={60} cy={104} rx={8.5} ry={6} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <ellipse cx={80} cy={100} rx={8.5} ry={6} fill={`url(#${gid})`} stroke={NAVY} strokeWidth={4} />
      <Gills x={32} y={52} side={-1} scale={1.22} />
      <Gills x={88} y={52} side={1} scale={1.22} />
      <path
        d="M20 60 C 20 36 38 26 60 26 C 82 26 100 36 100 60 C 100 86 82 100 60 100 C 38 100 20 86 20 60 Z"
        fill={`url(#${gid})`}
        stroke={NAVY}
        strokeWidth={4}
      />
      <ellipse cx={60} cy={74} rx={24} ry={15} fill="#FFFFFF" opacity={0.14} />
      <path d="M44 50 q5 -3 10 -1" fill="none" stroke={NAVY} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
      <path d="M66 49 q5 -2 10 1" fill="none" stroke={NAVY} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
      <Face mood={mood} cx={60} eyeY={60} gap={10.5} mouthY={76} r={3.8} />
      <Sparkle x={26} y={34} s={1.1} />
      <Sparkle x={98} y={40} s={0.9} />
      <Sparkle x={92} y={86} s={0.8} fill={PINK} />
    </g>
  )
}

export function AxolotlAvatar({
  stage,
  mood,
  colour,
  className,
  style
}: {
  stage: PetStage
  mood: Mood
  colour?: string | null
  className?: string
  style?: React.CSSProperties
}) {
  const uid = useId().replace(/:/g, '')
  const gid = `axbody-${uid}`
  const [c1, c2] = getColourStops(colour)

  const body = () => {
    switch (stage) {
      case 'egg':
        return <Egg gid={gid} mood={mood} />
      case 'baby':
        return <Baby gid={gid} mood={mood} />
      case 'juvenile':
        return <Juvenile gid={gid} mood={mood} />
      case 'adult':
        return <Adult gid={gid} mood={mood} />
      case 'elder':
        return <Elder gid={gid} mood={mood} />
      default:
        return <Adult gid={gid} mood={mood} />
    }
  }

  return (
    <svg viewBox="0 0 120 120" className={className} style={style} role="img" aria-label="Axolotl">
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      {body()}
    </svg>
  )
}
