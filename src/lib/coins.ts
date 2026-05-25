import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function awardCoins(userId: string, amount: number, reason: string) {
  const supabase = getSupabaseAdmin()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error('Could not load profile')

  const current = profile?.coins ?? 0
  const next = Math.max(0, current + amount)

  await supabase.from('coins_ledger').insert({
    user_id: userId,
    amount,
    reason
  })

  const updated = await supabase
    .from('profiles')
    .update({ coins: next })
    .eq('user_id', userId)
    .select('coins')
    .single()

  if (updated.error) throw new Error('Could not update coins')
  return updated.data.coins as number
}

export async function spendCoins(userId: string, amount: number, reason: string) {
  return awardCoins(userId, -Math.abs(amount), reason)
}
