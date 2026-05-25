import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getUserPlan } from '@/lib/data/user'
import { ensureShopCatalog } from '@/lib/shop/data'
import { shopCatalog } from '@/lib/shop/catalog'
import { applyPetDailyDecay, changePetHappiness } from '@/lib/pet/pet'
import { spendCoins } from '@/lib/coins'

export const runtime = 'nodejs'

const bodySchema = z.object({
  itemId: z.string().uuid()
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  await ensureShopCatalog()
  await applyPetDailyDecay(user.id)

  const item = shopCatalog.find((i) => i.id === parsed.data.itemId)
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const plan = await getUserPlan(user.id)
  if (item.is_premium && plan === 'free') {
    return NextResponse.json({ error: 'premium_only' }, { status: 402 })
  }

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins,pet_happiness,pet_colour')
    .eq('user_id', user.id)
    .maybeSingle()

  const coins = profile?.coins ?? 0
  if (coins < item.cost) return NextResponse.json({ error: 'not_enough_coins' }, { status: 409 })

  await spendCoins(user.id, item.cost, `purchase:${item.name}`)

  if (item.type === 'food') {
    const happiness = Number((item.meta as any)?.happiness ?? 0)
    const petHappiness = happiness > 0 ? await changePetHappiness(user.id, happiness) : profile?.pet_happiness ?? 100
    return NextResponse.json({ ok: true, itemId: item.id, petHappiness })
  }

  if (item.type === 'colour') {
    const colour = String((item.meta as any)?.colour ?? 'pink')
    await supabase.from('profiles').update({ pet_colour: colour }).eq('user_id', user.id)
  }

  if (item.type === 'decoration' || item.type === 'accessory' || item.type === 'colour') {
    await supabase.from('user_items').upsert(
      {
        user_id: user.id,
        item_id: item.id
      },
      { onConflict: 'user_id,item_id' }
    )
  }

  return NextResponse.json({ ok: true, itemId: item.id })
}

