import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  examId: z.string().uuid(),
  date: z.string().min(10).max(10)
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('revision_completions').upsert(
    {
      user_id: user.id,
      exam_id: parsed.data.examId,
      scheduled_date: parsed.data.date
    },
    { onConflict: 'user_id,exam_id,scheduled_date' }
  )

  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

