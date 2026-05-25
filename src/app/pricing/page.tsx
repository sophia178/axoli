import Link from 'next/link'
import { MarketingHeader } from '@/components/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function PricingPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl text-text">Pricing</h1>
          <p className="mt-3 text-subtext">
            Axoli is free to start. Upgrade for bigger AI limits and premium pet items.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£0</div>
                <div className="text-sm text-subtext">forever</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>Flashcards, timer, exams</li>
                <li>Basic pet + coins</li>
                <li>Limited AI generation</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Start for free
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-pink/30 md:col-span-1">
            <CardHeader>
              <CardTitle>Premium Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£3.99</div>
                <div className="text-sm text-subtext">/ month</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>More AI generations</li>
                <li>Premium shop items</li>
                <li>Leaderboards</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Go premium</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Premium Yearly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£29.99</div>
                <div className="text-sm text-subtext">/ year</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>Best value</li>
                <li>More AI generations</li>
                <li>Premium shop items</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="secondary" className="w-full">
                  Save yearly
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
