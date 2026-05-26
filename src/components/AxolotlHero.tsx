'use client'

import { motion } from 'framer-motion'

export function AxolotlHero({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <img src="/axolotl-happy.png" alt="" width="300" height="300" style={{objectFit:'contain', mixBlendMode:'multiply'}} />
    </motion.div>
  )
}
