import { NextResponse } from 'next/server'
import { z } from 'zod'
import pdf from 'pdf-parse'
import { getCurrentUser } from '@/lib/auth/user'
import { getUserPlan } from '@/lib/data/user'
import { consumeGeneration } from '@/lib/ai/usage'
import { generateWithClaude } from '@/lib/ai/claude'

export const runtime = 'nodejs'

const bodySchema = z.object({
  base64: z.string().min(50).max(25_000_000),
  filename: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(60).optional()
})

function decodeBase64(input: string) {
  const trimmed = input.replace(/^data:application\/pdf;base64,/, '')
  return Buffer.from(trimmed, 'base64')
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const filename = parsed.data.filename ?? ''
  if (filename && !filename.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'pdf_only' }, { status: 400 })
  }

  const plan = await getUserPlan(user.id)
  const usage = await consumeGeneration(user.id, plan)
  if (!usage.ok) {
    if ((usage as any).error === 'missing_supabase_admin') {
      return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
    }
    return NextResponse.json({ error: 'ai_limit', upgrade: true }, { status: 402 })
  }

  const buf = decodeBase64(parsed.data.base64)
  const parsedPdf = await pdf(buf).catch(() => null)
  const text = parsedPdf?.text?.trim() ?? ''
  if (text.length < 80) return NextResponse.json({ error: 'no_text' }, { status: 422 })

  let result: Awaited<ReturnType<typeof generateWithClaude>>
  try {
    result = await generateWithClaude({
      subjectHint: parsed.data.subject,
      content: `PDF filename: ${filename}\n\n${text}`
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
