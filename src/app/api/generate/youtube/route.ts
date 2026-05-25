import { NextResponse } from 'next/server'
import { z } from 'zod'
import { YoutubeTranscript } from 'youtube-transcript'
import { getCurrentUser } from '@/lib/auth/user'
import { getUserPlan } from '@/lib/data/user'
import { consumeGeneration } from '@/lib/ai/usage'
import { generateWithClaude } from '@/lib/ai/claude'

export const runtime = 'nodejs'

const bodySchema = z.object({
  url: z.string().min(5).max(500)
})

function parseYoutubeId(raw: string) {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  if (host === 'youtu.be') {
    const id = url.pathname.replace('/', '').trim()
    return id.length >= 6 ? id : null
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = url.searchParams.get('v')
    if (v) return v
    const parts = url.pathname.split('/').filter(Boolean)
    const maybe = parts[0] === 'watch' ? null : parts[1] ?? parts[0]
    if (parts[0] === 'shorts' && parts[1]) return parts[1]
    return maybe && maybe.length >= 6 ? maybe : null
  }
  return null
}

async function fetchTitle(videoId: string) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return null
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(
      key
    )}`,
    { cache: 'no-store' }
  )
  const json = (await res.json().catch(() => null)) as any
  const title = json?.items?.[0]?.snippet?.title
  return typeof title === 'string' ? title : null
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const videoId = parseYoutubeId(parsed.data.url)
  if (!videoId) return NextResponse.json({ error: 'invalid_youtube_url' }, { status: 400 })

  const plan = await getUserPlan(user.id)
  const usage = await consumeGeneration(user.id, plan)
  if (!usage.ok) return NextResponse.json({ error: 'ai_limit', upgrade: true }, { status: 402 })

  const [title, transcript] = await Promise.all([
    fetchTitle(videoId),
    YoutubeTranscript.fetchTranscript(videoId).catch(() => null)
  ])

  if (!transcript || transcript.length === 0) {
    return NextResponse.json({ error: 'no_transcript' }, { status: 502 })
  }

  const text = transcript.map((t: any) => t.text).filter(Boolean).join(' ')
  const subjectHint = title ?? 'YouTube'

  const result = await generateWithClaude({
    subjectHint,
    content: `YouTube title: ${title ?? ''}\nTranscript:\n${text}`
  })

  if (!result.parsed) {
    return NextResponse.json({ error: 'bad_model_output', raw: result.raw }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    remaining: usage.remaining,
    coinsAwarded: usage.coinsAwarded,
    detectedSubject: title ?? result.parsed.subject,
    output: { ...result.parsed, subject: title ?? result.parsed.subject }
  })
}

