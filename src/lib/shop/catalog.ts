export type ShopItemType = 'food' | 'decoration' | 'accessory' | 'colour'

export type ShopCatalogItem = {
  id: string
  name: string
  type: ShopItemType
  cost: number
  image_url: string | null
  is_premium: boolean
  is_seasonal: boolean
  meta?: Record<string, string | number | boolean>
}

export const shopCatalog: ShopCatalogItem[] = [
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f01', name: 'Seaweed snack', type: 'food', cost: 5, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 5 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f02', name: 'Magic pellets', type: 'food', cost: 10, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 10 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f03', name: 'Rainbow flakes', type: 'food', cost: 20, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 20 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f04', name: 'Golden feast', type: 'food', cost: 50, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 50 } },

  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f11', name: 'Extra plant', type: 'decoration', cost: 15, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f12', name: 'Fairy lights', type: 'decoration', cost: 25, image_url: null, is_premium: false, is_seasonal: true },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f13', name: 'Little desk', type: 'decoration', cost: 30, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f14', name: 'Bookshelf', type: 'decoration', cost: 40, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f15', name: 'Disco ball', type: 'decoration', cost: 60, image_url: null, is_premium: false, is_seasonal: true },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f16', name: 'Treasure chest', type: 'decoration', cost: 80, image_url: null, is_premium: false, is_seasonal: false },

  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f21', name: 'Tiny graduation cap', type: 'accessory', cost: 30, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f22', name: 'Star glasses', type: 'accessory', cost: 25, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f23', name: 'Flower crown', type: 'accessory', cost: 35, image_url: null, is_premium: false, is_seasonal: true },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f24', name: 'Tiny scarf', type: 'accessory', cost: 20, image_url: null, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f25', name: 'Astronaut helmet', type: 'accessory', cost: 100, image_url: null, is_premium: true, is_seasonal: false },

  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f31', name: 'Golden axolotl', type: 'colour', cost: 150, image_url: null, is_premium: false, is_seasonal: false, meta: { colour: 'golden' } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f32', name: 'Galaxy axolotl', type: 'colour', cost: 200, image_url: null, is_premium: true, is_seasonal: false, meta: { colour: 'galaxy' } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f33', name: 'Rainbow axolotl', type: 'colour', cost: 250, image_url: null, is_premium: true, is_seasonal: false, meta: { colour: 'rainbow' } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f34', name: 'Cherry blossom', type: 'colour', cost: 180, image_url: null, is_premium: true, is_seasonal: true, meta: { colour: 'cherry' } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f35', name: 'Midnight axolotl', type: 'colour', cost: 120, image_url: null, is_premium: false, is_seasonal: false, meta: { colour: 'midnight' } }
]

export function tabLabel(type: ShopItemType) {
  if (type === 'food') return 'Food'
  if (type === 'decoration') return 'Decorations'
  if (type === 'accessory') return 'Accessories'
  return 'Colour changes'
}

