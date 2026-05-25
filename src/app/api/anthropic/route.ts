import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  input: z.string().min(1).max(12000),
  mode: z.enum(['notes', 'youtube', 'pdf']).optional(),
  count: z.number().int().min(4).max(30).optional()
})

function monthKey(d = new Date()) {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

function extractJson(text: string) {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return null
  const slice = text.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return NextResponse.json({ error: 'missing_anthropic_key' }, { status: 500 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: planRow } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = (planRow?.plan as string | null) ?? 'free'
  const limit = plan.startsWith('premium') ? 400 : 40
  const key = monthKey()

  const { data: usageRow } = await supabase
    .from('ai_usage')
    .select('id,count')
    .eq('user_id', user.id)
    .eq('month', key)
    .maybeSingle()

  const used = usageRow?.count ?? 0
  if (used >= limit) return NextResponse.json({ error: 'ai_limit' }, { status: 402 })

  const count = parsed.data.count ?? 12
  const mode = parsed.data.mode ?? 'notes'

  const prompt = `You are a study assistant. Generate ${count} flashcards from the user's content. Output ONLY valid JSON: an array of objects with keys "front" and "back". Keep each front under 140 chars. Keep each back under 280 chars. No markdown.

Mode: ${mode}
Content:
${parsed.data.input}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1200,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = (await res.json().catch(() => null)) as any
  if (!res.ok) return NextResponse.json({ error: 'anthropic_failed', detail: data }, { status: 502 })

  const text = Array.isArray(data?.content)
    ? data.content.map((c: any) => c?.text).filter(Boolean).join('\n')
    : ''
  const parsedJson = extractJson(text)
  if (!Array.isArray(parsedJson)) return NextResponse.json({ error: 'bad_model_output', raw: text }, { status: 500 })

  const cards = parsedJson
    .map((c) => ({
      front: typeof c?.front === 'string' ? c.front.trim() : '',
      back: typeof c?.back === 'string' ? c.back.trim() : ''
    }))
    .filter((c) => c.front && c.back)
    .slice(0, 50)

  await supabase.from('ai_usage').upsert(
    {
      id: usageRow?.id,
      user_id: user.id,
      month: key,
      count: used + 1
    },
    { onConflict: 'user_id,month' }
  )

  return NextResponse.json({ ok: true, plan, remaining: Math.max(0, limit - (used + 1)), cards })
}
