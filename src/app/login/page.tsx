import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { MarketingHeader } from '@/components/MarketingHeader'
import { MotionIn } from '@/components/MotionIn'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const error = typeof searchParams?.error === 'string' ? searchParams.error : null
  const notice =
    typeof searchParams?.notice === 'string' ? searchParams.notice : null

  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-4 py-12">
        <MotionIn className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <p className="mt-1 text-sm text-subtext">
                Log in to see your pet, streak, and study progress.
              </p>
            </CardHeader>
            <CardContent>
              {notice === 'check_email' ? (
                <div className="mb-4 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-subtext">
                  Check your email to confirm your account, then log in.
                </div>
              ) : null}
              {error ? (
                <div className="mb-4 rounded-2xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-text">
                  Login failed. Try again.
                </div>
              ) : null}

              <form action={loginAction} className="space-y-3">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password (min 8 chars)"
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" className="w-full">
                  Log in
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-subtext">
                New here?{' '}
                <Link href="/signup" className="text-pink hover:underline">
                  Create an account
                </Link>
              </div>
            </CardContent>
          </Card>
        </MotionIn>
      </main>
    </div>
  )
}
