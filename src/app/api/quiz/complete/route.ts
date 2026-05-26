import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

async function getAuthedUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { user: null, error: 'server_misconfigured' as const }

  const cookieStore = cookies()
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet: CookieToSet[]) {
        for (const c of toSet) cookieStore.set(c.name, c.value, c.options)
      }
    }
  })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { user: null, error: 'unauthorized' as const }
  return { user: data.user, error: null }
}

const bodySchema = z.object({
  deckId: z.string().uuid().nullable(),
  mode: z.enum(['multiple_choice', 'true_false', 'written']),
  questionCount: z.number().int().min(5).max(20),
  correctCount: z.number().int().min(0).max(20),
  durationSeconds: z.number().int().min(0).max(60 * 60)
})

export async function POST(req: Request) {
  const auth = await getAuthedUser()
  if (auth.error === 'server_misconfigured') {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const user = auth.user

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const inserted = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    deck_id: parsed.data.deckId,
    mode: parsed.data.mode,
    question_count: parsed.data.questionCount,
    correct_count: parsed.data.correctCount,
    duration_seconds: parsed.data.durationSeconds
  })
  if (inserted.error) return NextResponse.json({ error: 'quiz_save_failed' }, { status: 500 })

  const perfect = parsed.data.correctCount === parsed.data.questionCount
  const coinsAwarded = perfect ? 25 : 10
  let coins = 0
  try {
    coins = await awardCoins(user.id, coinsAwarded, perfect ? 'quiz_perfect' : 'quiz_finish')
  } catch {
    return NextResponse.json({ error: 'coin_award_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, coinsAwarded, coins })
}
