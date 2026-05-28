import Link from 'next/link'
import { MarketingHeader } from '@/components/MarketingHeader'

export const metadata = {
  title: 'Terms of Service – Axoli',
  description: 'The terms that govern your use of the Axoli study app.'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl text-text">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-subtext">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-12">
        <div className="rounded-3xl border border-border bg-card/60 px-4 py-6 sm:px-10 sm:py-10">
          <div className="mb-8 border-b border-border/60 pb-8">
            <h1 className="font-heading text-3xl text-text md:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-sm text-subtext">Last updated: 27 May 2026</p>
          </div>

          <p className="text-sm leading-relaxed text-subtext">
            Welcome to Axoli! These Terms of Service ("Terms") govern your use of the Axoli app
            and website, operated by Suitance Ltd ("we", "us", "our"). By creating an account or
            using Axoli, you agree to these Terms. Please read them — they're written to be clear,
            not dense.
          </p>

          <Section title="1. What Axoli is">
            <p>
              Axoli is an AI-powered study app that helps you turn notes, PDFs, and YouTube videos
              into flashcards, quizzes, and summaries. You also get a virtual pet axolotl that
              grows as you study, a study timer, progress tracking, and a shop where you can spend
              earned coins on pet accessories and upgrades.
            </p>
            <p>
              Axoli is intended for personal, non-commercial educational use. You must be at least
              13 years old to create an account. If you're under 18, please make sure a parent or
              guardian is happy with these Terms.
            </p>
          </Section>

          <Section title="2. Subscription plans">
            <p>Axoli offers two tiers:</p>
            <ul className="mt-2 space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="mt-0.5 text-pink">•</span>
                <span>
                  <strong className="text-text">Free</strong> — £0 forever. Includes flashcards,
                  quizzes, study timer, basic pet progression, and a limited number of AI
                  generations per month.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">Premium Monthly</strong> — £3.99/month. Unlocks
                  more AI generations, premium shop items, and group leaderboards.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gold">•</span>
                <span>
                  <strong className="text-text">Premium Yearly</strong> — £29.99/year (saving ~37%
                  vs. monthly). Same Premium features billed annually.
                </span>
              </li>
            </ul>
            <p>
              Coin bundles (one-off purchases of in-app coins) are also available. All prices are
              in GBP and include VAT where applicable.
            </p>
            <p>
              We reserve the right to change pricing with reasonable notice. If we increase the
              price of your active plan, we'll tell you before your next renewal and give you the
              option to cancel.
            </p>
          </Section>

          <Section title="3. Billing and renewals">
            <p>
              Premium subscriptions renew automatically at the end of each billing period (monthly
              or yearly) until you cancel. You'll be charged via Stripe using the payment method
              you provided at checkout.
            </p>
            <p>
              You can cancel your subscription at any time from your account settings. Cancellation
              takes effect at the end of the current billing period — you'll keep Premium access
              until then.
            </p>
          </Section>

          <Section title="4. Cancellations and refunds">
            <p>
              We don't offer pro-rata refunds for unused time on a subscription period. If you
              cancel mid-month or mid-year, your access continues until the period ends and you
              won't be charged again.
            </p>
            <p>
              Coin bundle purchases are non-refundable once the coins have been credited to your
              account.
            </p>
            <p>
              If something has gone wrong on our end — a technical error charged you twice, for
              example — please email{' '}
              <a
                href="mailto:hello@suitance.co.uk"
                className="text-pink hover:underline"
              >
                hello@suitance.co.uk
              </a>{' '}
              and we'll sort it out promptly.
            </p>
          </Section>

          <Section title="5. Acceptable use">
            <p>
              Axoli is here to help you study — please use it that way. You agree not to:
            </p>
            <ul className="mt-2 space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="mt-0.5 text-subtext">•</span>
                <span>
                  Scrape, crawl, or systematically extract content from the app or our AI
                  endpoints.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-subtext">•</span>
                <span>
                  Attempt to reverse-engineer, decompile, or tamper with any part of the service.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-subtext">•</span>
                <span>
                  Use the service to generate, store, or share content that is illegal, abusive,
                  or harmful.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-subtext">•</span>
                <span>
                  Share your account credentials or create accounts in bulk.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-subtext">•</span>
                <span>
                  Use the service for any commercial purpose without our written permission.
                </span>
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that breach these rules, with
              or without notice depending on severity.
            </p>
          </Section>

          <Section title="6. Your content">
            <p>
              Any notes, study materials, or other content you upload remain yours. By uploading
              content, you grant us a limited licence to process it for the sole purpose of
              providing the service to you (for example, generating your flashcards). We don't use
              your personal content to train AI models.
            </p>
          </Section>

          <Section title="7. Service provided as-is">
            <p>
              We work hard to keep Axoli fast, reliable, and bug-free — but we can't promise it
              will always be perfect. The service is provided <strong className="text-text">"as-is"</strong> and{' '}
              <strong className="text-text">"as available"</strong>, without warranties of any kind, express or
              implied.
            </p>
            <p>
              We're not liable for any loss of study data, missed sessions, or indirect damages
              arising from your use of (or inability to use) Axoli. Our total liability to you for
              any claim shall not exceed the amount you've paid us in the 3 months prior to the
              claim.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              You can delete your account at any time from the settings page. We may suspend or
              terminate your account if you breach these Terms, or if we decide to discontinue the
              service (in which case we'll give reasonable notice and refund any prepaid Premium
              time).
            </p>
          </Section>

          <Section title="9. Changes to these Terms">
            <p>
              We may update these Terms occasionally. We'll notify you via the app or email for
              material changes. Continuing to use Axoli after the effective date means you accept
              the updated Terms.
            </p>
          </Section>

          <Section title="10. Governing law">
            <p>
              These Terms are governed by the laws of <strong className="text-text">England and Wales</strong>.
              Any disputes will be subject to the exclusive jurisdiction of the courts of England
              and Wales.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Got a question or need help? We're friendly — just email us:{' '}
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
