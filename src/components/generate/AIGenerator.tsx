'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useLoading } from '@/components/loading/LoadingProvider'
import { useCoinToasts } from '@/components/coins/CoinToastProvider'
import { UpgradeButtons } from '@/components/shop/UpgradeButtons'

type GenerateOutput = {
  subject: string
  summary: string
  flashcards: Array<{ front: string; back: string }>
  quiz: Array<{ question: string; options: string[]; correctIndex: number }>
  keyFacts: string[]
}

const subjects = [
  'Biology',
  'Chemistry',
  'Physics',
  'Maths',
  'History',
  'Psychology',
  'English',
  'Geography',
  'Computer Science',
  'Economics',
  'Other'
] as const

function isValidYoutubeUrl(input: string) {
  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return Boolean(url.pathname.replace('/', '').trim())
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.searchParams.get('v')) return true
      if (url.pathname.startsWith('/shorts/')) return true
      return false
    }
    return false
  } catch {
    return false
  }
}

function readFileBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}

function FlashcardCarousel({
  cards,
  onSave
}: {
  cards: Array<{ front: string; back: string }>
  onSave: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = cards[idx]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-subtext">
          Card {idx + 1} of {cards.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIdx((i) => (i - 1 + cards.length) % cards.length)
              setFlipped(false)
            }}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIdx((i) => (i + 1) % cards.length)
              setFlipped(false)
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80) {
            setIdx((i) => (i - 1 + cards.length) % cards.length)
            setFlipped(false)
            return
          }
          if (info.offset.x < -80) {
            setIdx((i) => (i + 1) % cards.length)
            setFlipped(false)
          }
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <motion.button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          className="w-full rounded-3xl border border-border bg-bg/30 p-4 text-left sm:p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-xs text-subtext">{flipped ? 'Back' : 'Front'}</div>
          <div className="mt-2 text-lg font-semibold text-text">
            {flipped ? current.back : current.front}
          </div>
          <div className="mt-4 text-sm text-subtext">
            Tap to {flipped ? 'hide answer' : 'reveal answer'} • Swipe for next
          </div>
        </motion.button>
      </motion.div>

      <Button onClick={onSave}>Save to deck</Button>
    </div>
  )
}

