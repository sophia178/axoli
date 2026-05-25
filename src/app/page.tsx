import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { AxolotlHero } from '@/components/AxolotlHero'
import { MarketingHeader } from '@/components/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

function FeatureIcon({ label }: { label: string }) {
  const common = 'h-10 w-10 rounded-2xl flex items-center justify-center'
  if (label === 'AI') {
    return (
      <div className={`${common} bg-pink/15 ring-1 ring-pink/30`}>
        <span className="text-xl">✨</span>
      </div>
    )
  }
  if (label === 'Pet') {
    return (
      <div className={`${common} bg-gold/10 ring-1 ring-gold/30`}>
        <span className="text-xl">🫧</span>
      </div>
    )
  }
  return (
    <div className={`${common} bg-card ring-1 ring-border`}>
      <span className="text-xl">🏆</span>
    </div>
  )
}

export default async function HomePage() {
  const tLanding = await getTranslations('landing')
  const tCommon = await getTranslations('common')
  const freeBullets = (tLanding.raw('pricing.freeBullets') as unknown as string[]) ?? []
  const premiumBullets =
    (tLanding.raw('pricing.premiumBullets') as unknown as string[]) ?? []
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-subtext">
              <span className="h-2 w-2 rounded-full bg-success" />
              {tLanding('badgeNew')}
            </div>
            <h1 className="mt-5 font-heading text-4xl leading-tight text-text md:text-5xl">
              {tLanding('headline')}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-subtext md:text-lg">
              {tLanding('subheadline')}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  {tCommon('buttons.startForFree')}
                </Button>
              </Link>
              <Link href="#how" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {tCommon('buttons.seeHowItWorks')}
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-3 text-sm text-subtext">
              <span className="rounded-full bg-pink/15 px-3 py-1 text-pink">
                {tLanding('tags.freeToStart')}
              </span>
              <span className="rounded-full bg-card/70 px-3 py-1">
                {tLanding('tags.cuteRewards')}
              </span>
              <span className="rounded-full bg-card/70 px-3 py-1">
                {tLanding('tags.focusBoosts')}
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[48px] bg-[radial-gradient(ellipse_at_center,rgba(255,143,171,0.32),transparent_62%)] blur-2xl" />
            <AxolotlHero className="w-full" />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card/60 px-6 py-5 sm:flex-row sm:items-center">
            <div className="text-sm text-subtext">
              <span className="font-semibold text-text">
                {tLanding('socialProof.join')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="-space-x-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-pink/20 ring-2 ring-bg" />
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-gold/20 ring-2 ring-bg" />
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[#7AE7B9]/20 ring-2 ring-bg" />
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[#B9A8FF]/20 ring-2 ring-bg" />
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[#6EC7FF]/20 ring-2 ring-bg" />
              </div>
              <div className="text-sm text-subtext">
                <span className="font-semibold text-text">
                  ★★★★★
                </span>{' '}
                {tLanding('socialProof.loved')}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="AI" />
              <CardTitle>{tLanding('features.aiTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              {tLanding('features.aiBody')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="Pet" />
              <CardTitle>{tLanding('features.petTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              {tLanding('features.petBody')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="Groups" />
              <CardTitle>{tLanding('features.groupsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              {tLanding('features.groupsBody')}
            </CardContent>
          </Card>
        </section>

        <section id="how" className="mt-16">
          <div className="mb-6">
            <h2 className="font-heading text-3xl text-text">
              {tLanding('how.title')}
            </h2>
            <p className="mt-2 text-sm text-subtext">
              {tLanding('how.subtitle')}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{tLanding('how.step1Title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                {tLanding('how.step1Body')}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tLanding('how.step2Title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                {tLanding('how.step2Body')}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tLanding('how.step3Title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                {tLanding('how.step3Body')}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl text-text">
                {tLanding('pricing.title')}
              </h2>
              <p className="mt-2 text-sm text-subtext">
                {tLanding('pricing.subtitle')}
              </p>
            </div>
            <Link
              href="/pricing"
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-text ring-1 ring-border hover:bg-card/60 sm:inline-block"
            >
              {tLanding('pricing.fullDetails')}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{tLanding('pricing.freeTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-4xl text-text">
                    {tLanding('pricing.freePrice')}
                  </div>
                  <div className="text-sm text-subtext">
                    {tLanding('pricing.freePeriod')}
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-subtext">
                  {freeBullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button variant="outline" className="w-full">
                    {tCommon('buttons.getStarted')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden ring-1 ring-gold/45">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-2xl" />
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{tLanding('pricing.premiumTitle')}</CardTitle>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/30">
                    {tLanding('pricing.mostPopular')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-4xl text-text">
                    {tLanding('pricing.premiumPrice')}
                  </div>
                  <div className="text-sm text-subtext">
                    {tLanding('pricing.premiumPeriod')}
                  </div>
                </div>
                <div className="mt-2 text-sm text-subtext">
                  {tLanding('pricing.annualNote')}
                </div>
                <ul className="mt-5 space-y-2 text-sm text-subtext">
                  {premiumBullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link href="/pricing" className="mt-6 block">
                  <Button className="w-full">{tCommon('buttons.upgrade')}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-pink/15 blur-2xl" />
            <h2 className="max-w-2xl font-heading text-3xl text-text md:text-4xl">
              {tLanding('finalCta.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-subtext">
              {tLanding('finalCta.subtitle')}
            </p>
            <div className="mt-7">
              <Link href="/signup">
                <Button size="lg">{tCommon('buttons.getStartedFree')}</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-subtext">
          {tCommon('appName')} © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
