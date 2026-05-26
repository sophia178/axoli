import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  deckId: z.string().uuid().nullable(),
  mode: z.enum(['multiple_choice', 'true_false', 'written']),
  questionCount: z.number().int().min(5).max(20),
  correctCount: z.number().int().min(0).max(20),
  durationSeconds: z.number().int().min(0).max(60 * 60)
})

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const cookieStore = cookies()
  const supabaseAuth = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const c of toSet) cookieStore.set(c.name, c.value, c.options as Parameters<typeof cookieStore.set>[2])
      }
    }
  })

  const { data, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !data.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const user = data.user

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })

  const { error: insertError } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId,
    mode: parsed.data.mode,
    score: parsed.data.correctCount,
    total: parsed.data.questionCount,
    time_seconds: parsed.data.durationSeconds
  })
  if (insertError) {
    console.error('[quiz/complete] insert error:', insertError)
    return NextResponse.json({ error: 'quiz_save_failed' }, { status: 500 })
  }

  try {
    await awardCoins(user.id, 5, 'quiz_complete')
  } catch (e) {
    console.error('[quiz/complete] awardCoins error:', e)
  }

  return NextResponse.json({ ok: true, coinsAwarded: 5, promptDouble: true })
}
