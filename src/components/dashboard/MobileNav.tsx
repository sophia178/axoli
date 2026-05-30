'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { dashboardNav } from '@/components/dashboard/nav'

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleItemClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-pink text-white shadow-lg transition hover:bg-pink/90"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-bg/95 backdrop-blur"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex h-full flex-col items-center justify-center gap-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {dashboardNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleItemClick}
                  className={cn(
                    'flex w-full max-w-xs items-center gap-3 rounded-2xl px-4 py-3 text-base transition',
                    active
                      ? 'bg-card/80 text-text ring-1 ring-pink/25'
                      : 'text-subtext hover:bg-card/60 hover:text-text'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
