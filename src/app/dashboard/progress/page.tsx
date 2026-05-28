import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatStudyTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0 && m === 0) return '0m'
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default async function ProgressPage() {
  const user = await requireUser()
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const profile = await getProfile(user.id).catch(() => null)

  const now = new Date()
  const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
  const thirtyDaysAgo = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000))

  const hoursByDay7 = new Map<string, number>()
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    hoursByDay7.set(isoDate(d), 0)
  }

  const hoursByDay30 = new Map<string, number>()
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    hoursByDay30.set(isoDate(d), 0)
  }

  let sessionsCount = 0
  let decksCount = 0
  let groupsCount = 0
  let quizzesCompleted = 0
  let flashcardsMastered = 0
  let perfectQuiz = false
  let totalStudyHours = 0
  let totalCoinsEarnedAllTime = 0

  const subjectSeconds = new Map<string, number>()
  const subjectSet = new Set<string>()

  {
    try {
      const sessionsCountRes = await supabase
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      sessionsCount = sessionsCountRes.count ?? 0
    } catch {}

    try {
      const decksCountRes = await supabase
        .from('flashcard_decks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      decksCount = decksCountRes.count ?? 0
    } catch {}

    try {
      const groupsCountRes = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      groupsCount = groupsCountRes.count ?? 0
    } catch {}

    try {
      const quizzesCountRes = await supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      quizzesCompleted = quizzesCountRes.count ?? 0
    } catch {}

    try {
      const masteredRes = await supabase
        .from('flashcard_mastery')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('mastered', true)
      flashcardsMastered = masteredRes.count ?? 0
    } catch {}

    try {
      const perfectRes = await supabase
        .from('quiz_attempts')
        .select('id,question_count,correct_count')
        .eq('user_id', user.id)
        .limit(2000)
      perfectQuiz = (perfectRes.data ?? []).some(
        (a: any) => a.question_count === a.correct_count
      )
    } catch {}

    try {
      const allSessionsForTotals = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5000)

      const totalStudySeconds = (allSessionsForTotals.data ?? []).reduce(
        (acc: number, s: any) => acc + ((s.duration as number) ?? 0),
        0
      )
      console.log('[Progress] sessions count:', allSessionsForTotals.data?.length, 'total seconds:', totalStudySeconds, 'error:', allSessionsForTotals.error?.message ?? 'none')
      totalStudyHours = totalStudySeconds / 3600
    } catch {}

    try {
      const { data: ledger } = await supabase
        .from('coins_ledger')
        .select('amount')
        .eq('user_id', user.id)
        .limit(5000)
      totalCoinsEarnedAllTime = (ledger ?? [])
        .map((l: any) => l.amount as number)
        .filter((a) => a > 0)
        .reduce((acc, a) => acc + a, 0)
    } catch {}

    try {
      const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select('duration,subject,created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(5000)

      for (const s of (recentSessions ?? []) as any[]) {
        const date = isoDate(new Date(s.created_at as string))
        const seconds = (s.duration as number) ?? 0
        if (hoursByDay7.has(date)) {
          hoursByDay7.set(date, (hoursByDay7.get(date) ?? 0) + seconds / 3600)
        }
        if (hoursByDay30.has(date)) {
          hoursByDay30.set(date, (hoursByDay30.get(date) ?? 0) + seconds / 3600)
        }
        const subj = (s.subject as string | null)?.trim()
        if (!subj) continue
        subjectSet.add(subj)
        subjectSeconds.set(subj, (subjectSeconds.get(subj) ?? 0) + seconds)
      }
    } catch {}
  }

  const distinctSubjectsCount = subjectSet.size

  const barDays = Array.from(hoursByDay7.entries()).map(([date, hours]) => ({
    date,
    hours
  }))
  const maxBar = Math.max(1, ...barDays.map((d) => d.hours))
  const studyHoursThisWeek = barDays.reduce((acc, d) => acc + d.hours, 0)
  const studyTimeDisplay = formatStudyTime(studyHoursThisWeek)

  const subjectParts = Array.from(subjectSeconds.entries())
    .map(([subject, seconds]) => ({ subject, hours: seconds / 3600 }))
    .sort((a, b) => b.hours - a.hours)
    .filter((p) => p.hours > 0)

  const topSubjects = subjectParts.slice(0, 6)
  const subjectTotal = topSubjects.reduce((acc, p) => acc + p.hours, 0) || 1

  const achievements = [
    { name: 'First study session', unlocked: sessionsCount > 0 },
    { name: '7 day streak', unlocked: (profile?.streak ?? 0) >= 7 },
    { name: 'Study 10 hours total', unlocked: totalStudyHours >= 10 },
    { name: 'Create first flashcard deck', unlocked: decksCount > 0 },
    { name: 'Join first study group', unlocked: groupsCount > 0 },
    { name: 'Score 100% on a quiz', unlocked: perfectQuiz },
    { name: 'Study 5 subjects', unlocked: distinctSubjectsCount >= 5 },
    { name: 'Earn 500 coins', unlocked: totalCoinsEarnedAllTime >= 500 }
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Study hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl text-text sm:text-3xl">{studyTimeDisplay}</div>
            <div className="mt-2 text-sm text-subtext">This week</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl text-text sm:text-3xl">{profile?.streak ?? 0}🔥</div>
            <div className="mt-2 text-sm text-subtext">Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl text-text sm:text-3xl">{profile?.coins ?? 0}</div>
            <div className="mt-2 text-sm text-subtext">Current balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl text-text sm:text-3xl">{flashcardsMastered}</div>
            <div className="mt-2 text-sm text-subtext">Flashcards</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl text-text sm:text-3xl">{quizzesCompleted}</div>
            <div className="mt-2 text-sm text-subtext">Completed</div>
          </CardContent>
        </Card>
      </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Study hours (last 7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox="0 0 420 200" className="h-auto w-full">
                <rect x="0" y="0" width="420" height="200" fill="transparent" />
                {barDays.map((d, i) => {
                  const h = d.hours
                  const barH = (h / maxBar) * 140
                  const x = 20 + i * 55
                  const y = 170 - barH
                  return (
                    <g key={d.date}>
                      <rect
                        x={x}
                        y={y}
                        width="34"
                        height={barH}
                        rx="10"
                        fill="#FF8FAB"
                        opacity={0.85}
                      />
                      <text x={x + 17} y="190" textAnchor="middle" fontSize="10" fill="#8888AA">
                        {d.date.slice(5)}
                      </text>
                      <text x={x + 17} y={y - 6} textAnchor="middle" fontSize="10" fill="#FFFFFF">
                        {Math.round(h * 10) / 10}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSubjects.length === 0 ? (
              <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
                No subject data yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0 sm:h-40 sm:w-40">
                  <circle cx="70" cy="70" r="52" fill="transparent" stroke="#2A2A4A" strokeWidth="18" />
                  {(() => {
                    let offset = 0
                    const colors = ['#FF8FAB', '#FFD700', '#7AE7B9', '#7C5CFF', '#FFB86B', '#8BE9FD']
                    return topSubjects.map((p, i) => {
                      const frac = p.hours / subjectTotal
                      const dash = 2 * Math.PI * 52
                      const length = dash * frac
                      const c = colors[i % colors.length]
                      const el = (
                        <circle
                          key={p.subject}
                          cx="70"
                          cy="70"
                          r="52"
                          fill="transparent"
                          stroke={c}
                          strokeWidth="18"
                          strokeDasharray={`${length} ${dash - length}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="butt"
                          transform="rotate(-90 70 70)"
                        />
                      )
                      offset += length
                      return el
                    })
                  })()}
                  <circle cx="70" cy="70" r="34" fill="#0A0A1A" />
                  <text x="70" y="74" textAnchor="middle" fontSize="12" fill="#FFFFFF">
                    {topSubjects[0]?.subject ?? ''}
                  </text>
                </svg>
                <div className="flex-1 space-y-2">
                  {topSubjects.map((p) => (
                    <div key={p.subject} className="flex items-center justify-between gap-3">
                      <div className="text-sm text-text">{p.subject}</div>
                      <div className="text-sm text-subtext">
                        {Math.round(p.hours * 10) / 10}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Streak calendar (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1 sm:gap-2">
              {Array.from(hoursByDay30.entries()).map(([date, hours]) => {
                const intensity = clamp(hours / 2.5, 0, 1)
                const color =
                  hours === 0
                    ? '#2A2A4A'
                    : `rgba(122,231,185,${0.25 + intensity * 0.65})`
                return (
                  <div
                    key={date}
                    title={`${date}: ${Math.round(hours * 10) / 10}h`}
                    className="h-5 w-5 rounded-md ring-1 ring-border sm:h-6 sm:w-6 sm:rounded-lg"
                    style={{ background: color }}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <div
                  key={a.name}
                  className={`rounded-3xl border p-4 ${
                    a.unlocked
                      ? 'border-success/35 bg-success/10'
                      : 'border-border bg-bg/20'
                  }`}
                >
                  <div className="text-sm font-semibold text-text">{a.name}</div>
                  <div className="mt-2 text-xs text-subtext">
                    {a.unlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
  )
}
