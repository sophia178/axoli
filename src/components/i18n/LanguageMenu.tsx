'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/i18n'
import { cn } from '@/lib/cn'

type Option = { locale: Locale; label: string; flag: string }

const options: Option[] = [
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'es', label: 'Español', flag: '🇪🇸' },
  { locale: 'fr', label: 'Français', flag: '🇫🇷' },
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { locale: 'pt', label: 'Português', flag: '🇵🇹' },
  { locale: 'it', label: 'Italiano', flag: '🇮🇹' },
  { locale: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { locale: 'pl', label: 'Polski', flag: '🇵🇱' },
  { locale: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { locale: 'ar', label: 'العربية', flag: '🇸🇦' },
  { locale: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { locale: 'ja', label: '日本語', flag: '🇯🇵' },
  { locale: 'ko', label: '한국어', flag: '🇰🇷' },
  { locale: 'zh', label: '简体中文', flag: '🇨🇳' }
]

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';').map((p) => p.trim())
  for (const part of parts) {
    if (!part.startsWith(`${name}=`)) continue
    return decodeURIComponent(part.slice(name.length + 1))
  }
  return null
}

function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return
  document.cookie = `NEXT_LOCALE=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`
}

export function LanguageMenu({
  align = 'right',
  variant = 'icon',
  onSelected
}: {
  align?: 'left' | 'right'
  variant?: 'icon' | 'select'
  onSelected?: (locale: Locale) => void | Promise<void>
}) {
  const t = useTranslations('marketingHeader')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const current = (getCookie('NEXT_LOCALE') as Locale | null) ?? 'en'

  const currentOption = useMemo(() => {
    return options.find((o) => o.locale === current) ?? options[0]
  }, [current])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const menu = (
    <div
      className={cn(
        'absolute top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur',
        align === 'right' ? 'right-0' : 'left-0',
        align === 'right'
          ? '[[dir=rtl]_&]:left-0 [[dir=rtl]_&]:right-auto'
          : '[[dir=rtl]_&]:right-0 [[dir=rtl]_&]:left-auto'
      )}
    >
      <div className="max-h-[60vh] overflow-auto p-1">
        {options.map((opt) => {
          const active = opt.locale === current
          return (
            <button
              key={opt.locale}
              type="button"
              onClick={async () => {
                setLocaleCookie(opt.locale)
                setOpen(false)
                if (onSelected) await onSelected(opt.locale)
                window.location.reload()
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                active ? 'bg-bg/30 text-text ring-1 ring-pink/25' : 'text-subtext hover:bg-bg/20 hover:text-text'
              )}
            >
              <span className="text-base">{opt.flag}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  if (variant === 'select') {
    return (
      <div ref={rootRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card/60 px-3 py-2 text-sm text-text hover:bg-card/70"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">{currentOption.flag}</span>
            <span className="font-semibold">{currentOption.label}</span>
          </span>
          <span className="text-subtext">▾</span>
        </button>
        {open ? menu : null}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t('openLanguageMenu')}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-subtext ring-1 ring-border hover:bg-card/60 hover:text-text"
      >
        <span className="text-base">🌐</span>
      </button>
      {open ? menu : null}
    </div>
  )
}

