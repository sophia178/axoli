import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function getUserPlan(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle()

  const profilePlan = (profile as any)?.plan as string | null | undefined
  if (profilePlan) return profilePlan

  const { data } = await supabase.from('users').select('plan').eq('id', userId).maybeSingle()
  return (data?.plan as string | null) ?? 'free'
}
