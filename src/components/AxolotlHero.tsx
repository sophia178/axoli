'use client'

import { motion } from 'framer-motion'

export function AxolotlHero({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 420 360"
        role="img"
        aria-label="Axoli axolotl"
        className="h-auto w-full drop-shadow-[0_18px_35px_rgba(255,143,171,0.22)]"
      >
        <defs>
          <linearGradient id="axBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FF8FAB" stopOpacity="1" />
            <stop offset="1" stopColor="#FFB6C8" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="axBelly" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFE2EA" stopOpacity="1" />
            <stop offset="1" stopColor="#FFC9D7" stopOpacity="1" />
          </linearGradient>
        </defs>

        <g>
          <motion.g
            animate={{ rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '210px 190px' }}
          >
            <path
              d="M140 132c-18 0-36 21-36 54 0 58 42 114 106 114s106-56 106-114c0-33-18-54-36-54-12 0-22 6-34 6-13 0-22-9-36-9s-23 9-36 9c-12 0-22-6-34-6z"
              fill="url(#axBody)"
              stroke="#2A2A4A"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M166 166c0 42 20 88 44 88s44-46 44-88c0-12-8-22-22-22h-44c-14 0-22 10-22 22z"
              fill="url(#axBelly)"
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

            <motion.g
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
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
            </motion.g>
          </motion.g>

          <motion.circle
            cx="112"
            cy="90"
            r="10"
            fill="#FFD700"
            opacity="0.65"
            animate={{ y: [0, -14, 0], opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="322"
            cy="86"
            r="7"
            fill="#FF8FAB"
            opacity="0.55"
            animate={{ y: [0, -10, 0], opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      </svg>
    </motion.div>
  )
}
