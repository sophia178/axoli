import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getLevelForXp } from '@/lib/pet/stages'

export type XpResult = { xp: number; level: number; leveledUp: boolean }

// Awards study XP and keeps profiles.pet_level in sync with the XP thresholds
// in lib/pet/stages.ts. Returns whether the pet crossed into a new stage.
export async function awardXp(userId: string, amount: number): Promise<XpResult> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('missing_supabase_admin')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('xp,pet_level')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('profile_load_failed')

  const currentXp = Number(profile?.xp ?? 0)
  const currentLevel = Number(profile?.pet_level ?? getLevelForXp(currentXp))
  const gain = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0

  if (gain === 0) {
    return { xp: currentXp, level: currentLevel, leveledUp: false }
  }

  const nextXp = currentXp + gain
  const nextLevel = getLevelForXp(nextXp)
  const leveledUp = nextLevel > currentLevel

  const updated = await supabase
    .from('profiles')
    .update({ xp: nextXp, pet_level: nextLevel })
    .eq('user_id', userId)
    .select('xp,pet_level')
    .single()
  if (updated.error) throw new Error('xp_update_failed')

  return {
    xp: Number(updated.data.xp ?? nextXp),
    level: Number(updated.data.pet_level ?? nextLevel),
    leveledUp
  }
}

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
