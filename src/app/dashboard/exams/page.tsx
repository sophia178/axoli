import { requireUser } from '@/lib/auth/user'
import { getUpcomingExams } from '@/lib/data/exams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ExamManager } from '@/components/exams/ExamManager'

function parseLocalDate(dateStr: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  if (!m) return new Date(dateStr)
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d)
}

function daysUntil(dateStr: string) {
  const target = parseLocalDate(dateStr)
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function ExamsPage() {
  const user = await requireUser()
  const exams = await getUpcomingExams(user.id)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Exam Countdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
              No exams yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {exams.map((exam) => (
                <div key={exam.id} className="rounded-3xl border border-border bg-bg/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-text">{exam.name}</div>
                      <div className="mt-1 text-sm text-subtext">{exam.subject}</div>
                    </div>
                    <div className="rounded-2xl bg-gold/15 px-3 py-2 text-right">
                      <div className="font-heading text-xl text-gold sm:text-2xl">
                        {daysUntil(exam.exam_date)}
                      </div>
                      <div className="text-xs text-subtext">days</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-subtext">
                    Date: {new Date(exam.exam_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
