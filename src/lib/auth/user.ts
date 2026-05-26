import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function getSupabaseAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null

  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: CookieToSet[]) {
        for (const c of toSet) cookieStore.set(c.name, c.value, c.options)
      }
    }
  })
}

export async function getCurrentUser() {
  const supabase = getSupabaseAuthServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
