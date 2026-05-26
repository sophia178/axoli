'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { clearAuthCookies } from '@/lib/auth/cookies'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function getSupabaseAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
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

export async function signupAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/signup?error=invalid_credentials')

  let supabase: ReturnType<typeof getSupabaseAuthServerClient>
  try {
    supabase = getSupabaseAuthServerClient()
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      redirect('/signup?error=missing_supabase_url')
    }
    if (message.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      redirect('/signup?error=missing_supabase_anon_key')
    }
    redirect('/signup?error=server_misconfigured')
  }
  const { data, error } = await supabase.auth.signUp(parsed.data)

  if (error) {
    console.error('SIGNUP ERROR:', error)
    redirect('/signup?error=signup_failed')
  }

  if (!data.user && !data.session) {
    console.error('SIGNUP ERROR: No user and no session returned.', data)
    redirect('/signup?error=signup_failed')
  }

  if (data.user && !data.session) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword(parsed.data)
    if (signInError) {
      console.error('SIGNUP AUTO-LOGIN ERROR:', signInError)
      redirect('/login?notice=check_email')
    }
    if (!signInData.session) {
      console.error('SIGNUP AUTO-LOGIN ERROR: No session returned.', {
        userId: signInData.user?.id ?? null
      })
      redirect('/login?notice=check_email')
    }
  }

  redirect('/dashboard')
}

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) redirect('/login?error=invalid_credentials')

  let supabase: ReturnType<typeof getSupabaseAuthServerClient>
  try {
    supabase = getSupabaseAuthServerClient()
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      redirect('/login?error=missing_supabase_url')
    }
    if (message.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      redirect('/login?error=missing_supabase_anon_key')
    }
    redirect('/login?error=server_misconfigured')
  }
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    console.error('LOGIN ERROR:', error)
    redirect('/login?error=auth_failed')
  }
  if (!data.session) {
    console.error('LOGIN ERROR: No session returned.', { userId: data.user?.id ?? null })
    redirect('/login?error=auth_failed')
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  clearAuthCookies()
  redirect('/login')
}
