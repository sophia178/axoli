import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

export async function getCurrentUser() {
  const { accessToken, refreshToken } = getAuthCookies()

  if (!accessToken) return null
  const supabase = getSupabaseAdmin()

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
