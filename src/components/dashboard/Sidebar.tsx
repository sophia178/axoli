'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { dashboardNav } from '@/components/dashboard/nav'
import type { Profile } from '@/lib/data/profile'

export function Sidebar({ profile }: { profile?: Profile | null }) {
  const pathname = usePathname()
  const petName = (profile as any)?.pet_name as string | null | undefined
  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-border/60 bg-bg/30 backdrop-blur [[dir=rtl]_&]:border-l [[dir=rtl]_&]:border-r-0 lg:block">
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-2xl px-3 py-2">
          <img src="/axolotl-happy.png" alt="" width="36" height="36" style={{ objectFit: 'contain', flexShrink: 0 }} />
          <div className="leading-tight">
            <div className="font-heading text-base text-text">Axoli</div>
            <div className="text-xs text-subtext">{petName ? petName : 'Study with your pet'}</div>
          </div>
        </Link>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {dashboardNav
            .filter((item) => item.href !== '/pricing')
            .map((item) => {
              const hrefPath = item.href.split('?')[0] ?? item.href
              const highlightGold = (item as any).highlight === 'gold'
              const active =
                pathname === hrefPath ||
                (hrefPath !== '/dashboard' && pathname?.startsWith(hrefPath))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition',
                    active
                      ? 'bg-card/80 text-text ring-1 ring-pink/25'
                      : highlightGold
                        ? 'text-gold hover:bg-gold/10 hover:text-gold'
                        : 'text-subtext hover:bg-card/60 hover:text-text'
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              )
            })}
          <a href="/pricing" style={{display:'block', padding:'8px 16px', color:'#FFD700', textDecoration:'none'}}>⭐ Upgrade to Premium</a>
        </nav>

        <div className="rounded-3xl border border-border bg-card/60 p-4">
          <div className="text-sm font-semibold text-text">Tip</div>
          <div className="mt-1 text-xs leading-relaxed text-subtext">
            Tiny sessions count. Do 10 minutes now and keep your axolotl happy.
          </div>
        </div>
      </div>
    </aside>
  )
}
