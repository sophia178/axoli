'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoading } from '@/components/loading/LoadingProvider'

export function ExamManager() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { withLoading } = useLoading()

  return (
    <div className="rounded-3xl border border-border bg-bg/20 p-4">
      <div className="font-semibold text-text">Add an exam</div>
      <div className="mt-1 text-sm text-subtext">
        Bloom will keep a countdown on your dashboard.
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Exam name" />
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <div className="rounded-2xl border border-border bg-card/60 px-4 py-2 text-sm text-text">
            {message}
          </div>
        ) : (
          <div className="text-sm text-subtext">Keep it cute, keep it simple.</div>
        )}
        <Button
          variant="secondary"
          disabled={!name.trim() || !subject.trim() || !examDate || loading}
          onClick={async () => {
            setLoading(true)
            setMessage(null)
            const res = await withLoading(
              fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: name.trim(),
                  subject: subject.trim(),
                  examDate
                })
              })
            )
            if (!res.ok) {
              setMessage('Could not add exam.')
              setLoading(false)
              return
            }
            setName('')
            setSubject('')
            setExamDate('')
            setMessage('Added!')
            router.refresh()
            setLoading(false)
          }}
        >
          Add exam
        </Button>
      </div>
    </div>
  )
}
