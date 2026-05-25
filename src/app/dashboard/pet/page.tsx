import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { getUserPlan } from '@/lib/data/user'
import { ensureShopCatalog, getOwnedItemIds, getShopItems } from '@/lib/shop/data'
import { PetRoom } from '@/components/pet/PetRoom'

export default async function PetRoomPage() {
  const user = await requireUser()
  await ensureShopCatalog()
  const [profile, plan, items, owned] = await Promise.all([
    getProfile(user.id),
    getUserPlan(user.id),
    getShopItems(),
    getOwnedItemIds(user.id)
  ])

  if (!profile) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-subtext">
        Could not load your pet profile.
      </div>
    )
  }

  return <PetRoom profile={profile} items={items} ownedIds={[...owned]} plan={plan} />
}
