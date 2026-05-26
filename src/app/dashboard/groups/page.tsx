import { requireUser } from '@/lib/auth/user'
import { GroupsHub } from '@/components/groups/GroupsHub'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { MyGroupCard } from '@/lib/data/groups'

type CookieToSet = {
  name: string
  value: string
  options: Parameters<ReturnType<typeof cookies>['set']>[2]
}

export default async function GroupsPage() {
  const user = await requireUser()
  const admin = getSupabaseAdmin()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = cookies()
  const supabase =
    admin ??
    (url && anon
      ? createServerClient(url, anon, {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(toSet: CookieToSet[]) {
              for (const c of toSet) cookieStore.set(c.name, c.value, c.options)
            }
          }
        })
      : null)

  let groups: MyGroupCard[] = []
  if (supabase) {
    const { data: rows } = await supabase
      .from('group_members')
      .select('group_id,role,study_groups(id,name,subject,join_code,is_private,created_by,created_at)')
      .eq('user_id', user.id)

    const list = (rows ?? []).map((r: any) => ({
      ...(r.study_groups as any),
      role: (r.role as string) ?? 'member'
    })) as Array<any>

    const ids = list.map((g) => g.id as string).filter(Boolean)
    if (ids.length > 0) {
      const { data: memberRows } = await supabase.from('group_members').select('group_id').in('group_id', ids)
      const countByGroup = new Map<string, number>()
      for (const row of (memberRows ?? []) as any[]) {
        const gid = row.group_id as string
        countByGroup.set(gid, (countByGroup.get(gid) ?? 0) + 1)
      }
      groups = list
        .map((g) => ({
          ...(g as any),
          memberCount: countByGroup.get(g.id as string) ?? 1
        }))
        .sort((a, b) => ((a.created_at as string) < (b.created_at as string) ? 1 : -1)) as MyGroupCard[]
    }
  }

  return <GroupsHub initialGroups={groups} />
}
