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
              d="M150 136c-26 0-50 28-50 68 0 74 52 134 110 134s110-60 110-134c0-40-24-68-50-68-14 0-28 8-42 8-18 0-28-14-42-14s-24 14-42 14c-14 0-28-8-42-8z"
              fill="url(#axBody)"
              stroke="#2A2A4A"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M174 176c0 56 18 108 36 108s36-52 36-108c0-18-12-32-30-32h-12c-18 0-30 14-30 32z"
              fill="url(#axBelly)"
              opacity="0.95"
            />

            <path
              d="M138 158c-44-10-76-40-88-84 42 4 82 20 106 50"
              fill="#FF8FAB"
              opacity="0.9"
              stroke="#2A2A4A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M282 158c44-10 76-40 88-84-42 4-82 20-106 50"
              fill="#FF8FAB"
              opacity="0.9"
              stroke="#2A2A4A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g opacity={0.95}>
              <path
                d="M118 170c18 8 30 20 36 36"
                fill="none"
                stroke="#FF8FAB"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M112 196c20 6 34 18 42 34"
                fill="none"
                stroke="#FFD700"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M126 144c16 10 26 22 30 36"
                fill="none"
                stroke="#FF8FAB"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M302 170c-18 8-30 20-36 36"
                fill="none"
                stroke="#FF8FAB"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M308 196c-20 6-34 18-42 34"
                fill="none"
                stroke="#FFD700"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M294 144c-16 10-26 22-30 36"
                fill="none"
                stroke="#FF8FAB"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>

            <circle cx="178" cy="196" r="22" fill="#FFFFFF" />
            <circle cx="242" cy="196" r="22" fill="#FFFFFF" />
            <circle cx="180" cy="198" r="10" fill="#0A0A1A" />
            <circle cx="244" cy="198" r="10" fill="#0A0A1A" />
            <circle cx="174" cy="190" r="4" fill="#FFFFFF" opacity="0.95" />
            <circle cx="238" cy="190" r="4" fill="#FFFFFF" opacity="0.95" />
            <circle cx="160" cy="228" r="10" fill="#FF8FAB" opacity="0.18" />
            <circle cx="260" cy="228" r="10" fill="#FF8FAB" opacity="0.18" />

            <path
              d="M198 222c10 14 24 14 34 0"
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
                d="M154 270c-18 0-32 16-32 34 0 16 12 28 26 28 12 0 22-10 26-22"
                fill="#FF8FAB"
                opacity="0.9"
                stroke="#2A2A4A"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M266 270c18 0 32 16 32 34 0 16-12 28-26 28-12 0-22-10-26-22"
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
