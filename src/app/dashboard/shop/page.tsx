import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { getUserPlan } from '@/lib/data/user'
import { ensureShopCatalog, getOwnedItemIds, getShopItems } from '@/lib/shop/data'
import { ShopTabs } from '@/components/shop/ShopTabs'

export default async function ShopPage() {
  const user = await requireUser()
  await ensureShopCatalog()
  const [profile, plan, items, owned] = await Promise.all([
    getProfile(user.id),
    getUserPlan(user.id),
    getShopItems(),
    getOwnedItemIds(user.id)
  ])

  return (
    <ShopTabs
      items={items}
      ownedIds={[...owned]}
      plan={plan}
      coins={profile?.coins ?? 0}
    />
  )
}
