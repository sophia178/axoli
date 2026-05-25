import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MarketingHeader } from '@/components/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function PricingPage() {
  const t = await getTranslations('pricingPage')
  const tCommon = await getTranslations('common')
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl text-text">{t('title')}</h1>
          <p className="mt-3 text-subtext">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t('free.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£0</div>
                <div className="text-sm text-subtext">{t('free.period')}</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>{t('free.bullets.0')}</li>
                <li>{t('free.bullets.1')}</li>
                <li>{t('free.bullets.2')}</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  {tCommon('buttons.startForFree')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-pink/30 md:col-span-1">
            <CardHeader>
              <CardTitle>{t('monthly.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£3.99</div>
                <div className="text-sm text-subtext">{t('monthly.period')}</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>{t('monthly.bullets.0')}</li>
                <li>{t('monthly.bullets.1')}</li>
                <li>{t('monthly.bullets.2')}</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">{t('monthly.cta')}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t('yearly.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="font-heading text-4xl text-text">£29.99</div>
                <div className="text-sm text-subtext">{t('yearly.period')}</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-subtext">
                <li>{t('yearly.bullets.0')}</li>
                <li>{t('yearly.bullets.1')}</li>
                <li>{t('yearly.bullets.2')}</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="secondary" className="w-full">
                  {t('yearly.cta')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
