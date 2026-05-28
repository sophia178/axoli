import Link from 'next/link'
import { MarketingHeader } from '@/components/MarketingHeader'

export const metadata = {
  title: 'Privacy Policy – Axoli',
  description: 'How Axoli collects, uses, and protects your personal data.'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl text-text">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-subtext">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-12">
        <div className="rounded-3xl border border-border bg-card/60 px-4 py-6 sm:px-10 sm:py-10">
          <div className="mb-8 border-b border-border/60 pb-8">
            <h1 className="font-heading text-3xl text-text md:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-subtext">Last updated: 27 May 2026</p>
          </div>

          <p className="text-sm leading-relaxed text-subtext">
            Hi! We're Axoli (operated by Suitance Ltd). We care about your privacy and want to be
            upfront about how we handle your data. This policy explains what we collect, why we
            collect it, and what rights you have.
          </p>

          <Section title="1. Who we are">
            <p>
              Axoli is a study app that helps you create AI-powered flashcards and grow a virtual
              axolotl companion. We're operated by Suitance Ltd. If you have any questions about
              this policy, please email us at{' '}
              <a
                href="mailto:hello@suitance.co.uk"
                className="text-pink hover:underline"
              >
                hello@suitance.co.uk
              </a>
              .
            </p>
          </Section>

          <Section title="2. What data we collect">
            <p>We collect the following types of information:</p>
            <ul className="mt-2 space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Account information</strong> — your email address
                  and the password you create when you sign up.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Study activity</strong> — flashcard decks you
                  create, quiz results, study timer sessions, streaks, coins, and your pet's
                  progression data.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Payment information</strong> — if you subscribe to
                  Premium or purchase coin bundles, payments are processed securely by{' '}
                  <a
                    href="https://stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink hover:underline"
                  >
                    Stripe
                  </a>
                  . We never see or store your full card details — only a billing reference and
                  subscription status.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Usage data</strong> — basic technical information
                  such as your browser type and approximate location (country/city), collected via
                  our hosting provider and analytics tools to keep the service running smoothly.
                </span>
              </li>
            </ul>
          </Section>

          <Section title="3. Why we collect it">
            <p>We use your data only for legitimate purposes:</p>
            <ul className="mt-2 space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">To run your account</strong> — so you can log in,
                  save your study progress, and access your flashcard decks.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">For billing</strong> — to manage your subscription,
                  process payments, and handle cancellations or refunds.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">To improve the product</strong> — aggregate usage
                  patterns help us understand which features are useful and where to focus our
                  efforts.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">Service communications</strong> — to send you
                  important account notices (password resets, billing receipts). We won't spam you.
                </span>
              </li>
            </ul>
          </Section>

          <Section title="4. We don't sell your data">
            <p>
              We will never sell, rent, or trade your personal information to third parties for
              their marketing purposes. Full stop.
            </p>
            <p>
              We do share data with trusted service providers who help us run Axoli (for example,
              our cloud hosting provider and Stripe for payments), but they are only permitted to
              use your data to provide those services to us.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              We use a small number of cookies to keep you logged in and remember your session. We
              may also use lightweight analytics cookies to understand how people use the app in
              aggregate (no individual tracking or advertising profiles).
            </p>
            <p>
              You can control cookies via your browser settings. Note that disabling cookies may
              prevent you from staying logged in.
            </p>
          </Section>

          <Section title="6. Your rights under GDPR">
            <p>
              If you're based in the UK or EU, you have the following rights over your personal
              data:
            </p>
            <ul className="mt-2 space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Access</strong> — you can request a copy of the
                  data we hold about you.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Correction</strong> — you can ask us to fix
                  inaccurate data.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Deletion</strong> — you can request that we delete
                  your account and associated data. You can also delete your account directly from
                  the app settings.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Portability</strong> — you can request your data in
                  a machine-readable format.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Objection</strong> — you can object to us
                  processing your data in certain ways.
                </span>
              </li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a
                href="mailto:hello@suitance.co.uk"
                className="text-pink hover:underline"
              >
                hello@suitance.co.uk
              </a>{' '}
              and we'll respond within 30 days.
            </p>
          </Section>

          <Section title="7. Data retention">
            <p>
              We keep your data for as long as your account is active. If you delete your account,
              we'll remove your personal data within 30 days, except where we're required by law to
              retain certain records (e.g. billing records for HMRC purposes).
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We take reasonable technical and organisational measures to protect your data —
              including encrypted connections (HTTPS), hashed passwords, and access controls. That
              said, no system is 100% secure; please use a strong, unique password for your
              account.
            </p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>
              We may update this policy from time to time. If we make material changes, we'll let
              you know via the app or by email. Continued use of Axoli after changes means you
              accept the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions? Get in touch:{' '}
              <a
                href="mailto:hello@suitance.co.uk"
                className="text-pink hover:underline"
              >
                hello@suitance.co.uk
              </a>
            </p>
          </Section>
        </div>
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
