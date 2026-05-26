import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

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

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalDate(dateStr: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  if (!m) return new Date(dateStr)
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d)
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const slice = text.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    return null
  }
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })

  const today = new Date()
  const horizon = new Date()
  horizon.setDate(horizon.getDate() + 13)

  const { data: exams } = await supabase
    .from('exams')
    .select('id,name,subject,exam_date')
    .eq('user_id', user.id)
    .order('exam_date', { ascending: true })
    .limit(20)

  const upcoming = (exams ?? [])
    .map((e: any) => ({
      id: e.id as string,
      name: e.name as string,
      subject: e.subject as string,
      examDate: e.exam_date as string
    }))
    .filter((e) => {
      const d = parseLocalDate(e.examDate)
      return d.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    })

  const fallbackPlan: Array<{ date: string; items: Array<{ title: string; subject: string }> }> = []
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const date = isoDate(d)
    const items: Array<{ title: string; subject: string }> = []
    for (const exam of upcoming) {
      if ((i + exam.subject.length) % 3 === 0) {
        items.push({ title: `Revise ${exam.subject} — ${exam.name}`, subject: exam.subject })
      }
    }
    if (items.length) fallbackPlan.push({ date, items })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ ok: true, source: 'fallback', plan: fallbackPlan })
  }

  const prompt = `You are Axoli, a friendly study planner. Produce STRICT JSON (no markdown, no code fences).

Return an object:
{
  "plan": [
    { "date": "YYYY-MM-DD", "items": [ { "title": "…", "subject": "…" } ] }
  ]
}

Rules:
- Only output dates between ${isoDate(today)} and ${isoDate(horizon)} inclusive.
- Prioritize the soonest exams.
- Keep each day to 1-3 items max.
- Titles should be short, actionable, and reference the exam name.

Exams:
${upcoming.map((e) => `- ${e.examDate}: ${e.name} (${e.subject})`).join('\n')}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const json = (await res.json().catch(() => null)) as any
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || 'AI generation failed'
    return NextResponse.json({ error: 'ai_failed', message: msg, fallback: fallbackPlan }, { status: 502 })
  }

  const text = Array.isArray(json?.content)
    ? json.content.map((c: any) => c?.text).filter(Boolean).join('\n')
    : ''

  const parsed = extractJsonObject(text) as any
  const plan = Array.isArray(parsed?.plan) ? parsed.plan : null
  if (!plan) return NextResponse.json({ error: 'bad_model_output', fallback: fallbackPlan }, { status: 500 })

  return NextResponse.json({ ok: true, source: 'ai', plan })
}

