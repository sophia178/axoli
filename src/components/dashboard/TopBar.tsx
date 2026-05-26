import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import type { Profile } from '@/lib/data/profile'
import { Button } from '@/components/ui/Button'

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num))
}

export function TopBar({
  profile,
  logoSrc = '/logo.png'
}: {
  profile: Profile | null
  logoSrc?: string
}) {
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
            <img
              src={logoSrc}
              alt="Axoli"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-base text-text">Axolotl</span>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  Lv {level}
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
              <div className="text-xs text-subtext">Coins</div>
              <div className="font-heading text-xl text-text">{coins}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 px-4 py-3">
              <div className="text-xs text-subtext">Streak</div>
              <div className="font-heading text-xl text-text">{streak}🔥</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/timer" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              Quick timer
            </Button>
          </Link>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
