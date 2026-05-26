'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import enMessages from '@/messages/en.json'

function clampFact(text: string) {
  const t = text.trim()
  if (t.length <= 100) return t
  return `${t.slice(0, 97).trimEnd()}…`
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
        <div className="font-heading text-2xl text-pink">Axoli</div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6">
        <div className="mb-8 w-full">{bubble}</div>
        <img src="/axolotl-happy.png" width="120" height="120" style={{objectFit:'contain', mixBlendMode:'multiply'}} />
      </div>
    </div>
  )
}
