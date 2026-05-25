import Link from 'next/link'
import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { getUpcomingExams } from '@/lib/data/exams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TodaysTasks } from '@/components/dashboard/TodaysTasks'

function daysUntil(dateStr: string) {
  const target = new Date(dateStr)
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function DashboardHomePage() {
  const user = await requireUser()
  const [profile, exams] = await Promise.all([getProfile(user.id), getUpcomingExams(user.id)])
  const streak = profile?.streak ?? 0
  const coins = profile?.coins ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card/70 p-6 md:flex-row md:items-center">
        <div>
          <div className="text-sm text-subtext">Today&apos;s study streak</div>
          <div className="mt-1 font-heading text-3xl text-text">{streak}🔥</div>
          <div className="mt-2 text-sm text-subtext">
            Coins balance: <span className="text-text">{coins}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/dashboard/timer">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Quick start study timer
            </Button>
          </Link>
          <Link href="/dashboard/generate">
            <Button size="lg" className="w-full sm:w-auto">
              Generate flashcards
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exam countdown</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3 text-sm text-subtext">
                Add an exam and Bloom will keep the countdown here.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {exams.slice(0, 4).map((exam) => {
                  const d = daysUntil(exam.exam_date)
                  return (
                    <Link
                      key={exam.id}
                      href="/dashboard/exams"
                      className="rounded-3xl border border-border bg-bg/20 p-4 transition hover:bg-bg/30"
                    >
                      <div className="text-sm font-semibold text-text">
                        {exam.name}
                      </div>
                      <div className="mt-1 text-xs text-subtext">
                        {exam.subject}
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <div className="font-heading text-3xl text-gold">
                          {d}
                        </div>
                        <div className="text-sm text-subtext">days</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/exams" className="text-sm text-pink hover:underline">
                Manage exams
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TodaysTasks />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

