import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function awardCoins(userId: string, amount: number, reason: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return 0

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return 0

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

    if (updated.error) return current
    return (updated.data.coins as number) ?? current
  } catch {
    return 0
  }
}

export async function spendCoins(userId: string, amount: number, reason: string) {
  return awardCoins(userId, -Math.abs(amount), reason)
}
