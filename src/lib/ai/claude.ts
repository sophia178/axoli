export type GenerateOutput = {
  subject: string
  summary: string
  flashcards: Array<{ front: string; back: string }>
  quiz: Array<{ question: string; options: string[]; correctIndex: number }>
  keyFacts: string[]
}

function isValidOutput(obj: any): obj is GenerateOutput {
  if (!obj || typeof obj !== 'object') return false
  if (typeof obj.subject !== 'string' || obj.subject.trim().length === 0) return false
  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) return false
  if (!Array.isArray(obj.flashcards) || obj.flashcards.length === 0) return false
  if (!Array.isArray(obj.quiz) || obj.quiz.length === 0) return false
  if (!Array.isArray(obj.keyFacts) || obj.keyFacts.length === 0) return false

  for (const c of obj.flashcards) {
    if (!c || typeof c.front !== 'string' || typeof c.back !== 'string') return false
  }
  for (const q of obj.quiz) {
    if (!q || typeof q.question !== 'string') return false
    if (!Array.isArray(q.options) || q.options.length !== 4) return false
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) return false
  }
  for (const k of obj.keyFacts) {
    if (typeof k !== 'string') return false
  }
  return true
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const slice = text.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    return null
  }
}

export async function generateWithClaude(input: {
  subjectHint?: string
  content: string
}) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) throw new Error('Missing ANTHROPIC_API_KEY')

  const prompt = `You are Axoli, a friendly study assistant. Produce STRICT JSON (no markdown, no code fences).

Return an object with:
- subject: short string (use the subjectHint if provided, otherwise infer)
- summary: 1 clean paragraph (max 900 chars)
- flashcards: array of 12 items, each { "front": "...", "back": "..." }
- quiz: array of 5 items, each { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0-3 }
- keyFacts: array of 5 to 10 short bullet strings

Constraints:
- Keep flashcard front <= 140 chars, back <= 280 chars.
- Quiz options must be plausible and unique.
- Key facts must be factual and derived from content.

subjectHint: ${input.subjectHint ?? ''}
content:
${input.content}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = (await res.json().catch(() => null)) as any
  if (!res.ok) {
    const msg =
      (data as any)?.error?.message ||
      (data as any)?.message ||
      `Anthropic request failed (${res.status})`
    throw new Error(msg)
  }

  const text = Array.isArray(data?.content)
    ? data.content.map((c: any) => c?.text).filter(Boolean).join('\n')
    : ''

  const parsed = extractJsonObject(text)
  return { raw: text, parsed: isValidOutput(parsed) ? (parsed as GenerateOutput) : null }
}
