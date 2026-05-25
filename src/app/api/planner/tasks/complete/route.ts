import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  taskId: z.string().uuid()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: task } = await supabase
    .from('planner_tasks')
    .select('id,completed_at')
    .eq('id', parsed.data.taskId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!task) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if ((task as any).completed_at) return NextResponse.json({ ok: true, coinsAwarded: 0 })

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('planner_tasks')
    .update({ completed_at: now })
    .eq('id', parsed.data.taskId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 })

  const coins = await awardCoins(user.id, 2, 'task_complete')
  return NextResponse.json({ ok: true, coinsAwarded: 2, coins })
}
