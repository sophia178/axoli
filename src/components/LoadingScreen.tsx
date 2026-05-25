'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import enMessages from '@/messages/en.json'

function clampFact(text: string) {
  const t = text.trim()
  if (t.length <= 100) return t
  return `${t.slice(0, 97).trimEnd()}…`
}

function AxolotlBounce({ ariaLabel }: { ariaLabel: string }) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      className="w-[260px] max-w-[70vw]"
    >
      <svg viewBox="0 0 420 360" role="img" aria-label={ariaLabel} className="h-auto w-full">
        <defs>
          <linearGradient id="lbBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FF8FAB" />
            <stop offset="1" stopColor="#FFB6C8" />
          </linearGradient>
          <linearGradient id="lbBelly" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFE2EA" />
            <stop offset="1" stopColor="#FFC9D7" />
          </linearGradient>
        </defs>
        <path
          d="M140 132c-18 0-36 21-36 54 0 58 42 114 106 114s106-56 106-114c0-33-18-54-36-54-12 0-22 6-34 6-13 0-22-9-36-9s-23 9-36 9c-12 0-22-6-34-6z"
          fill="url(#lbBody)"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M166 166c0 42 20 88 44 88s44-46 44-88c0-12-8-22-22-22h-44c-14 0-22 10-22 22z"
          fill="url(#lbBelly)"
          opacity="0.95"
        />
        <path
          d="M142 148c-38-8-64-30-72-60 32 2 64 10 86 34"
          fill="#FF8FAB"
          opacity="0.9"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M278 148c38-8 64-30 72-60-32 2-64 10-86 34"
          fill="#FF8FAB"
          opacity="0.9"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="178" cy="188" r="18" fill="#FFFFFF" />
        <circle cx="242" cy="188" r="18" fill="#FFFFFF" />
        <circle cx="180" cy="190" r="8" fill="#0A0A1A" />
        <circle cx="244" cy="190" r="8" fill="#0A0A1A" />
        <circle cx="176" cy="186" r="3" fill="#FFFFFF" />
        <circle cx="240" cy="186" r="3" fill="#FFFFFF" />
        <path
          d="M203 214c8 10 22 10 30 0"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M152 260c-16 0-28 14-28 30 0 14 10 24 22 24 10 0 18-8 22-18"
          fill="#FF8FAB"
          opacity="0.9"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M268 260c16 0 28 14 28 30 0 14-10 24-22 24-10 0-18-8-22-18"
          fill="#FF8FAB"
          opacity="0.9"
          stroke="#2A2A4A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  )
}

export function LoadingScreen({ visible = true }: { visible?: boolean }) {
  const facts = useMemo(() => {
    const list: string[] = []
    for (let i = 1; i <= 50; i += 1) {
      list.push((enMessages as any).loading?.facts?.[String(i)] ?? '')
    }
    return list
  }, [])

  const pickFact = useMemo(() => {
    return () => {
      const i = Math.floor(Math.random() * facts.length)
      return facts[i] ?? facts[0] ?? ''
    }
  }, [facts])

  const [fact, setFact] = useState(() => clampFact(pickFact()))

  useEffect(() => {
    if (!visible) return
    setFact(clampFact(pickFact()))
  }, [pickFact, visible])

  const bubble = useMemo(() => {
    return (
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mx-auto w-full max-w-sm rounded-3xl border border-border bg-card/60 px-5 py-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
      >
        <div className="font-heading text-lg text-gold">Did you know...</div>
        <div className="mt-2 text-sm text-text">{fact}</div>
        <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-border bg-card/60" />
      </motion.div>
    )
  }, [fact])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-bg">
      <div className="absolute left-1/2 top-10 -translate-x-1/2">
        <div className="font-heading text-2xl text-pink">Bloom</div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6">
        <div className="mb-8 w-full">{bubble}</div>
        <AxolotlBounce ariaLabel="Loading axolotl" />
      </div>
    </div>
  )
}
