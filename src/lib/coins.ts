import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function awardCoins(userId: string, amount: number, reason: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('missing_supabase_admin')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('profile_load_failed')

  const current = profile?.coins ?? 0
  const next = Math.max(0, current + amount)

  const ledger = await supabase.from('coins_ledger').insert({
    user_id: userId,
    amount,
    reason
  })
  if (ledger.error) throw new Error('coins_ledger_insert_failed')

  const updated = await supabase
    .from('profiles')
    .update({ coins: next })
    .eq('user_id', userId)
    .select('coins')
    .single()

  if (updated.error) throw new Error('coins_update_failed')
  return (updated.data.coins as number) ?? next
}

export async function spendCoins(userId: string, amount: number, reason: string) {
  const spendAmount = Math.abs(amount)
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('missing_supabase_admin')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('profile_load_failed')

  const current = profile?.coins ?? 0
  if (current < spendAmount) throw new Error('not_enough_coins')
  return awardCoins(userId, -spendAmount, reason)
}
