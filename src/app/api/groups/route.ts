import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const createSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1).max(80),
  subject: z.string().min(1).max(60),
  isPrivate: z.boolean().optional()
})

const joinSchema = z.object({
  action: z.literal('join'),
  joinCode: z.string().min(4).max(12)
})

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

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

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const createParsed = createSchema.safeParse(json)
  const joinParsed = createParsed.success ? null : joinSchema.safeParse(json)

  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })

  if (createParsed.success) {
    const data = createParsed.data
    const joinCode = makeCode()
    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({
        name: data.name,
        subject: data.subject,
        created_by: user.id,
        join_code: joinCode,
        is_private: data.isPrivate ?? false
      })
      .select('id,join_code')
      .single()

    if (error || !group) return NextResponse.json({ error: 'create_failed' }, { status: 500 })

    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin'
    })

    return NextResponse.json({ ok: true, groupId: group.id })
  }

  if (joinParsed?.success) {
    const data = joinParsed.data
    const { data: group } = await supabase
      .from('study_groups')
      .select('id')
      .eq('join_code', data.joinCode.toUpperCase())
      .maybeSingle()

    if (!group) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const { error } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id
    })
    if (error) return NextResponse.json({ error: 'join_failed' }, { status: 500 })

    return NextResponse.json({ ok: true, groupId: group.id })
  }

  return NextResponse.json({ error: 'bad_request' }, { status: 400 })
}
