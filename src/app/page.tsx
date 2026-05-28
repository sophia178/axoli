import Link from 'next/link'
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
  if (label === 'Progress') {
    return (
      <div className={`${common} bg-card ring-1 ring-border`}>
        <span className="text-xl">📈</span>
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
  const freeBullets = [
    'Flashcards + quizzes + timer',
    'Study pet progression',
    'Limited monthly AI generations'
  ]
  const premiumBullets = ['More AI generations', 'Premium shop items', 'Group leaderboards']
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Axoli',
            url: 'https://axoli.online',
            description:
              'Turn notes, YouTube videos or PDFs into flashcards in seconds. Grow your pet axolotl by studying.',
            applicationCategory: 'EducationApplication'
          })
        }}
      />
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <section className="grid items-center gap-6 sm:gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-subtext">
              <span className="h-2 w-2 rounded-full bg-success" />
              New: AI flashcards + study pet in one place
            </div>
            <h1 className="mt-5 font-heading text-2xl leading-tight text-text sm:text-4xl md:text-5xl">
              Study smarter with your axolotl companion
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-subtext md:text-lg">
              Turn notes, YouTube videos, and PDFs into flashcards in seconds. Stay consistent with streaks, rewards, and your pet by your side.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start for free
                </Button>
              </Link>
              <Link href="#how" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  See how it works
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-3 text-sm text-subtext">
              <span className="rounded-full bg-pink/15 px-3 py-1 text-pink">
                Free to start
              </span>
              <span className="rounded-full bg-card/70 px-3 py-1">
                Cute rewards
              </span>
              <span className="rounded-full bg-card/70 px-3 py-1">
                Focus boosts
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
                Join students already using Axoli
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
                Loved by students worldwide
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="AI" />
              <CardTitle>AI Flashcards</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              Paste notes, upload PDF or paste YouTube URL — get flashcards, summaries and quizzes instantly.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="Pet" />
              <CardTitle>Study Pet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              Your axolotl grows as you study. Keep it happy and unlock rewards.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="Groups" />
              <CardTitle>Study Together</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              Create study groups, share decks, compete on leaderboards.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FeatureIcon label="Progress" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-subtext">
              Track hours, streaks, coins, and your last 7 days — see what’s working and keep improving.
            </CardContent>
          </Card>
        </section>

        <section id="how" className="mt-16">
          <div className="mb-6">
            <h2 className="font-heading text-xl text-text sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-subtext">
              From notes to flashcards in minutes — then your pet keeps you consistent.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Step 1 Paste your notes or YouTube URL</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                Drop in any topic: lecture notes, revision guides, or a YouTube link.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Step 2 Get flashcards, summary and quiz</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                Axoli generates study-ready materials you can review right away.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Step 3 Study with your pet and track progress</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-subtext">
                Earn coins, keep your streak, and watch your axolotl grow.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl text-text sm:text-3xl">
                Pricing
              </h2>
              <p className="mt-2 text-sm text-subtext">
                Start free. Upgrade when you want unlimited momentum.
              </p>
            </div>
            <Link
              href="/pricing"
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-text ring-1 ring-border hover:bg-card/60 sm:inline-block"
            >
              Full details
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-3xl text-text sm:text-4xl">
                    £0
                  </div>
                  <div className="text-sm text-subtext">
                    forever
                  </div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-subtext">
                  {freeBullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button variant="outline" className="w-full">
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden ring-1 ring-gold/45">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-2xl" />
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Premium</CardTitle>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/30">
                    Most Popular
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-3xl text-text sm:text-4xl">
                    £3.99
                  </div>
                  <div className="text-sm text-subtext">
                    / month
                  </div>
                </div>
                <div className="mt-2 text-sm text-subtext">
                  Or £29.99/year — Save 37%
                </div>
                <ul className="mt-5 space-y-2 text-sm text-subtext">
                  {premiumBullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link href="/pricing" className="mt-6 block">
                  <Button className="w-full">Upgrade</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-4 py-8 sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-pink/15 blur-2xl" />
            <h2 className="max-w-2xl font-heading text-2xl text-text sm:text-3xl md:text-4xl">
              Ready to ace your exams?
            </h2>
            <p className="mt-3 max-w-2xl text-base text-subtext">
              Meet your axolotl today — it&apos;s free
            </p>
            <div className="mt-7">
              <Link href="/signup">
                <Button size="lg">Get started free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-subtext sm:flex-row">
          <span>© 2026 Axoli</span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <a href="mailto:hello@suitance.co.uk" className="hover:text-text">
              hello@suitance.co.uk
            </a>
            <Link href="/privacy" className="hover:text-text">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
