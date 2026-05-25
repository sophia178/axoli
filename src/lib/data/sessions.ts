import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type StudySession = {
  id: string
  user_id: string
  duration: number
  subject: string | null
  coins_earned: number
  created_at: string
}

export async function getRecentSessions(userId: string): Promise<StudySession[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('study_sessions')
    .select('id,user_id,duration,subject,coins_earned,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(12)

  return (data ?? []) as StudySession[]
}
