import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type StudyGroup = {
  id: string
  name: string
  subject: string
  join_code: string
  is_private?: boolean
  created_by?: string
  created_at: string
}

export async function getMyGroups(userId: string): Promise<StudyGroup[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data } = await supabase
    .from('group_members')
    .select('study_groups(id,name,subject,join_code,created_at)')
    .eq('user_id', userId)

  const groups = (data ?? [])
    .map((row: any) => row.study_groups)
    .filter(Boolean) as StudyGroup[]

  return groups.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export type MyGroupCard = StudyGroup & {
  memberCount: number
  role: string
}

export async function getMyGroupsWithMeta(userId: string): Promise<MyGroupCard[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data: rows } = await supabase
    .from('group_members')
    .select('group_id,role,study_groups(id,name,subject,join_code,is_private,created_by,created_at)')
    .eq('user_id', userId)

  const groups = (rows ?? []).map((r: any) => ({
    ...(r.study_groups as any),
    role: (r.role as string) ?? 'member'
  })) as Array<StudyGroup & { role: string }>

  const ids = groups.map((g) => g.id)
  if (ids.length === 0) return []

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id')
    .in('group_id', ids)

  const countByGroup = new Map<string, number>()
  for (const row of (memberRows ?? []) as any[]) {
    const gid = row.group_id as string
    countByGroup.set(gid, (countByGroup.get(gid) ?? 0) + 1)
  }

  return groups
    .map((g) => ({
      ...(g as any),
      memberCount: countByGroup.get(g.id) ?? 1
    }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export type GroupMemberCard = {
  user_id: string
  username: string | null
  coins: number
  streak: number
  role: string
}

export async function getGroupDetail(userId: string, groupId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!membership) return null

  const { data: group } = await supabase
    .from('study_groups')
    .select('id,name,subject,join_code,is_private,created_by,created_at')
    .eq('id', groupId)
    .maybeSingle()

  if (!group) return null

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('user_id,role')
    .eq('group_id', groupId)

  const memberIds = (memberRows ?? []).map((m: any) => m.user_id as string)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id,username,coins,streak')
    .in('user_id', memberIds)

  const profileById = new Map<string, any>()
  for (const p of (profiles ?? []) as any[]) profileById.set(p.user_id as string, p)

  const members: GroupMemberCard[] = (memberRows ?? []).map((m: any) => {
    const p = profileById.get(m.user_id as string)
    return {
      user_id: m.user_id as string,
      username: (p?.username as string | null) ?? null,
      coins: (p?.coins as number) ?? 0,
      streak: (p?.streak as number) ?? 0,
      role: (m.role as string) ?? 'member'
    }
  })

  return {
    group: group as any,
    role: (membership.role as string) ?? 'member',
    members
  }
}
