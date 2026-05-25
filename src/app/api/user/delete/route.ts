import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { clearAuthCookies } from '@/lib/auth/cookies'

export const runtime = 'nodejs'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 })

  clearAuthCookies()
  return NextResponse.json({ ok: true })
}
