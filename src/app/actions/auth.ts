'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/login?error=invalid_credentials')

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.session) redirect('/login?error=auth_failed')

  setAuthCookies({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token
  })

  redirect('/dashboard')
}

export async function signupAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/signup?error=invalid_credentials')

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.signUp(parsed.data)
  if (error) redirect('/signup?error=signup_failed')

  if (data.session) {
    setAuthCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    })
    redirect('/dashboard')
  }

  redirect('/login?notice=check_email')
}

export async function logoutAction() {
  clearAuthCookies()
  redirect('/login')
}

