import { requireUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getDecks } from '@/lib/data/flashcards'
import { getGroupDetail } from '@/lib/data/groups'
import { GroupRoom } from '@/components/groups/GroupRoom'

function weekStartISO(d = new Date()) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day + 6) % 7
  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const user = await requireUser()
  const detail = await getGroupDetail(user.id, params.groupId)
  if (!detail) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
        Group not found.
      </div>
    )
  }

  const supabase = getSupabaseAdmin()
  const myDecks = await getDecks(user.id)

  const { data: sharedRows } = await supabase
    .from('group_decks')
    .select('deck_id,created_at')
    .eq('group_id', params.groupId)
    .order('created_at', { ascending: false })
    .limit(50)

  const sharedDeckIds = Array.from(
    new Set((sharedRows ?? []).map((r: any) => r.deck_id as string))
  )

  const { data: sharedDecks } =
    sharedDeckIds.length > 0
      ? await supabase
          .from('flashcard_decks')
          .select('id,user_id,title,subject,is_public,created_at')
          .in('id', sharedDeckIds)
      : { data: [] as any[] }

  const { data: sharedCards } =
    sharedDeckIds.length > 0
      ? await supabase.from('flashcards').select('deck_id').in('deck_id', sharedDeckIds)
      : { data: [] as any[] }

  const countByDeck = new Map<string, number>()
  for (const row of (sharedCards ?? []) as any[]) {
    const did = row.deck_id as string
    countByDeck.set(did, (countByDeck.get(did) ?? 0) + 1)
  }

  const sharedUserIds = Array.from(new Set((sharedDecks ?? []).map((d: any) => d.user_id as string)))
  const { data: profileRows } =
    sharedUserIds.length > 0
      ? await supabase.from('profiles').select('user_id,username').in('user_id', sharedUserIds)
      : { data: [] as any[] }

  const usernameByUser = new Map<string, string | null>()
  for (const r of (profileRows ?? []) as any[]) usernameByUser.set(r.user_id as string, (r.username as string | null) ?? null)

  const sharedDeckCards = (sharedDecks ?? []).map((d: any) => ({
    id: d.id as string,
    title: d.title as string,
    subject: d.subject as string,
    user_id: d.user_id as string,
    cardCount: countByDeck.get(d.id as string) ?? 0,
    creatorUsername: usernameByUser.get(d.user_id as string) ?? null
  }))

  const memberIds = detail.members.map((m) => m.user_id)
  const start = weekStartISO()
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('user_id,duration')
    .in('user_id', memberIds)
    .gte('created_at', start)
    .limit(5000)

  const secondsByUser = new Map<string, number>()
  for (const s of (sessions ?? []) as any[]) {
    const uid = s.user_id as string
    secondsByUser.set(uid, (secondsByUser.get(uid) ?? 0) + (s.duration as number))
  }

  const leaderboard = detail.members
    .map((m) => ({
      user_id: m.user_id,
      username: m.username,
      hours: Math.round(((secondsByUser.get(m.user_id) ?? 0) / 3600) * 10) / 10,
      streak: m.streak,
      coins: m.coins
    }))
    .sort((a, b) => b.hours - a.hours)

  const { data: messagesDesc } = await supabase
    .from('group_chat_messages')
    .select('id,group_id,user_id,message,created_at')
    .eq('group_id', params.groupId)
    .order('created_at', { ascending: false })
    .limit(40)

  const messages = [...(messagesDesc ?? [])].reverse()
  const memberUsernameById = new Map<string, string>()
  for (const m of detail.members) {
    if (m.username) memberUsernameById.set(m.user_id, m.username)
  }

  return (
    <GroupRoom
      currentUserId={user.id}
      currentUsername={detail.members.find((m) => m.user_id === user.id)?.username ?? null}
      group={detail.group}
      role={detail.role}
      members={detail.members}
      myDecks={myDecks.map((d) => ({ id: d.id, title: d.title, subject: d.subject }))}
      sharedDecks={sharedDeckCards}
      leaderboard={leaderboard}
      initialMessages={messages.map((m: any) => ({
        id: m.id as string,
        user_id: m.user_id as string,
        message: m.message as string,
        created_at: m.created_at as string,
        username: memberUsernameById.get(m.user_id as string) ?? null
      }))}
    />
  )
}
