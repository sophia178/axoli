'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import { dashboardNav } from '@/components/dashboard/nav'

export function Sidebar() {
  const pathname = usePathname()
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-border/60 bg-bg/30 backdrop-blur [[dir=rtl]_&]:border-l [[dir=rtl]_&]:border-r-0 lg:block">
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-2xl px-3 py-2">
          <div className="h-9 w-9 rounded-2xl bg-pink/20 ring-1 ring-pink/30" />
          <div className="leading-tight">
            <div className="font-heading text-base text-text">{tCommon('appName')}</div>
            <div className="text-xs text-subtext">{tCommon('tagline')}</div>
          </div>
        </Link>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
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
                <span className="font-semibold">
                  {tNav((item as any).labelKey ?? item.label)}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="rounded-3xl border border-border bg-card/60 p-4">
          <div className="text-sm font-semibold text-text">{tCommon('tipTitle')}</div>
          <div className="mt-1 text-xs leading-relaxed text-subtext">
            {tCommon('tipBody')}
          </div>
        </div>
      </div>
    </aside>
  )
}
