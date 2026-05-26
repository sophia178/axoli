import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getUserPlan } from '@/lib/data/user'
import { consumeGeneration } from '@/lib/ai/usage'
import { generateWithClaude } from '@/lib/ai/claude'

export const runtime = 'nodejs'

const bodySchema = z.object({
  text: z.string().min(100).max(30000),
  subject: z.string().min(1).max(60).optional()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const plan = await getUserPlan(user.id)
  const usage = await consumeGeneration(user.id, plan)
  if (!usage.ok) {
    if ((usage as any).error === 'missing_supabase_admin') {
      return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
    }
    return NextResponse.json({ error: 'ai_limit', upgrade: true }, { status: 402 })
  }

  let result: Awaited<ReturnType<typeof generateWithClaude>>
  try {
    result = await generateWithClaude({
      subjectHint: parsed.data.subject,
      content: parsed.data.text
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed'
    return NextResponse.json({ error: 'ai_failed', message }, { status: 502 })
  }

  if (!result.parsed) {
    return NextResponse.json({ error: 'bad_model_output', raw: result.raw }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    remaining: usage.remaining,
    coinsAwarded: usage.coinsAwarded,
    output: result.parsed
  })
}
