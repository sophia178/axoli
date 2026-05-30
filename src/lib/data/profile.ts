import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { applyPetHappinessDecay, applyPetHungerDecay } from '@/lib/pet/pet'

export type Profile = {
  id: string
  user_id: string
  username: string | null
  plan?: string
  language?: string
  coins: number
  streak: number
  last_study_date: string | null
  last_login_date: string | null
  xp: number
  pet_name?: string | null
  pet_happiness: number
  pet_last_updated: string | null
  hunger_level?: number
  last_fed_at?: string | null
  pet_level: number
  pet_colour: string
  pet_accessories: string[]
  pet_item_states?: unknown
  avatar_colour?: string
  notify_daily?: boolean
  notify_streak_risk?: boolean
  notify_exam?: boolean
  notify_group?: boolean
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  stripe_renewal_at?: string | null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  await applyPetHungerDecay(userId)
  await applyPetHappinessDecay(userId)
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id,user_id,username,plan,language,coins,streak,xp,last_study_date,last_login_date,pet_name,pet_happiness,pet_last_updated,hunger_level,last_fed_at,pet_level,pet_colour,pet_accessories,pet_item_states,avatar_colour,notify_daily,notify_streak_risk,notify_exam,notify_group,stripe_customer_id,stripe_subscription_id,stripe_renewal_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return null
  if (data) return data as Profile

  try {
    const authRes = await supabase.auth.admin.getUserById(userId)
    const email = authRes.data.user?.email ?? null
    if (authRes.error || !email) return null

    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({ id: userId, email }, { onConflict: 'id' })
    if (userUpsertError) return null

    const usernameFromEmail = email.split('@')[0] ?? null
    const { error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, username: usernameFromEmail }, { onConflict: 'user_id' })
    if (profileUpsertError) return null

    const retry = await supabase
      .from('profiles')
      .select(
        'id,user_id,username,plan,language,coins,streak,xp,last_study_date,last_login_date,pet_name,pet_happiness,pet_last_updated,hunger_level,last_fed_at,pet_level,pet_colour,pet_accessories,pet_item_states,avatar_colour,notify_daily,notify_streak_risk,notify_exam,notify_group,stripe_customer_id,stripe_subscription_id,stripe_renewal_at'
      )
      .eq('user_id', userId)
      .maybeSingle()
    if (retry.error) return null
    return (retry.data as Profile | null) ?? null
  } catch {
    return null
  }
}
