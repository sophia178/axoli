import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type Exam = {
  id: string
  user_id: string
  name: string
  subject: string
  exam_date: string
  created_at: string
}

export async function getUpcomingExams(userId: string): Promise<Exam[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('exams')
    .select('id,user_id,name,subject,exam_date,created_at')
    .eq('user_id', userId)
    .order('exam_date', { ascending: true })
    .limit(6)

  return (data ?? []) as Exam[]
}
