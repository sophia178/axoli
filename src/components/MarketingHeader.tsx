'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { LanguageMenu } from '@/components/i18n/LanguageMenu'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Axoli"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-heading text-lg text-text">Axoli</span>
        </Link>
        <nav className="flex items-center gap-2">
          <LanguageMenu />
          <Link
            href="/pricing"
            className="rounded-2xl px-3 py-2 text-sm text-subtext hover:bg-card/60 hover:text-text"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-2xl px-3 py-2 text-sm text-subtext hover:bg-card/60 hover:text-text"
          >
            Login
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