function QuizBlock({ quiz }: { quiz: GenerateOutput['quiz'] }) {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()

  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    Array(quiz.length).fill(null)
  )
  const [awarded, setAwarded] = useState(false)
  const [awarding, setAwarding] = useState(false)

  const score = answers.reduce<number>((acc, a, i) => {
    if (a === null) return acc
    return acc + (a === quiz[i]?.correctIndex ? 1 : 0)
  }, 0)

  const done = answers.every((a) => a !== null)

  useEffect(() => {
    if (!done || awarded || awarding) return
    const amount = score === quiz.length ? 25 : 10
    const reason = score === quiz.length ? 'quiz_perfect' : 'quiz_complete'
    void (async () => {
      setAwarding(true)
      const res = await withLoading(
        fetch('/api/coins/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, reason })
        })
      )
      const json = (await res.json().catch(() => null)) as any
      if (res.ok) {
        showCoins(Number(json?.coinsAwarded ?? amount))
        setAwarded(true)
      }
      setAwarding(false)
    })()
  }, [done, awarded, awarding, score, quiz.length, withLoading, showCoins])

  return (
    <div className="space-y-4">
      {quiz.map((q, i) => {
        const picked = answers[i]
        const correct = q.correctIndex
        return (
          <div key={`${i}-${q.question}`} className="rounded-3xl border border-border bg-bg/20 p-4">
            <div className="text-sm font-semibold text-text">{q.question}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, idx) => {
                const isCorrect = picked !== null && idx === correct
                const isWrongPicked = picked === idx && idx !== correct
                const cls =
                  picked === null
                    ? 'border-border bg-bg/20 hover:bg-bg/30'
                    : isCorrect
                      ? 'border-success/40 bg-success/10'
                      : isWrongPicked
                        ? 'border-pink/35 bg-pink/10'
                        : 'border-border bg-bg/20 opacity-70'

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={picked !== null}
                    onClick={() =>
                      setAnswers((prev) => prev.map((p, pi) => (pi === i ? idx : p)))
                    }
                    className={`rounded-2xl border px-4 py-3 text-left text-sm text-text transition ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {picked !== null ? (
              <div className="mt-3 text-sm">
                {picked === correct ? (
                  <span className="text-success">Correct</span>
                ) : (
                  <span className="text-pink">Not quite</span>
                )}
              </div>
            ) : null}
          </div>
        )
      })}

      <div className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="font-semibold text-text">Score</div>
          <div className="mt-1 text-sm text-subtext">
            {score} / {quiz.length}
          </div>
        </div>
        <Button
          variant="secondary"
          disabled
        >
          {awarded ? 'Quiz coins added' : done ? 'Adding coins…' : 'Answer all questions'}
        </Button>
      </div>
    </div>
  )
}

export function AIGenerator() {
  const { withLoading } = useLoading()
  const { showCoins } = useCoinToasts()

  const [tab, setTab] = useState<'notes' | 'youtube' | 'pdf'>('notes')

  const [notesText, setNotesText] = useState('')
  const [notesSubject, setNotesSubject] = useState<(typeof subjects)[number]>('Biology')

  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfSubject, setPdfSubject] = useState<(typeof subjects)[number]>('Biology')
  const [pdfStage, setPdfStage] = useState<'extracting' | 'generating' | null>(null)

  const [output, setOutput] = useState<GenerateOutput | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [upgrade, setUpgrade] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canGenerateNotes = useMemo(() => notesText.trim().length >= 100, [notesText])
  const canGenerateYoutube = useMemo(() => isValidYoutubeUrl(youtubeUrl.trim()), [youtubeUrl])
  const canGeneratePdf = useMemo(() => Boolean(pdfFile), [pdfFile])

  async function runGenerate(work: () => Promise<void>) {
    if (generating) return
    setGenerating(true)
    setMessage(null)
    setUpgrade(false)
    setOutput(null)
    try {
      await work()
    } catch {
      setMessage((prev) => prev ?? 'Generation failed. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(['notes', 'youtube', 'pdf'] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={tab === t ? 'secondary' : 'outline'}
            onClick={() => {
              setTab(t)
              setMessage(null)
              setUpgrade(false)
              setOutput(null)
              setPdfStage(null)
            }}
          >
            {t === 'notes' ? 'Paste notes' : t === 'youtube' ? 'YouTube URL' : 'PDF upload'}
          </Button>
        ))}
      </div>

      {tab === 'notes' ? (
        <Card>
          <CardHeader>
            <CardTitle>Paste notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-subtext">Subject</div>
                <select
                  value={notesSubject}
                  onChange={(e) => setNotesSubject(e.target.value as any)}
                  className="mt-2 h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <Button
                  variant="secondary"
                  disabled={!canGenerateNotes || generating}
                  onClick={async () => {
                    await runGenerate(async () => {
                      const res = await withLoading(
                        fetch('/api/generate/notes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            text: notesText.trim(),
                            subject: notesSubject
                          })
                        })
                      )
                      const json = (await res.json().catch(() => null)) as any
                      if (!res.ok) {
                        setUpgrade(json?.error === 'ai_limit')
                        setMessage(
                          json?.error === 'ai_limit'
                            ? 'Free limit reached (5/month). Upgrade to keep generating.'
                            : json?.error === 'server_misconfigured'
                              ? 'AI generation is temporarily unavailable. Please try again later.'
                              : json?.error === 'ai_failed' && typeof json?.message === 'string'
                                ? json.message
                            : 'Generation failed. Try again.'
                        )
                        return
                      }
                      const out = json?.output as GenerateOutput
                      setOutput(out)
                      const coinsAwarded = Number(json?.coinsAwarded ?? 0)
                      if (coinsAwarded > 0) showCoins(coinsAwarded)
                      setMessage(
                        typeof json?.remaining === 'number'
                          ? `Generated! ${json.remaining} left this month`
                          : 'Generated!'
                      )
                    })
                  }}
                >
                  <span className="flex items-center gap-2">
                    {generating ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-pink" />
                    ) : null}
                    {generating ? 'Generating…' : 'Generate'}
                  </span>
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-subtext">Paste your notes here...</div>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="mt-2 min-h-[220px] w-full rounded-3xl border border-border bg-bg/40 p-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
                placeholder="Paste your notes here..."
              />
              <div className="mt-2 text-xs text-subtext">
                {notesText.trim().length} / 100 minimum characters
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'youtube' ? (
        <Card>
          <CardHeader>
            <CardTitle>YouTube URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-subtext">YouTube URL</div>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {youtubeUrl.trim() && !canGenerateYoutube ? (
                  <div className="mt-2 text-xs text-pink">Enter a valid YouTube URL.</div>
                ) : null}
              </div>
              <div className="flex items-end justify-end">
                <Button
                  variant="secondary"
                  disabled={!canGenerateYoutube || generating}
                  onClick={async () => {
                    await runGenerate(async () => {
                      const res = await withLoading(
                        fetch('/api/generate/youtube', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: youtubeUrl.trim() })
                        })
                      )
                      const json = (await res.json().catch(() => null)) as any
                      if (!res.ok) {
                        setUpgrade(json?.error === 'ai_limit')
                        setMessage(
                          json?.error === 'ai_limit'
                            ? 'Free limit reached (5/month). Upgrade to keep generating.'
                            : json?.error === 'server_misconfigured'
                              ? 'AI generation is temporarily unavailable. Please try again later.'
                              : json?.error === 'ai_failed' && typeof json?.message === 'string'
                                ? json.message
                            : json?.error === 'no_transcript'
                              ? 'No transcript found for this video.'
                              : 'Generation failed. Try again.'
                        )
                        return
                      }
                      const out = json?.output as GenerateOutput
                      setOutput(out)
                      const coinsAwarded = Number(json?.coinsAwarded ?? 0)
                      if (coinsAwarded > 0) showCoins(coinsAwarded)
                      setMessage(
                        typeof json?.remaining === 'number'
                          ? `Generated! ${json.remaining} left this month`
                          : 'Generated!'
                      )
                    })
                  }}
                >
                  <span className="flex items-center gap-2">
                    {generating ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-pink" />
                    ) : null}
                    {generating ? 'Generating…' : 'Generate'}
                  </span>
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-bg/20 p-4 text-sm text-subtext">
              Subject is auto-detected from the video title.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'pdf' ? (
        <Card>
          <CardHeader>
            <CardTitle>PDF upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-subtext">Subject</div>
                <select
                  value={pdfSubject}
                  onChange={(e) => setPdfSubject(e.target.value as any)}
                  className="mt-2 h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-sm text-text outline-none focus:border-pink/60 focus:ring-2 focus:ring-pink/20"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <Button
                  variant="secondary"
                  disabled={!canGeneratePdf || generating}
                  onClick={async () => {
                    if (!pdfFile) return
                    await runGenerate(async () => {
                      const stageTimer = window.setTimeout(() => setPdfStage('generating'), 6500)
                      const abort = new AbortController()
                      const abortTimer = window.setTimeout(() => abort.abort(), 60_000)
                      try {
                        setPdfStage('extracting')
                        const base64 = await readFileBase64(pdfFile)
                        const res = await withLoading(
                          fetch('/api/generate/pdf', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            signal: abort.signal,
                            body: JSON.stringify({
                              base64,
                              filename: pdfFile.name,
                              subject: pdfSubject
                            })
                          })
                        )
                        const json = (await res.json().catch(() => null)) as any
                        if (!res.ok) {
                          setUpgrade(json?.error === 'ai_limit')
                          setMessage(
                            json?.error === 'timeout' && typeof json?.message === 'string'
                              ? json.message
                              : json?.error === 'ai_limit'
                                ? 'Free limit reached (5/month). Upgrade to keep generating.'
                                : json?.error === 'server_misconfigured'
                                  ? 'AI generation is temporarily unavailable. Please try again later.'
                                  : json?.error === 'ai_failed' && typeof json?.message === 'string'
                                    ? json.message
                                  : json?.error === 'no_text'
                                    ? 'Could not extract text from this PDF.'
                                    : 'Generation failed. Try again.'
                          )
                          return
                        }
                        const out = json?.output as GenerateOutput
                        setOutput(out)
                        const coinsAwarded = Number(json?.coinsAwarded ?? 0)
                        if (coinsAwarded > 0) showCoins(coinsAwarded)
                        setMessage(
                          typeof json?.remaining === 'number'
                            ? `Generated! ${json.remaining} left this month`
                            : 'Generated!'
                        )
                      } catch (e) {
                        if (e instanceof DOMException && e.name === 'AbortError') {
                          setMessage('PDF processing timed out after 60 seconds. Try a smaller PDF and try again.')
                          return
                        }
                        throw e
                      } finally {
                        window.clearTimeout(stageTimer)
                        window.clearTimeout(abortTimer)
                        setPdfStage(null)
                      }
                    })
                  }}
                >
                  <span className="flex items-center gap-2">
                    {generating ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-pink" />
                    ) : null}
                    {generating
                      ? pdfStage === 'extracting'
                        ? 'Extracting PDF content…'
                        : pdfStage === 'generating'
                          ? 'Generating flashcards…'
                          : 'Generating…'
                      : 'Generate'}
                  </span>
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                if (file && file.type !== 'application/pdf') return
                setPdfFile(file)
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0] ?? null
                if (!file) return
                if (file.type !== 'application/pdf') {
                  setMessage('PDF only.')
                  return
                }
                setPdfFile(file)
              }}
              className="rounded-3xl border border-border bg-bg/20 p-4 text-center sm:p-6"
            >
              <div className="font-semibold text-text">Drag and drop a PDF</div>
              <div className="mt-1 text-sm text-subtext">PDF only</div>
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
              </div>
              {pdfFile ? (
                <div className="mt-4 text-sm text-text">Uploaded: {pdfFile.name}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-text">
          {message}
        </div>
      ) : null}

      {upgrade ? (
        <div className="rounded-3xl border border-pink/25 bg-pink/10 p-5">
          <div className="font-heading text-2xl text-text">Upgrade for more AI</div>
          <div className="mt-2 text-sm text-subtext">
            Free includes 5 generations per month. Premium boosts your limits.
          </div>
          <div className="mt-4">
            <UpgradeButtons />
          </div>
        </div>
      ) : null}

      {output ? (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed text-subtext">{output.summary}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <FlashcardCarousel
                cards={output.flashcards}
                onSave={async () => {
                  if (!output) return
                  setSaving(true)
                  try {
                    const deckTitle = `Generated - ${output.subject}`
                    const res = await withLoading(
                      fetch('/api/flashcards/decks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: deckTitle,
                          subject: output.subject,
                          cards: output.flashcards
                        })
                      })
                    )
                    const json = (await res.json().catch(() => null)) as any
                    if (res.ok && json?.deckId) {
                      window.location.href = `/dashboard/quiz?deck=${json.deckId}`
                    } else {
                      setMessage('Could not save deck.')
                    }
                  } catch {
                    setMessage('Could not save deck.')
                  } finally {
                    setSaving(false)
                  }
                }}
              />
              {saving ? (
                <div className="mt-3 text-sm text-subtext">Saving…</div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <QuizBlock quiz={output.quiz} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key facts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {output.keyFacts.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <span className="text-gold">•</span>
                    <span className="text-gold">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
