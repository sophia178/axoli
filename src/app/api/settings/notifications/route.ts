import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  daily: z.boolean(),
  streakRisk: z.boolean(),
  exam: z.boolean(),
  group: z.boolean()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('profiles')
    .update({
      notify_daily: parsed.data.daily,
      notify_streak_risk: parsed.data.streakRisk,
      notify_exam: parsed.data.exam,
      notify_group: parsed.data.group
    })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

