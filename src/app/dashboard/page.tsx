import Link from 'next/link'
import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { getUpcomingExams } from '@/lib/data/exams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TodaysTasks } from '@/components/dashboard/TodaysTasks'

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function PetPreview({
  happiness,
  level
}: {
  happiness: number
  level: number
}) {
  const h = clamp(happiness, 0, 100)
  return (
    <Link
      href="/dashboard/pet"
      className="group flex items-center justify-between gap-4 rounded-3xl border border-border bg-card/70 p-6 transition hover:bg-card/80"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-bg/30 ring-1 ring-border">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <defs>
              <linearGradient id="dPet" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#FF8FAB" />
                <stop offset="1" stopColor="#FFB6C8" />
              </linearGradient>
            </defs>
            <path
              d="M44 38c-14 0-26 16-26 38 0 28 20 50 42 50s42-22 42-50c0-22-12-38-26-38-8 0-12 4-16 4s-8-4-16-4Z"
              fill="url(#dPet)"
              stroke="#2A2A4A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M32 52c10 4 18 10 22 18"
              fill="none"
              stroke="#FFD700"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M88 52c-10 4-18 10-22 18"
              fill="none"
              stroke="#FFD700"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <circle cx="50" cy="70" r="10" fill="#FFFFFF" />
            <circle cx="70" cy="70" r="10" fill="#FFFFFF" />
            <circle cx="52" cy="72" r="5" fill="#0A0A1A" />
            <circle cx="72" cy="72" r="5" fill="#0A0A1A" />
            <circle cx="46" cy="64" r="3" fill="#FFFFFF" opacity="0.9" />
            <circle cx="66" cy="64" r="3" fill="#FFFFFF" opacity="0.9" />
            <path
              d="M54 84c6 8 14 8 20 0"
              fill="none"
              stroke="#2A2A4A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="44" cy="84" r="6" fill="#FF8FAB" opacity="0.18" />
            <circle cx="76" cy="84" r="6" fill="#FF8FAB" opacity="0.18" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="font-heading text-2xl text-text">Your axolotl</div>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
              Lv {level}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-bg/40 ring-1 ring-border">
              <div className="h-full rounded-full bg-pink" style={{ width: `${h}%` }} />
            </div>
            <div className="text-xs text-subtext">{h}%</div>
          </div>
          <div className="mt-2 text-xs text-subtext group-hover:text-text">
            Visit the pet room
          </div>
        </div>
      </div>
      <div className="text-subtext transition group-hover:text-text">→</div>
    </Link>
  )
}

export default async function DashboardHomePage() {
  const user = await requireUser()
  let profile: Awaited<ReturnType<typeof getProfile>> = null
  let exams: Awaited<ReturnType<typeof getUpcomingExams>> = []

  try {
    ;[profile, exams] = await Promise.all([
      getProfile(user.id),
      getUpcomingExams(user.id)
    ])
  } catch {
    return (
      <div className="rounded-3xl border border-border bg-card/70 p-6 text-sm text-subtext">
        Loading your dashboard…
      </div>
    )
  }

  const streak = profile?.streak ?? 0
  const coins = profile?.coins ?? 0
  const happiness = profile?.pet_happiness ?? 70
  const level = profile?.pet_level ?? 1

  return (
    <div className="space-y-6">
      <PetPreview happiness={happiness} level={level} />
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
                Add an exam and Axoli will keep the countdown here.
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
