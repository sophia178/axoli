import type { ReactNode } from 'react'
import { requireUser } from '@/lib/auth/user'
import { getProfile } from '@/lib/data/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { DashboardProviders } from '@/components/dashboard/DashboardProviders'
import { AdBanner } from '@/components/ads/AdBanner'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const logoSrc = '/logo.png'

  return (
    <DashboardProviders>
      <div className="min-h-screen">
        <TopBar profile={profile} logoSrc={logoSrc} />
        <div className="flex [[dir=rtl]_&]:flex-row-reverse">
          <Sidebar logoSrc={logoSrc} />
          <main className="w-full">
            <div className="mx-auto max-w-6xl px-4 py-6 lg:max-w-none">
              <MobileNav />
              <div className="mt-4">{children}</div>
              <div className="mt-8">
                <AdBanner />
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardProviders>
  )
}
