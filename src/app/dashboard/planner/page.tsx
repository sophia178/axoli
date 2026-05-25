import { requireUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getUpcomingExams } from '@/lib/data/exams'
import { PlannerBoard } from '@/components/planner/PlannerBoard'

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default async function PlannerPage() {
  const user = await requireUser()
  const exams = await getUpcomingExams(user.id)
  const supabase = getSupabaseAdmin()

  const today = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 14)

  const { data: completions } = await supabase
    .from('revision_completions')
    .select('exam_id,scheduled_date')
    .eq('user_id', user.id)
    .gte('scheduled_date', isoDate(today))
    .lte('scheduled_date', isoDate(end))

  const done = new Set(
    (completions ?? []).map((c: any) => `${c.exam_id}:${c.scheduled_date as string}`)
  )

  const revision = exams.flatMap((exam) => {
    const examDate = new Date(exam.exam_date)
    const until = examDate < end ? examDate : end
    const items: Array<{
      key: string
      examId: string
      examName: string
      subject: string
      date: string
      completed: boolean
    }> = []
    for (let d = new Date(today); d <= until; d.setDate(d.getDate() + 1)) {
      const date = isoDate(d)
      const key = `${exam.id}:${date}`
      items.push({
        key,
        examId: exam.id,
        examName: exam.name,
        subject: exam.subject,
        date,
        completed: done.has(key)
      })
    }
    return items
  })

  return <PlannerBoard revision={revision} />
}
