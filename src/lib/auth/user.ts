import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function getCurrentUser() {
  const { accessToken, refreshToken } = getAuthCookies()

  if (!accessToken) return null
  const supabase = getSupabaseAuthClient()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser(accessToken)
  if (!error && data.user) return data.user

  if (!refreshToken) return null

  const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (refreshed.data.session?.access_token && refreshed.data.session.refresh_token) {
    setAuthCookies({
      accessToken: refreshed.data.session.access_token,
      refreshToken: refreshed.data.session.refresh_token
    })
    const { data: userData } = await supabase.auth.getUser(
      refreshed.data.session.access_token
    )
    return userData.user ?? null
  }

  return null
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
