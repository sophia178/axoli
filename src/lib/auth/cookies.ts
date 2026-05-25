import { cookies } from 'next/headers'

const ACCESS_TOKEN_COOKIE = 'bloom_at'
const REFRESH_TOKEN_COOKIE = 'bloom_rt'

export function getAuthCookies() {
  const store = cookies()
  return {
    accessToken: store.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: store.get(REFRESH_TOKEN_COOKIE)?.value ?? null
  }
}

export function setAuthCookies(input: {
  accessToken: string
  refreshToken: string
}) {
  const store = cookies()
  const secure = process.env.NODE_ENV === 'production'
  store.set(ACCESS_TOKEN_COOKIE, input.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/'
  })
  store.set(REFRESH_TOKEN_COOKIE, input.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/'
  })
}

export function clearAuthCookies() {
  const store = cookies()
  store.delete(ACCESS_TOKEN_COOKIE)
  store.delete(REFRESH_TOKEN_COOKIE)
}

