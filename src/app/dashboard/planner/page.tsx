import { requireUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getUpcomingExams } from '@/lib/data/exams'
import { PlannerBoard } from '@/components/planner/PlannerBoard'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

function parseLocalDate(dateStr: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  if (!m) return new Date(dateStr)
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d)
}

export default async function PlannerPage() {
  const user = await requireUser()
  const exams = await getUpcomingExams(user.id)
  const admin = getSupabaseAdmin()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = cookies()
  const supabase =
    admin ??
    (url && anon
      ? createServerClient(url, anon, {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(toSet: CookieToSet[]) {
              for (const c of toSet) cookieStore.set(c.name, c.value, c.options)
            }
          }
        })
      : null)

  const today = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 14)

  const { data: completions } = supabase
    ? await supabase
        .from('revision_completions')
        .select('exam_id,scheduled_date')
        .eq('user_id', user.id)
        .gte('scheduled_date', isoDate(today))
        .lte('scheduled_date', isoDate(end))
    : { data: [] as any[] }

  const done = new Set(
    (completions ?? []).map((c: any) => `${c.exam_id}:${c.scheduled_date as string}`)
  )

  const revision = exams.flatMap((exam) => {
    const examDate = parseLocalDate(exam.exam_date)
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
