import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
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
  const t = await getTranslations('auth')
  const error = typeof searchParams?.error === 'string' ? searchParams.error : null

  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-4 py-12">
        <MotionIn className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>{t('signup.title')}</CardTitle>
              <p className="mt-1 text-sm text-subtext">
                {t('signup.subtitle')}
              </p>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="mb-4 rounded-2xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-text">
                  {t('signup.error')}
                </div>
              ) : null}
              <form action={signupAction} className="space-y-3">
                <Input
                  name="email"
                  type="email"
                  placeholder={t('signup.emailPlaceholder')}
                  autoComplete="email"
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder={t('signup.passwordPlaceholder')}
                  autoComplete="new-password"
                  required
                />
                <Button type="submit" className="w-full">
                  {t('signup.button')}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-subtext">
                {t('signup.alreadyHave')}{' '}
                <Link href="/login" className="text-pink hover:underline">
                  {t('signup.loginLink')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </MotionIn>
      </main>
    </div>
  )
}
