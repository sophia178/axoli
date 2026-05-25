import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { getUserPlan } from '@/lib/data/user'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const user = await requireUser()
  const [profile, plan] = await Promise.all([getProfile(user.id), getUserPlan(user.id)])

  const initialTab = typeof searchParams?.tab === 'string' ? searchParams.tab : null
  const checkout = typeof searchParams?.checkout === 'string' ? searchParams.checkout : null

  return (
    <SettingsTabs
      email={user.email ?? ''}
      initialProfile={profile}
      initialPlan={plan}
      initialTab={initialTab}
      checkout={checkout}
    />
  )
}
