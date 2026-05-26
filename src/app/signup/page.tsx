import Link from 'next/link'
import { signupAction } from '@/app/actions/auth'
import { MarketingHeader } from '@/components/MarketingHeader'
import { MotionIn } from '@/components/MotionIn'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default async function SignupPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const error = typeof searchParams?.error === 'string' ? searchParams.error : null
  const errorMessage =
    error === 'invalid_credentials'
      ? 'Please enter a valid email and password (min 8 characters).'
      : error === 'missing_supabase_url'
        ? 'Server configuration error. Please contact support.'
        : error === 'missing_supabase_anon_key'
          ? 'Server configuration error. Please contact support.'
          : error === 'signup_failed'
            ? 'Something went wrong. Please try a different email or try again.'
            : error
              ? 'Something went wrong. Please try again.'
              : null

  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-4 py-12">
        <MotionIn className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Meet your axolotl</CardTitle>
              <p className="mt-1 text-sm text-subtext">
                Create an account to start earning coins and building your streak.
              </p>
            </CardHeader>
            <CardContent>
              {errorMessage ? (
                <div className="mb-4 rounded-2xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-text">
                  {errorMessage}
                </div>
              ) : null}
              <form action={signupAction} className="space-y-3">
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
                  autoComplete="new-password"
                  required
                />
                <Button type="submit" className="w-full">
                  Create account
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-subtext">
                Already have an account?{' '}
                <Link href="/login" className="text-pink hover:underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </MotionIn>
      </main>
    </div>
  )
}
