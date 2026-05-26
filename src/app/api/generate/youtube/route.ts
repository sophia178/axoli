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

async function fetchOembed(videoUrl: string) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
    { cache: 'no-store' }
  ).catch(() => null)
  if (!res || !res.ok) return null
  const json = (await res.json().catch(() => null)) as any
  const title = typeof json?.title === 'string' ? (json.title as string) : null
  const authorName = typeof json?.author_name === 'string' ? (json.author_name as string) : null
  return { title, authorName }
}

async function fetchDescriptionFromWatchPage(videoUrl: string) {
  const res = await fetch(videoUrl, { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return null
  const html = await res.text().catch(() => '')
  if (!html) return null

  const og =
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)?.[1] ??
    null
  if (og) return og

  const nameDesc =
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)?.[1] ?? null
  return nameDesc
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const videoId = parseYoutubeId(parsed.data.url)
  if (!videoId) return NextResponse.json({ error: 'invalid_youtube_url' }, { status: 400 })
  const canonicalUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`

  const plan = await getUserPlan(user.id)
  const usage = await consumeGeneration(user.id, plan)
  if (!usage.ok) {
    if ((usage as any).error === 'missing_supabase_admin') {
      return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
    }
    return NextResponse.json({ error: 'ai_limit', upgrade: true }, { status: 402 })
  }

  const [oembed, transcriptFromUrl, transcriptFromId] = await Promise.all([
    fetchOembed(canonicalUrl),
    YoutubeTranscript.fetchTranscript(parsed.data.url).catch(() => null),
    YoutubeTranscript.fetchTranscript(videoId).catch(() => null)
  ])

  const title = oembed?.title ?? null
  const transcript =
    (Array.isArray(transcriptFromUrl) && transcriptFromUrl.length > 0 ? transcriptFromUrl : null) ??
    (Array.isArray(transcriptFromId) && transcriptFromId.length > 0 ? transcriptFromId : null)
  const transcriptText = transcript ? transcript.map((t: any) => t?.text).filter(Boolean).join(' ') : ''

  let sourceNote = ''
  let content = ''
  if (transcriptText.trim()) {
    content = `YouTube title: ${title ?? ''}\nTranscript:\n${transcriptText}`
  } else {
    const [description, fallbackOembed] = await Promise.all([
      fetchDescriptionFromWatchPage(canonicalUrl),
      oembed ? Promise.resolve(oembed) : fetchOembed(canonicalUrl)
    ])
    sourceNote = 'Generated from video description — transcript unavailable.'
    content = `YouTube title: ${fallbackOembed?.title ?? ''}\nVideo description:\n${description ?? ''}\n\nNOTE: ${sourceNote}`
  }

  const subjectHint = title ?? 'YouTube'

  let result: Awaited<ReturnType<typeof generateWithClaude>>
  try {
    result = await generateWithClaude({
      subjectHint,
      content
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed'
    return NextResponse.json({ error: 'ai_failed', message }, { status: 502 })
  }

  if (!result.parsed) {
    return NextResponse.json({ error: 'bad_model_output', raw: result.raw }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    remaining: usage.remaining,
    coinsAwarded: usage.coinsAwarded,
    detectedSubject: title ?? result.parsed.subject,
    output: {
      ...result.parsed,
      subject: title ?? result.parsed.subject,
      summary: sourceNote ? `${sourceNote}\n\n${result.parsed.summary}` : result.parsed.summary
    }
  })
}
