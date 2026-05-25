'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function getEnvOrThrow(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function getSupabaseAuthServerClient() {
  const url = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_URL')
  const anon = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: CookieToSet[]) {
        for (const c of toSet) {
          cookieStore.set(c.name, c.value, c.options)
        }
      }
    }
  })
}

async function signUp(input: { email: string; password: string }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: 'Missing SUPABASE_URL' as const }
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: 'Missing SUPABASE_ANON_KEY' as const }
  }

  console.log(
    'SUPABASE_URL prefix:',
    process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20)
  )

  const supabase = getSupabaseAuthServerClient()
  const { data, error } = await supabase.auth.signUp(input)
  if (error || !data.user) return { error: 'signup_failed' as const }
  return { data } as const
}

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/login?error=invalid_credentials')

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login?error=missing_supabase_url')
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/login?error=missing_supabase_anon_key')
    const supabase = getSupabaseAuthServerClient()
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

  try {
    const result = await signUp(parsed.data)
    if ('error' in result) {
      if (result.error === 'Missing SUPABASE_URL') {
        redirect('/signup?error=missing_supabase_url')
      }
      if (result.error === 'Missing SUPABASE_ANON_KEY') {
        redirect('/signup?error=missing_supabase_anon_key')
      }
      redirect('/signup?error=signup_failed')
    }
    const data = result.data

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
