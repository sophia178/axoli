'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

async function ensureProfileExists(input: { userId: string; email: string }) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('server_misconfigured')

  const { error: userUpsertError } = await supabase
    .from('users')
    .upsert({ id: input.userId, email: input.email }, { onConflict: 'id' })
  if (userUpsertError) throw new Error('user_upsert_failed')

  const usernameFromEmail = input.email.split('@')[0] ?? null
  const { error: profileUpsertError } = await supabase
    .from('profiles')
    .upsert(
      { user_id: input.userId, username: usernameFromEmail },
      { onConflict: 'user_id' }
    )
  if (profileUpsertError) throw new Error('profile_upsert_failed')
}

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/login?error=invalid_credentials')

  const supabase = getSupabaseAdmin()
  if (!supabase) redirect('/login?error=server_misconfigured')
  try {
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error || !data.session) redirect('/login?error=auth_failed')

    setAuthCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    })

    redirect('/dashboard')
  } catch {
    redirect('/login?error=auth_failed')
  }
}

export async function signupAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/signup?error=invalid_credentials')

  const supabase = getSupabaseAdmin()
  if (!supabase) redirect('/signup?error=server_misconfigured')
  try {
    const { data, error } = await supabase.auth.signUp(parsed.data)
    if (error || !data.user) redirect('/signup?error=signup_failed')

    try {
      await ensureProfileExists({ userId: data.user.id, email: parsed.data.email })
    } catch {
      redirect('/signup?error=profile_create_failed')
    }

    if (data.session) {
      setAuthCookies({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      })
      redirect('/dashboard')
    }

    redirect('/login?notice=check_email')
  } catch {
    redirect('/signup?error=signup_failed')
  }
}

export async function logoutAction() {
  clearAuthCookies()
  redirect('/login')
}
