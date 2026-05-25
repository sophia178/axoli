import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from '@/i18n'

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'never',
  localeDetection: true
})

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}
