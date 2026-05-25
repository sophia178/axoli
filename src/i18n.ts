import { headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const locales = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'nl',
  'pl',
  'tr',
  'ar',
  'hi',
  'ja',
  'ko',
  'zh'
] as const

export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

const messageLoaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: () => import('./messages/en.json'),
  es: () => import('./messages/es.json'),
  fr: () => import('./messages/fr.json'),
  de: () => import('./messages/de.json'),
  pt: () => import('./messages/pt.json'),
  it: () => import('./messages/it.json'),
  nl: () => import('./messages/nl.json'),
  pl: () => import('./messages/pl.json'),
  tr: () => import('./messages/tr.json'),
  ar: () => import('./messages/ar.json'),
  hi: () => import('./messages/hi.json'),
  ja: () => import('./messages/ja.json'),
  ko: () => import('./messages/ko.json'),
  zh: () => import('./messages/zh.json')
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (Array.isArray(base) && Array.isArray(override)) return override
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base }
    for (const [k, v] of Object.entries(override)) {
      out[k] = deepMerge((base as Record<string, unknown>)[k], v)
    }
    return out
  }
  return override ?? base
}

function parseAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null
  const parts = value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(';')[0]?.trim())
    .filter(Boolean) as string[]

  for (const part of parts) {
    const lower = part.toLowerCase()
    if (isLocale(lower)) return lower
    const base = lower.split('-')[0]
    if (isLocale(base)) return base
  }
  return null
}

async function getProfileLocale(userId: string): Promise<Locale | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('profiles')
    .select('language')
    .eq('user_id', userId)
    .maybeSingle()
  const language = (data as { language?: unknown } | null)?.language
  return isLocale(language) ? language : null
}

export default getRequestConfig(async ({ requestLocale }) => {
  const baseMessages = (await messageLoaders.en()).default as AbstractIntlMessages
  const cookieLocale = await requestLocale
  if (isLocale(cookieLocale)) {
    const mod = await messageLoaders[cookieLocale]()
    const messages =
      (cookieLocale === 'en' ? mod.default : deepMerge(baseMessages, mod.default)) as AbstractIntlMessages
    return { locale: cookieLocale, messages }
  }

  const user = await getCurrentUser()
  if (user) {
    const profileLocale = await getProfileLocale(user.id)
    if (profileLocale) {
      const mod = await messageLoaders[profileLocale]()
      const messages =
        (profileLocale === 'en'
          ? mod.default
          : deepMerge(baseMessages, mod.default)) as AbstractIntlMessages
      return { locale: profileLocale, messages }
    }
  }

  const headerLocale = parseAcceptLanguage(headers().get('accept-language'))
  const resolved = headerLocale ?? defaultLocale
  const mod = await messageLoaders[resolved]()
  const messages =
    (resolved === 'en' ? mod.default : deepMerge(baseMessages, mod.default)) as AbstractIntlMessages
  return { locale: resolved, messages }
})
