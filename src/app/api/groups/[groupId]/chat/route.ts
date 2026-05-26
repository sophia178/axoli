import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const postSchema = z.object({
  message: z.string().min(1).max(800)
})

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function getSupabaseServer() {
  const admin = getSupabaseAdmin()
  if (admin) return admin

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

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  const { data: member } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const since = url.searchParams.get('since')

  let q = supabase
    .from('group_chat_messages')
    .select('id,group_id,user_id,message,created_at')
    .eq('group_id', params.groupId)
    .order('created_at', { ascending: true })
    .limit(80)

  if (since) q = q.gt('created_at', since)

  const { data } = await q
  const rows = (data ?? []) as any[]
  const userIds = Array.from(new Set(rows.map((r) => r.user_id as string)))
  const { data: profiles } =
    userIds.length > 0
      ? await supabase.from('profiles').select('user_id,username').in('user_id', userIds)
      : { data: [] as any[] }
  const usernameByUser = new Map<string, string | null>()
  for (const p of (profiles ?? []) as any[]) {
    usernameByUser.set(p.user_id as string, (p.username as string | null) ?? null)
  }
  return NextResponse.json({
    ok: true,
    messages: rows.map((m) => ({ ...m, username: usernameByUser.get(m.user_id as string) ?? null }))
  })
}

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  const { data: member } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { data, error } = await supabase
    .from('group_chat_messages')
    .insert({
      group_id: params.groupId,
      user_id: user.id,
      message: parsed.data.message
    })
    .select('id,group_id,user_id,message,created_at')
    .single()

  if (error || !data) return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()
  return NextResponse.json({ ok: true, message: { ...data, username: (profile as any)?.username ?? null } })
}
