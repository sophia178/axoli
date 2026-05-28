'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'
import { useDoubleCoins } from '@/hooks/useDoubleCoins'
import { cn } from '@/lib/cn'

type DeckOption = { id: string; title: string; subject: string }
type Mode = 'multiple_choice' | 'true_false' | 'written'

type RawCard = { id: string; front: string; back: string }

type Question =
  | {
      mode: 'multiple_choice'
      prompt: string
      options: string[]
      correctIndex: number
      correctText: string
    }
  | {
      mode: 'true_false'
      prompt: string
      statement: string
      isTrue: boolean
      correctText: string
    }
  | {
      mode: 'written'
      prompt: string
      answer: string
    }

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[\s\W_]+/g, ' ')
    .trim()
}

function pickN<T>(arr: T[], n: number) {
  return shuffle(arr).slice(0, Math.min(n, arr.length))
}

export function QuizFlow({
  decks,
  initialDeckId
}: {
  decks: DeckOption[]
  initialDeckId?: string | null
}) {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()
  const { promptFromResponse, modal } = useDoubleCoins()

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [deckId, setDeckId] = useState<string>(initialDeckId ?? '')
  const [mode, setMode] = useState<Mode>('multiple_choice')
  const [count, setCount] = useState<5 | 10 | 15 | 20>(10)

  const [cards, setCards] = useState<RawCard[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [timer, setTimer] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [answers, setAnswers] = useState<
    Array<{ correct: boolean; userAnswer: string; correctAnswer: string }>
  >([])

  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(
    null
  )
  const [written, setWritten] = useState('')
  const [awarded, setAwarded] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const current = questions[idx] ?? null
  const total = questions.length
  const progress = total === 0 ? 0 : Math.round(((idx + 1) / total) * 100)

  const deckOptions = useMemo(() => decks, [decks])
  const selectedDeck = useMemo(
    () => deckOptions.find((d) => d.id === deckId) ?? null,
    [deckOptions, deckId]
  )

  const tick = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (step !== 4) return
    if (feedback) return
    if (tick.current) return
    tick.current = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => {
      if (tick.current) clearInterval(tick.current)
      tick.current = null
    }
  }, [step, feedback])

  function resetRun(newQuestions: Question[]) {
    setQuestions(newQuestions)
    setIdx(0)
    setTimer(0)
    setTimes([])
    setAnswers([])
    setFeedback(null)
    setWritten('')
    setAwarded(false)
    setMessage(null)
    setStep(4)
  }

  async function loadCards() {
    const res = await withLoading(fetch(`/api/flashcards/decks/${deckId}/cards`))
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(json?.error ?? 'load_failed')
    const cs = (json?.cards ?? []) as any[]
    setCards(cs.map((c) => ({ id: c.id, front: c.front, back: c.back })))
    return cs.map((c) => ({ id: c.id as string, front: c.front as string, back: c.back as string }))
  }

  function buildQuestions(fromCards: RawCard[]) {
    const picked = pickN(fromCards, count)
    if (mode === 'multiple_choice') {
      return picked.map<Question>((c) => {
        const others = fromCards.filter((o) => o.id !== c.id).map((o) => o.back).filter(Boolean)
        const wrongs = pickN(others, 3)
        const options = shuffle([c.back, ...wrongs]).slice(0, 4)
        const correctIndex = Math.max(0, options.indexOf(c.back))
        return {
          mode: 'multiple_choice',
          prompt: c.front,
          options,
          correctIndex,
          correctText: c.back
        }
      })
    }
    if (mode === 'true_false') {
      return picked.map<Question>((c) => {
        const useTrue = Math.random() > 0.5
        const wrong = pickN(fromCards.filter((o) => o.id !== c.id), 1)[0]
        const statement = useTrue ? c.back : wrong ? wrong.back : c.back
        const isTrue = statement === c.back
        return {
          mode: 'true_false',
          prompt: c.front,
          statement,
          isTrue,
          correctText: c.back
        }
      })
    }
    return picked.map<Question>((c) => ({ mode: 'written', prompt: c.front, answer: c.back }))
  }

  async function startQuiz() {
    if (!deckId) return
    const fromCards = cards.length ? cards : await loadCards()
    if (fromCards.length === 0) return
    const qs = buildQuestions(fromCards)
    resetRun(qs)
  }

  async function finishQuiz(finalAnswers: typeof answers, finalTimes: number[]) {
    setMessage(null)
    const correctCount = finalAnswers.filter((a) => a.correct).length
    const durationSeconds = finalTimes.reduce((acc, n) => acc + n, 0)
    const res = await withLoading(
      fetch('/api/quiz/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: deckId || null,
          mode,
          questionCount: total,
          correctCount,
          durationSeconds
        })
      })
    )
    const json = (await res.json().catch(() => null)) as any
    if (res.ok) {
      const coinsAwarded = Number(json?.coinsAwarded ?? 0)
      if (coinsAwarded > 0) {
        showCoins(coinsAwarded)
        await promptFromResponse(json, 'quiz_finish')
      }
      setAwarded(true)
    } else {
      setMessage('Quiz completed, but results could not be saved. Please try again.')
    }
    setStep(5)
  }

  async function answerCurrent(payload: { correct: boolean; userAnswer: string; correctAnswer: string }) {
    if (!current) return
    if (feedback) return
    setFeedback({ correct: payload.correct, correctAnswer: payload.correctAnswer })
    setAnswers((prev) => [...prev, payload])
    setTimes((prev) => [...prev, timer])
    setTimer(0)
  }

  async function next() {
    setFeedback(null)
    setWritten('')
    if (idx + 1 >= total) {
      const nextAnswers = [...answers]
      const nextTimes = [...times]
      if (nextAnswers.length < total && feedback) {
        nextAnswers.push({
          correct: feedback.correct,
          userAnswer: feedback.correct ? 'Correct' : 'Wrong',
          correctAnswer: feedback.correctAnswer
        })
      }
      if (nextTimes.length < total) nextTimes.push(timer)
      await finishQuiz(nextAnswers.length === total ? nextAnswers : answers, nextTimes.length === total ? nextTimes : times)
      return
    }
    setIdx((i) => i + 1)
  }

  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers])
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)
  const totalTime = useMemo(() => times.reduce((acc, n) => acc + n, 0), [times])

  return (
    <div className="space-y-5">
      {modal}
      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <div className="space-y-3">
              <div className="text-sm text-subtext">Step 1 — Select deck</div>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
              >
                <option value="" disabled>
                  Choose a deck…
                </option>
                {deckOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} — {d.subject}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  disabled={!deckId}
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <div className="text-sm text-subtext">Step 2 — Choose mode</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={mode === 'multiple_choice' ? 'secondary' : 'outline'}
                  onClick={() => setMode('multiple_choice')}
                >
                  Multiple choice
                </Button>
                <Button
                  type="button"
                  variant={mode === 'true_false' ? 'secondary' : 'outline'}
                  onClick={() => setMode('true_false')}
                >
                  True/false
                </Button>
                <Button
                  type="button"
                  variant={mode === 'written' ? 'secondary' : 'outline'}
                  onClick={() => setMode('written')}
                >
                  Written
                </Button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <div className="text-sm text-subtext">Step 3 — Number of questions</div>
              <div className="flex flex-wrap gap-2">
                {([5, 10, 15, 20] as const).map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={count === n ? 'secondary' : 'outline'}
                    onClick={() => setCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void startQuiz()}
                  disabled={!deckId}
                >
                  Start quiz
                </Button>
              </div>
            </div>
          ) : null}

          {step === 4 && current ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-bg/20 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="text-sm text-subtext">
                    {selectedDeck ? `${selectedDeck.title}` : 'Quiz'} • Question {idx + 1} / {total}
                  </div>
                  <div className="rounded-full bg-card/60 px-3 py-1 text-xs font-semibold text-subtext ring-1 ring-border">
                    Timer: {timer}s
                  </div>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-bg/40 ring-1 ring-border">
                  <div className="h-full rounded-full bg-pink" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-6">
                <div className="text-xs text-subtext">Question</div>
                <div className="mt-2 text-base font-semibold text-text sm:text-xl">
                  {current.mode === 'true_false'
                    ? `${current.prompt}`
                    : current.prompt}
                </div>
                {current.mode === 'true_false' ? (
                  <div className="mt-3 rounded-3xl border border-border bg-bg/20 p-4 text-sm text-text">
                    {current.statement}
                  </div>
                ) : null}
              </div>

              {current.mode === 'multiple_choice' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {current.options.map((opt, i) => {
                    const isCorrect = feedback && i === current.correctIndex
                    const isWrong =
                      feedback && !isCorrect && opt === answers[idx]?.userAnswer
                    const cls = feedback
                      ? isCorrect
                        ? 'border-success/40 bg-success/10'
                        : isWrong
                          ? 'border-pink/35 bg-pink/10'
                          : 'border-border bg-bg/20 opacity-70'
                      : 'border-border bg-bg/20 hover:bg-bg/30'
                    return (
                      <button
                        key={`${opt}-${i}`}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() =>
                          void answerCurrent({
                            correct: i === current.correctIndex,
                            userAnswer: opt,
                            correctAnswer: current.correctText
                          })
                        }
                        className={cn(
                          'rounded-2xl border px-4 py-3 text-left text-sm text-text transition',
                          cls
                        )}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {current.mode === 'true_false' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant={feedback ? (current.isTrue ? 'secondary' : 'outline') : 'secondary'}
                    disabled={Boolean(feedback)}
                    onClick={() =>
                      void answerCurrent({
                        correct: current.isTrue,
                        userAnswer: 'True',
                        correctAnswer: current.correctText
                      })
                    }
                  >
                    True
                  </Button>
                  <Button
                    variant={feedback ? (!current.isTrue ? 'secondary' : 'outline') : 'outline'}
                    disabled={Boolean(feedback)}
                    onClick={() =>
                      void answerCurrent({
                        correct: !current.isTrue,
                        userAnswer: 'False',
                        correctAnswer: current.correctText
                      })
                    }
                  >
                    False
                  </Button>
                </div>
              ) : null}

              {current.mode === 'written' ? (
                <div className="space-y-2">
                  <div className="text-sm text-subtext">Type the answer</div>
                  <Input
                    value={written}
                    onChange={(e) => setWritten(e.target.value)}
                    placeholder="Your answer…"
                    disabled={Boolean(feedback)}
                  />
                  <Button
                    variant="secondary"
                    disabled={Boolean(feedback) || !written.trim()}
                    onClick={() => {
                      const correct = normalize(written) === normalize(current.answer)
                      void answerCurrent({
                        correct,
                        userAnswer: written.trim(),
                        correctAnswer: current.answer
                      })
                    }}
                  >
                    Submit
                  </Button>
                </div>
              ) : null}

              {feedback ? (
                <div
                  className={cn(
                    'rounded-3xl border p-4 text-sm',
                    feedback.correct
                      ? 'border-success/40 bg-success/10 text-text'
                      : 'border-pink/35 bg-pink/10 text-text'
                  )}
                >
                  <div className="font-semibold">
                    {feedback.correct ? 'Correct' : 'Wrong'}
                  </div>
                  {!feedback.correct ? (
                    <div className="mt-1 text-subtext">
                      Correct answer: <span className="text-text">{feedback.correctAnswer}</span>
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <Button variant="outline" onClick={() => void next()}>
                      {idx + 1 >= total ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-bg/20 p-4 sm:p-5">
                <div className="font-heading text-2xl text-text sm:text-3xl">{percent}%</div>
                <div className="mt-2 text-sm text-subtext">
                  Score: {score} / {total} • Time: {totalTime}s
                </div>
                <div className="mt-2 text-sm text-subtext">
                  Coins: {awarded ? percent === 100 ? '+25' : '+10' : '—'}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <div className="font-semibold text-text">Wrong questions</div>
                <div className="mt-3 space-y-2">
                  {answers
                    .map((a, i) => ({ ...a, i }))
                    .filter((a) => !a.correct)
                    .slice(0, 20)
                    .map((a) => (
                      <div
                        key={a.i}
                        className="rounded-3xl border border-border bg-bg/20 p-4"
                      >
                        <div className="text-sm font-semibold text-text">
                          Q{a.i + 1}
                        </div>
                        <div className="mt-1 text-sm text-subtext">
                          Correct: <span className="text-text">{a.correctAnswer}</span>
                        </div>
                      </div>
                    ))}
                  {answers.filter((a) => !a.correct).length === 0 ? (
                    <div className="text-sm text-subtext">None. Perfect!</div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const qs = buildQuestions(cards)
                    resetRun(qs)
                  }}
                >
                  Try again
                </Button>
                <Link href="/dashboard/flashcards" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Back to decks
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
