import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  name: z.string().min(1).max(80),
  subject: z.string().min(1).max(60),
  examDate: z.string().min(4).max(32)
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { error } = await supabase.from('exams').insert({
    user_id: user.id,
    name: parsed.data.name,
    subject: parsed.data.subject,
    exam_date: parsed.data.examDate
  })

  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
