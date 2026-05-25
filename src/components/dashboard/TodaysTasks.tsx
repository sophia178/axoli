'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'

type Task = { id: string; text: string; done: boolean }

const STORAGE_KEY = 'bloom_tasks'

function randomId() {
  return Math.random().toString(16).slice(2)
}

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Task[]
      setTasks(parsed)
    } catch {
      setTasks([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks])

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-subtext">{remaining} left today</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
          disabled={tasks.every((t) => !t.done)}
        >
          Clear done
        </Button>
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a tiny task (e.g. 10 flashcards)"
        />
        <Button
          variant="secondary"
          onClick={() => {
            const trimmed = text.trim()
            if (!trimmed) return
            setTasks((prev) => [...prev, { id: randomId(), text: trimmed, done: false }])
            setText('')
          }}
        >
          Add
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg/30 px-4 py-3 text-sm text-subtext">
            Add 1–3 tiny tasks and watch your streak get easier.
          </div>
        ) : null}
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() =>
              setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
              )
            }
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-bg/20 px-4 py-3 text-left text-sm transition hover:bg-bg/30',
              task.done && 'opacity-70'
            )}
          >
            <span className={cn('text-text', task.done && 'line-through')}>
              {task.text}
            </span>
            <span className="text-subtext">{task.done ? 'Done' : 'Tap'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

