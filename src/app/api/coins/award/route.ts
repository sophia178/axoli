import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

const bodySchema = z.object({
  amount: z.number().int().min(1).max(500),
  reason: z.string().min(1).max(60)
})

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log('[CoinsAward] user:', user?.id ?? 'NONE')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('user_id', user.id)
    .maybeSingle()

  const newCoins = (profile?.coins ?? 0) + parsed.data.amount

  const { error: ledgerError } = await supabase
    .from('coins_ledger')
    .insert({ user_id: user.id, amount: parsed.data.amount, reason: parsed.data.reason })
  if (ledgerError) console.error('[CoinsAward] ledger error:', ledgerError.message)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ coins: newCoins })
    .eq('user_id', user.id)
  if (updateError) console.error('[CoinsAward] coins update error:', updateError.message)

  console.log('[CoinsAward] done — coins now:', newCoins)
  return NextResponse.json({ ok: true, coins: newCoins, coinsAwarded: parsed.data.amount })
}
