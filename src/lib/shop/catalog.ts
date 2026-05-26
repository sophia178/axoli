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

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const DECORATION_SVGS = {
  extraPlant: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <path d="M44 92h32l-4 16H48l-4-16Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M48 92c0-18 3-34 12-48 9 14 12 30 12 48" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 44c-14 2-22-4-28-16 18-2 28 4 28 16Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 54c16 0 24-8 28-24-18 0-28 8-28 24Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 64c-12 2-20-4-26-16 16-2 26 4 26 16Z" fill="#FFD700" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round" opacity="0.9"/>
      <circle cx="52" cy="82" r="3" fill="#FFD700"/>
      <circle cx="68" cy="78" r="3" fill="#FFD700"/>
    </svg>
  `),
  fairyLights: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <path d="M14 42c20-18 38-20 52-8 13 11 26 10 40-4" fill="none" stroke="#FF8FAB" stroke-width="5" stroke-linecap="round"/>
      <path d="M28 44v12" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M56 38v14" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M84 28v14" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 64c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="#FFD700" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M46 64c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M74 56c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="#FFD700" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="39" cy="68" r="3" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="57" cy="68" r="3" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="85" cy="60" r="3" fill="#FFFFFF" opacity="0.85"/>
    </svg>
  `),
  littleDesk: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <rect x="22" y="56" width="76" height="16" rx="8" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="28" y="72" width="12" height="28" rx="6" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="80" y="72" width="12" height="28" rx="6" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="34" y="42" width="30" height="12" rx="6" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <path d="M68 44h18l-2 12H66l2-12Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 46h18" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    </svg>
  `),
  bookshelf: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <rect x="22" y="26" width="76" height="82" rx="12" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4"/>
      <path d="M30 54h60" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 80h60" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round"/>
      <rect x="32" y="34" width="10" height="14" rx="4" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="46" y="34" width="10" height="14" rx="4" fill="#0A0A1A" stroke="#FFD700" stroke-width="4"/>
      <rect x="60" y="34" width="10" height="14" rx="4" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="74" y="34" width="10" height="14" rx="4" fill="#0A0A1A" stroke="#FFD700" stroke-width="4"/>
      <rect x="34" y="60" width="12" height="16" rx="4" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="50" y="60" width="8" height="16" rx="4" fill="#0A0A1A" stroke="#FFD700" stroke-width="4"/>
      <rect x="62" y="60" width="12" height="16" rx="4" fill="#FF8FAB" stroke="#FFD700" stroke-width="4"/>
      <rect x="78" y="60" width="8" height="16" rx="4" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="36" y="86" width="16" height="16" rx="6" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <rect x="56" y="86" width="28" height="16" rx="6" fill="#0A0A1A" stroke="#FFD700" stroke-width="4"/>
    </svg>
  `),
  discoBall: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <path d="M60 22v12" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 34c22 0 40 16 40 36S82 106 60 106 20 90 20 70 38 34 60 34Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4"/>
      <path d="M32 64h56" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
      <path d="M36 80h48" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
      <path d="M42 44c6 8 10 18 10 30 0 12-4 22-10 30" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
      <path d="M78 44c-6 8-10 18-10 30 0 12 4 22 10 30" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
      <path d="M88 32l10-6" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M92 44l12 2" stroke="#FF8FAB" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 28l-10-6" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 44l-12 2" stroke="#FF8FAB" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="58" r="3" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="50" cy="74" r="3" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="72" cy="78" r="3" fill="#FFFFFF" opacity="0.85"/>
    </svg>
  `),
  treasureChest: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="#0A0A1A"/>
      <path d="M26 56c0-18 14-32 34-32s34 14 34 32v8H26v-8Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M22 64h76v40c0 6-5 10-10 10H32c-6 0-10-4-10-10V64Z" fill="#FF8FAB" stroke="#0A0A1A" stroke-width="4" stroke-linejoin="round"/>
      <path d="M22 74h76" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>
      <rect x="54" y="72" width="12" height="16" rx="6" fill="#FFD700" stroke="#0A0A1A" stroke-width="4"/>
      <path d="M36 56c0-10 10-18 24-18s24 8 24 18" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 92h18" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
      <path d="M72 92h18" stroke="#0A0A1A" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
      <circle cx="60" cy="94" r="3" fill="#FFFFFF" opacity="0.85"/>
    </svg>
  `)
} as const

export const shopCatalog: ShopCatalogItem[] = [
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f01', name: 'Seaweed snack', type: 'food', cost: 5, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 5 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f02', name: 'Magic pellets', type: 'food', cost: 10, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 10 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f03', name: 'Rainbow flakes', type: 'food', cost: 20, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 20 } },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f04', name: 'Golden feast', type: 'food', cost: 50, image_url: null, is_premium: false, is_seasonal: false, meta: { happiness: 50 } },

  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f11', name: 'Extra plant', type: 'decoration', cost: 15, image_url: DECORATION_SVGS.extraPlant, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f12', name: 'Fairy lights', type: 'decoration', cost: 25, image_url: DECORATION_SVGS.fairyLights, is_premium: false, is_seasonal: true },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f13', name: 'Little desk', type: 'decoration', cost: 30, image_url: DECORATION_SVGS.littleDesk, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f14', name: 'Bookshelf', type: 'decoration', cost: 40, image_url: DECORATION_SVGS.bookshelf, is_premium: false, is_seasonal: false },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f15', name: 'Disco ball', type: 'decoration', cost: 60, image_url: DECORATION_SVGS.discoBall, is_premium: false, is_seasonal: true },
  { id: '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f16', name: 'Treasure chest', type: 'decoration', cost: 80, image_url: DECORATION_SVGS.treasureChest, is_premium: false, is_seasonal: false },

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
