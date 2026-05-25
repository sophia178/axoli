import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { logoutAction } from '@/app/actions/auth'
import type { Profile } from '@/lib/data/profile'
import { Button } from '@/components/ui/Button'

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num))
}

export async function TopBar({ profile }: { profile: Profile | null }) {
  const t = await getTranslations('dashboardTopbar')
  const tCommon = await getTranslations('common')
  const coins = profile?.coins ?? 0
  const streak = profile?.streak ?? 0
  const happiness = clamp(profile?.pet_happiness ?? 70, 0, 100)
  const level = profile?.pet_level ?? 1

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:max-w-none">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pet"
            className="group flex items-center gap-3 rounded-3xl border border-border bg-card/70 px-4 py-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-pink/20 ring-1 ring-pink/30">
              <div className="absolute inset-0 flex items-center justify-center text-lg">
                🫧
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-base text-text">{t('petName')}</span>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  {t('level', { level })}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-bg/50 ring-1 ring-border">
                  <div
                    className="h-full rounded-full bg-pink"
                    style={{ width: `${happiness}%` }}
                  />
                </div>
                <span className="text-xs text-subtext">{happiness}%</span>
              </div>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-3xl border border-border bg-card/60 px-4 py-3">
              <div className="text-xs text-subtext">{t('coins')}</div>
              <div className="font-heading text-xl text-text">{coins}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 px-4 py-3">
              <div className="text-xs text-subtext">{t('streak')}</div>
              <div className="font-heading text-xl text-text">{streak}🔥</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/timer" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              {t('quickTimer')}
            </Button>
          </Link>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit">
              {tCommon('buttons.logout')}
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
