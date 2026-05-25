import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ensureShopCatalog } from '@/lib/shop/data'
import { shopCatalog } from '@/lib/shop/catalog'

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
  const item = shopCatalog.find((i) => i.id === parsed.data.itemId)
  if (!item || item.type !== 'accessory') return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })
  const { data: owned } = await supabase
    .from('user_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', item.id)
    .maybeSingle()

  if (!owned) return NextResponse.json({ error: 'not_owned' }, { status: 403 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('pet_accessories')
    .eq('user_id', user.id)
    .maybeSingle()

  const current = ((profile as any)?.pet_accessories ?? []) as string[]
  const next = current.includes(item.name)
    ? current.filter((n) => n !== item.name)
    : [...current, item.name]

  await supabase.from('profiles').update({ pet_accessories: next }).eq('user_id', user.id)
  return NextResponse.json({ ok: true, pet_accessories: next })
}
