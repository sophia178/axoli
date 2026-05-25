'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { dashboardNav } from '@/components/dashboard/nav'

export function MobileNav() {
  const pathname = usePathname()
  return (
    <div className="lg:hidden">
      <details className="group">
        <summary className="list-none cursor-pointer rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm font-semibold text-text">
          Menu
        </summary>
        <div className="mt-2 grid gap-1 rounded-3xl border border-border bg-bg/60 p-2 backdrop-blur">
          {dashboardNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition',
                  active
                    ? 'bg-card/80 text-text ring-1 ring-pink/25'
                    : 'text-subtext hover:bg-card/60 hover:text-text'
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </details>
    </div>
  )
}
