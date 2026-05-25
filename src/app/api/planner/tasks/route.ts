import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const postSchema = z.object({
  title: z.string().min(1).max(120),
  subject: z.string().min(1).max(60),
  estimatedMinutes: z.number().int().min(5).max(600)
})

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const today = todayISO()

  await supabase
    .from('planner_tasks')
    .update({ scheduled_date: today })
    .eq('user_id', user.id)
    .lt('scheduled_date', today)
    .is('completed_at', null)

  const { data } = await supabase
    .from('planner_tasks')
    .select('id,title,subject,estimated_minutes,scheduled_date,completed_at,created_at')
    .eq('user_id', user.id)
    .eq('scheduled_date', today)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ok: true, today, tasks: data ?? [] })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const today = todayISO()
  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      subject: parsed.data.subject,
      estimated_minutes: parsed.data.estimatedMinutes,
      scheduled_date: today
    })
    .select('id,title,subject,estimated_minutes,scheduled_date,completed_at,created_at')
    .single()

  if (error || !data) return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  return NextResponse.json({ ok: true, task: data })
}
