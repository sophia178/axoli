import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const bodySchema = z.object({
  plan: z.enum([
    'premium_monthly',
    'premium_yearly',
    'coins_50',
    'coins_150',
    'coins_400',
    'coins_1000'
  ])
})

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const priceMap: Record<string, string | undefined> = {
    premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    coins_50: process.env.STRIPE_COINS_50_PRICE_ID,
    coins_150: process.env.STRIPE_COINS_150_PRICE_ID,
    coins_400: process.env.STRIPE_COINS_400_PRICE_ID,
    coins_1000: process.env.STRIPE_COINS_1000_PRICE_ID
  }

  const priceId = priceMap[parsed.data.plan]
  if (!priceId) return NextResponse.json({ error: 'missing_price_id' }, { status: 500 })

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const stripe = stripeClient()

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const customerId = (profile as any)?.stripe_customer_id as string | null | undefined

  const isSubscription = parsed.data.plan === 'premium_monthly' || parsed.data.plan === 'premium_yearly'

  const session = await stripe.checkout.sessions.create(
    isSubscription
      ? {
          mode: 'subscription',
          client_reference_id: user.id,
          customer: customerId ?? undefined,
          success_url: `${baseUrl}/dashboard/settings?tab=subscription&checkout=success`,
          cancel_url: `${baseUrl}/dashboard/settings?tab=subscription&checkout=cancel`,
          line_items: [{ price: priceId, quantity: 1 }],
          metadata: { userId: user.id, plan: parsed.data.plan },
          subscription_data: { metadata: { userId: user.id, plan: parsed.data.plan } }
        }
      : {
          mode: 'payment',
          client_reference_id: user.id,
          customer: customerId ?? undefined,
          success_url: `${baseUrl}/dashboard/settings?tab=subscription&checkout=success`,
          cancel_url: `${baseUrl}/dashboard/settings?tab=subscription&checkout=cancel`,
          line_items: [{ price: priceId, quantity: 1 }],
          metadata: { userId: user.id, plan: parsed.data.plan }
        }
  )

  return NextResponse.json({ url: session.url })
}
