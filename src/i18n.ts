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

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}
