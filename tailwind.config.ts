import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A1A',
        card: '#141428',
        pink: '#FF8FAB',
        gold: '#FFD700',
        text: '#FFFFFF',
        subtext: '#8888AA',
        success: '#7AE7B9',
        border: '#2A2A4A'
      },
      fontFamily: {
        heading: ['var(--font-nunito)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        glowPink: '0 0 0 1px rgba(255, 143, 171, 0.35), 0 12px 30px rgba(255, 143, 171, 0.12)',
        glowGold: '0 0 0 1px rgba(255, 215, 0, 0.25), 0 12px 30px rgba(255, 215, 0, 0.10)'
      }
    }
  },
  plugins: []
} satisfies Config
