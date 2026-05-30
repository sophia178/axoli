import { requireUser } from '@/lib/auth/user'
import { getProfile, type Profile } from '@/lib/data/profile'
import { getUserPlan } from '@/lib/data/user'
import { ensureShopCatalog, getOwnedItemIds, getShopItems } from '@/lib/shop/data'
import { PetRoom } from '@/components/pet/PetRoom'

export const revalidate = 30

export default async function PetRoomPage() {
  const user = await requireUser()
  let profile: Awaited<ReturnType<typeof getProfile>> = null
  let plan = 'free'
  let items: Awaited<ReturnType<typeof getShopItems>> = []
  let owned: Awaited<ReturnType<typeof getOwnedItemIds>> = new Set<string>()

  try {
    await ensureShopCatalog()
    ;[profile, plan, items, owned] = await Promise.all([
      getProfile(user.id),
      getUserPlan(user.id),
      getShopItems(),
      getOwnedItemIds(user.id)
    ])
  } catch {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-subtext sm:p-6">
        Loading your pet…
      </div>
    )
  }

  const effectiveProfile: Profile =
    profile ??
    ({
      id: 'missing',
      user_id: user.id,
      username: null,
      coins: 0,
      streak: 0,
      xp: 0,
      last_study_date: null,
      last_login_date: null,
      pet_happiness: 100,
      pet_last_updated: null,
      hunger_level: 100,
      last_fed_at: null,
      pet_level: 1,
      pet_colour: 'pink',
      pet_accessories: []
    } satisfies Profile)

  return (
    <div className="space-y-4">
      {!profile ? (
        <div className="rounded-3xl border border-border bg-card/60 p-4 text-sm text-subtext">
          We couldn&apos;t load your pet data yet. Showing safe defaults.
        </div>
      ) : null}
      <PetRoom
        profile={effectiveProfile}
        items={items}
        ownedIds={[...owned]}
        plan={plan}
      />
    </div>
  )
}
