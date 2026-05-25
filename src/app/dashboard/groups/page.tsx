import { requireUser } from '@/lib/auth/user'
import { getMyGroupsWithMeta } from '@/lib/data/groups'
import { GroupsHub } from '@/components/groups/GroupsHub'

export default async function GroupsPage() {
  const user = await requireUser()
  const groups = await getMyGroupsWithMeta(user.id)

  return <GroupsHub initialGroups={groups} />
}
