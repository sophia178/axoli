import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { applyPetDailyDecay } from '@/lib/pet/pet'

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
  pet_happiness: number
  pet_last_updated: string | null
  pet_level: number
  pet_colour: string
  pet_accessories: string[]
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
  await applyPetDailyDecay(userId)
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id,user_id,username,plan,language,coins,streak,last_study_date,last_login_date,pet_happiness,pet_last_updated,pet_level,pet_colour,pet_accessories,avatar_colour,notify_daily,notify_streak_risk,notify_exam,notify_group,stripe_customer_id,stripe_subscription_id,stripe_renewal_at'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return null
  return data as Profile | null
}
