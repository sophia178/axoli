import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { shopCatalog, type ShopItemType } from '@/lib/shop/catalog'

export type ShopItemRow = {
  id: string
  name: string
  type: ShopItemType
  cost: number
  image_url: string | null
  is_premium: boolean
  is_seasonal: boolean
}

export async function ensureShopCatalog() {
  const supabase = getSupabaseAdmin()
  const payload = shopCatalog.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    cost: i.cost,
    image_url: i.image_url,
    is_premium: i.is_premium,
    is_seasonal: i.is_seasonal
  }))
  await supabase.from('shop_items').upsert(payload, { onConflict: 'id' })
}

export async function getShopItems(): Promise<ShopItemRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('shop_items')
    .select('id,name,type,cost,image_url,is_premium,is_seasonal')
    .in(
      'id',
      shopCatalog.map((i) => i.id)
    )

  return (data ?? []) as ShopItemRow[]
}

export async function getOwnedItemIds(userId: string): Promise<Set<string>> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('user_items')
    .select('item_id')
    .eq('user_id', userId)
  return new Set((data ?? []).map((r: any) => r.item_id as string))
}

