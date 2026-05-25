import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

export const runtime = 'nodejs'

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

function planFromKey(key: string) {
  if (key === 'premium_monthly' || key === 'premium_yearly') return 'premium'
  if (key === 'monthly') return 'premium'
  if (key === 'yearly') return 'premium'
  return 'free'
}

function coinsFromKey(key: string) {
  if (key === 'coins_50') return 50
  if (key === 'coins_150') return 150
  if (key === 'coins_400') return 400
  if (key === 'coins_1000') return 1000
  return 0
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'missing_webhook_secret' }, { status: 500 })

  const signature = headers().get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 })

  const rawBody = await req.text()
  const stripe = stripeClient()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id ?? (session.metadata?.userId ?? null)
    if (userId) {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price', 'subscription']
      })

      const key = (full.metadata?.plan ?? '') as string
      const newPlan = full.mode === 'subscription' ? planFromKey(key) : null
      const customerId = typeof full.customer === 'string' ? full.customer : null

      if (customerId) {
        await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', userId)
      }

      if (full.mode === 'subscription') {
        const subId = typeof full.subscription === 'string' ? full.subscription : (full.subscription as any)?.id ?? null
        const renewalAt =
          (full.subscription as any)?.current_period_end
            ? new Date((full.subscription as any).current_period_end * 1000).toISOString()
            : null

        await supabase
          .from('profiles')
          .update({
            plan: newPlan ?? 'premium',
            stripe_subscription_id: subId,
            stripe_renewal_at: renewalAt
          })
          .eq('user_id', userId)

        await supabase.from('users').update({ plan: key || 'premium_monthly' }).eq('id', userId)
      } else {
        const coinsKey = key
        const coins = coinsFromKey(coinsKey)
        if (coins > 0) {
          await awardCoins(userId, coins, coinsKey)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const userId = (sub.metadata?.userId ?? null) as string | null
    if (userId) {
      const active = sub.status === 'active' || sub.status === 'trialing'
      const key = (sub.metadata?.plan ?? '') as string
      const profilePlan = active ? planFromKey(key) : 'free'
      const renewalAt = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

      await supabase
        .from('profiles')
        .update({
          plan: profilePlan,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_renewal_at: renewalAt
        })
        .eq('user_id', userId)

      await supabase.from('users').update({ plan: active ? key || 'premium_monthly' : 'free' }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = (sub.metadata?.userId ?? null) as string | null
    if (userId) {
      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null, stripe_renewal_at: null })
        .eq('user_id', userId)
      await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
