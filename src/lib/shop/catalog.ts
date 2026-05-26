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

const NAVY = '#0A0A1A'
const PINK = '#FF8FAB'
const GOLD = '#FFD700'

const baseIdPrefix = '0c0a0f7a-4c2d-4b0e-bf7e-2d0b5b9b3f'
function id(hex: number) {
  return `${baseIdPrefix}${hex.toString(16).padStart(2, '0')}`
}

function iconSvg(inner: string, defs = '') {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bgGlow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${PINK}" stop-opacity="0.18"/>
          <stop offset="1" stop-color="${GOLD}" stop-opacity="0.12"/>
        </linearGradient>
        <radialGradient id="shine" cx="35%" cy="28%" r="60%">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </radialGradient>
        ${defs}
      </defs>
      <rect width="120" height="120" rx="24" fill="${NAVY}"/>
      <rect x="8" y="8" width="104" height="104" rx="20" fill="url(#bgGlow)"/>
      <rect x="14" y="14" width="92" height="92" rx="18" fill="url(#shine)"/>
      ${inner}
    </svg>
  `)
}

function foodIcon(kind: string) {
  const bowl = `
    <path d="M28 66c0 24 14 40 32 40s32-16 32-40v-6H28v6Z" fill="url(#bowl)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M28 60c10 6 20 9 32 9s22-3 32-9" fill="none" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="60" cy="106" rx="30" ry="6" fill="#000000" opacity="0.22"/>
  `
  const defs = `
    <linearGradient id="bowl" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${PINK}"/>
      <stop offset="1" stop-color="#FFB6C8"/>
    </linearGradient>
  `

  if (kind === 'pellets') {
    return iconSvg(
      `<g>${bowl}<g>
        <circle cx="46" cy="56" r="6" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="60" cy="52" r="6" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="74" cy="56" r="6" fill="#B9A8FF" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="54" cy="62" r="6" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="68" cy="62" r="6" fill="${PINK}" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="60" cy="68" r="6" fill="#FF6B6B" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="82" cy="64" r="4" fill="#FFFFFF" opacity="0.7"/>
      </g></g>`,
      defs
    )
  }

  if (kind === 'bloodworms') {
    return iconSvg(
      `<g>${bowl}
        <path d="M38 62c8-14 18-14 26 0 8 14 18 14 26 0" fill="none" stroke="#FF4D6D" stroke-width="8" stroke-linecap="round"/>
        <path d="M40 50c8-14 16-14 24 0 8 14 16 14 24 0" fill="none" stroke="${PINK}" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
        <path d="M44 72c12 10 20 10 32 0" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
      </g>`,
      defs
    )
  }

  if (kind === 'brineShrimp') {
    return iconSvg(
      `<g>${bowl}
        <path d="M48 62c6-14 16-18 26-12 10 6 10 18 2 26" fill="none" stroke="${PINK}" stroke-width="7" stroke-linecap="round"/>
        <path d="M52 66c8-10 16-10 24 0" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
        <circle cx="70" cy="58" r="3" fill="${NAVY}" opacity="0.85"/>
        <circle cx="78" cy="60" r="3" fill="#FFFFFF" opacity="0.35"/>
      </g>`,
      defs
    )
  }

  if (kind === 'daphnia') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 56c8-10 20-10 28 0" fill="none" stroke="#7AE7B9" stroke-width="7" stroke-linecap="round"/>
        <circle cx="46" cy="60" r="4" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="56" cy="56" r="4" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="66" cy="60" r="4" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4"/>
        <circle cx="76" cy="56" r="4" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/>
        <path d="M50 70c10 8 20 8 30 0" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
      </g>`,
      defs
    )
  }

  if (kind === 'tubifex') {
    return iconSvg(
      `<g>${bowl}
        <path d="M40 62c6-10 14-10 20 0" fill="none" stroke="#C77DFF" stroke-width="8" stroke-linecap="round"/>
        <path d="M60 62c6-10 14-10 20 0" fill="none" stroke="#9D4EDD" stroke-width="8" stroke-linecap="round"/>
        <path d="M44 54c8-14 16-14 24 0" fill="none" stroke="${PINK}" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
        <path d="M52 72c10 10 18 10 26 0" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
      </g>`,
      defs
    )
  }

  if (kind === 'snail') {
    return iconSvg(
      `<g>${bowl}
        <path d="M64 58c14 0 24 10 24 22 0 10-8 18-18 18H54c-12 0-22-10-22-22 0-12 10-18 20-18 4 0 8 2 12 2Z" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="74" cy="58" r="16" fill="url(#shell)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M74 50c6 2 10 8 10 14" fill="none" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
        <circle cx="72" cy="52" r="3" fill="#FFFFFF" opacity="0.45"/>
      </g>`,
      `${defs}<linearGradient id="shell" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`
    )
  }

  if (kind === 'miniCrab') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 62c2-10 10-16 16-16s14 6 16 16" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M42 66c-10-2-16-8-18-18 10 2 16 6 18 12" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
        <path d="M78 66c10-2 16-8 18-18-10 2-16 6-18 12" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="54" cy="60" r="3" fill="${NAVY}"/>
        <circle cx="66" cy="60" r="3" fill="${NAVY}"/>
      </g>`,
      defs
    )
  }

  if (kind === 'algaeWafer') {
    return iconSvg(
      `<g>${bowl}
        <path d="M40 54c0-8 8-14 20-14s20 6 20 14-8 22-20 22-20-14-20-22Z" fill="url(#wafer)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M46 54c6 4 10 6 14 6s8-2 14-6" fill="none" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
        <circle cx="60" cy="62" r="3" fill="#FFFFFF" opacity="0.35"/>
      </g>`,
      `${defs}<linearGradient id="wafer" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2EE59D"/><stop offset="1" stop-color="#0FB07B"/></linearGradient>`
    )
  }

  if (kind === 'tadpole') {
    return iconSvg(
      `<g>${bowl}
        <path d="M52 60c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18Z" fill="url(#tad)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M52 60c-12 4-18 12-18 24 10-2 18-8 22-16" fill="none" stroke="#6EC7FF" stroke-width="6" stroke-linecap="round"/>
        <circle cx="66" cy="56" r="3" fill="${NAVY}" opacity="0.85"/>
      </g>`,
      `${defs}<linearGradient id="tad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6EC7FF"/><stop offset="1" stop-color="#2A2A4A"/></linearGradient>`
    )
  }

  if (kind === 'feederFish') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 64c10-16 22-20 34-14 10 6 16 14 18 24-2 10-8 18-18 24-12 6-24 2-34-14" fill="url(#fish)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M84 64l14-10v20l-14-10Z" fill="${GOLD}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="60" cy="62" r="3" fill="${NAVY}"/>
      </g>`,
      `${defs}<linearGradient id="fish" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6EC7FF"/><stop offset="1" stop-color="#B9A8FF"/></linearGradient>`
    )
  }

  if (kind === 'mystery') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 52h32c10 0 18 8 18 18s-8 18-18 18H44c-10 0-18-8-18-18s8-18 18-18Z" fill="url(#myst)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M52 62c0-6 4-10 10-10 4 0 8 2 10 6 2 4 0 8-6 12-6 4-6 8-6 10" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
        <circle cx="62" cy="84" r="3" fill="#FFFFFF" opacity="0.75"/>
      </g>`,
      `${defs}<linearGradient id="myst" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#B9A8FF"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient>`
    )
  }

  if (kind === 'goldenApple') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 64c0-16 12-28 26-28s26 12 26 28c0 18-12 34-26 34S44 82 44 64Z" fill="url(#apple)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M66 36c-8 0-14-4-16-12 10-2 16 2 16 12Z" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M70 34v10" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="60" cy="58" r="3" fill="#FFFFFF" opacity="0.45"/>
      </g>`,
      `${defs}<linearGradient id="apple" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`
    )
  }

  if (kind === 'cake') {
    return iconSvg(
      `<g>${bowl}
        <path d="M42 72h36l10 18H32l10-18Z" fill="url(#cake)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M44 54h32c10 0 18 6 18 14v6H26v-6c0-8 8-14 18-14Z" fill="url(#frost)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M60 42v10" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M58 36c0-4 4-6 6-2 2 4-2 6-6 2Z" fill="${GOLD}" opacity="0.9"/>
      </g>`,
      `${defs}<linearGradient id="cake" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFD1DC"/></linearGradient><linearGradient id="frost" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient>`
    )
  }

  if (kind === 'watermelon') {
    return iconSvg(
      `<g>${bowl}
        <path d="M40 70c0-18 14-32 32-32s32 14 32 32H40Z" fill="url(#wm)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M40 70c0 8 14 20 32 20s32-12 32-20" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="58" cy="56" r="2" fill="${NAVY}" opacity="0.7"/>
        <circle cx="70" cy="58" r="2" fill="${NAVY}" opacity="0.7"/>
        <circle cx="66" cy="50" r="2" fill="${NAVY}" opacity="0.7"/>
      </g>`,
      `${defs}<linearGradient id="wm" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`
    )
  }

  if (kind === 'strawberry') {
    return iconSvg(
      `<g>${bowl}
        <path d="M46 62c0-16 10-28 14-28 4 0 14 12 14 28 0 18-10 32-14 32-4 0-14-14-14-32Z" fill="url(#berry)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M60 34c-12 0-20-6-22-16 16-2 22 4 22 16Z" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="56" cy="56" r="2" fill="${GOLD}" opacity="0.9"/>
        <circle cx="64" cy="60" r="2" fill="${GOLD}" opacity="0.9"/>
        <circle cx="60" cy="70" r="2" fill="${GOLD}" opacity="0.9"/>
      </g>`,
      `${defs}<linearGradient id="berry" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FF4D6D"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`
    )
  }

  if (kind === 'donut') {
    return iconSvg(
      `<g>${bowl}
        <path d="M44 60c0-16 12-28 28-28s28 12 28 28-12 28-28 28-28-12-28-28Z" fill="url(#donut)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M56 60c0-8 6-14 16-14s16 6 16 14-6 14-16 14-16-6-16-14Z" fill="${NAVY}" opacity="0.45"/>
        <circle cx="52" cy="52" r="3" fill="${GOLD}" opacity="0.9"/>
        <circle cx="68" cy="48" r="3" fill="#6EC7FF" opacity="0.9"/>
        <circle cx="78" cy="58" r="3" fill="#7AE7B9" opacity="0.9"/>
      </g>`,
      `${defs}<linearGradient id="donut" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient>`
    )
  }

  if (kind === 'sushi') {
    return iconSvg(
      `<g>${bowl}
        <path d="M42 62c0-10 10-18 22-18h12c12 0 22 8 22 18s-10 20-22 20H64c-12 0-22-10-22-20Z" fill="url(#rice)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M44 54c8-10 18-14 28-14s20 4 28 14" fill="url(#fishTop)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M60 46c8 0 14 4 16 10" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.35"/>
      </g>`,
      `${defs}<linearGradient id="rice" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDE6FF"/></linearGradient><linearGradient id="fishTop" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`
    )
  }

  return foodIcon('pellets')
}

function decorationIcon(kind: string) {
  if (kind === 'extraPlant') {
    return iconSvg(
      `<g>
        <path d="M42 86h36l-4 20H46l-4-20Z" fill="url(#pot)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M48 86c0-22 4-40 12-54 8 14 12 32 12 54" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 44c-16 2-24-6-30-20 20-2 30 6 30 20Z" fill="url(#leaf)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M60 54c18 0 28-10 32-28-20 0-32 10-32 28Z" fill="url(#leaf)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M60 66c-14 2-22-6-28-20 18-2 28 6 28 20Z" fill="url(#leaf)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" opacity="0.95"/>
      </g>`,
      `<linearGradient id="pot" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient><linearGradient id="leaf" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7AE7B9"/><stop offset="1" stop-color="#2EE59D"/></linearGradient>`
    )
  }

  if (kind === 'fairyLights') {
    return iconSvg(
      `<g>
        <path d="M14 44c24-18 44-18 60-4 14 12 28 10 40-4" fill="none" stroke="${PINK}" stroke-width="5" stroke-linecap="round"/>
        <path d="M28 46v12" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M58 42v14" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M88 32v14" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M26 66c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="${GOLD}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M48 66c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M74 58c0-6 5-10 10-10s10 4 10 10-5 12-10 12-10-6-10-12Z" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
      </g>`
    )
  }

  if (kind === 'littleDesk') {
    return iconSvg(
      `<g>
        <rect x="20" y="56" width="80" height="16" rx="8" fill="url(#desk)" stroke="${NAVY}" stroke-width="4"/>
        <rect x="28" y="72" width="14" height="30" rx="7" fill="url(#leg)" stroke="${NAVY}" stroke-width="4"/>
        <rect x="78" y="72" width="14" height="30" rx="7" fill="url(#leg)" stroke="${NAVY}" stroke-width="4"/>
        <rect x="34" y="40" width="32" height="14" rx="7" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/>
        <path d="M70 42h20l-2 12H68l2-12Z" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
      </g>`,
      `<linearGradient id="desk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient><linearGradient id="leg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`
    )
  }

  if (kind === 'bookshelf') {
    return iconSvg(
      `<g>
        <rect x="20" y="24" width="80" height="86" rx="14" fill="url(#shelf)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M30 54h60" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
        <path d="M30 80h60" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
        <rect x="32" y="34" width="10" height="14" rx="4" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>
        <rect x="46" y="34" width="10" height="14" rx="4" fill="#0F1030" stroke="${GOLD}" stroke-width="4"/>
        <rect x="60" y="34" width="10" height="14" rx="4" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/>
        <rect x="74" y="34" width="10" height="14" rx="4" fill="#0F1030" stroke="${GOLD}" stroke-width="4"/>
      </g>`,
      `<linearGradient id="shelf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient>`
    )
  }

  if (kind === 'discoBall') {
    return iconSvg(
      `<g>
        <path d="M60 18v14" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 34c24 0 44 18 44 40S84 112 60 112 16 96 16 74s20-40 44-40Z" fill="url(#ball)" stroke="${NAVY}" stroke-width="4"/>
        <path d="M30 70h60" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
        <path d="M44 44c8 10 12 22 12 36 0 14-4 26-12 36" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
        <path d="M76 44c-8 10-12 22-12 36 0 14 4 26 12 36" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
        <circle cx="60" cy="62" r="3" fill="#FFFFFF" opacity="0.9"/>
      </g>`,
      `<linearGradient id="ball" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#B9A8FF"/></linearGradient>`
    )
  }

  if (kind === 'treasureChest') {
    return iconSvg(
      `<g>
        <path d="M26 56c0-18 14-32 34-32s34 14 34 32v8H26v-8Z" fill="url(#chest)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M22 64h76v40c0 6-5 10-10 10H32c-6 0-10-4-10-10V64Z" fill="url(#chest)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M22 76h76" stroke="url(#metal)" stroke-width="8" stroke-linecap="round"/>
        <rect x="54" y="72" width="12" height="18" rx="6" fill="url(#metal)" stroke="${NAVY}" stroke-width="4"/>
      </g>`,
      `<linearGradient id="chest" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FFB6C8"/></linearGradient><linearGradient id="metal" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`
    )
  }

  const isSimple = ['coral','seaweed','castle','sunkenShip','rubberDuck','miniVolcano','crystalCave','rainbowArch','mushroomHouse','lantern','starfish','giantPearl','wizardTower','neonSign'].includes(kind)
  if (!isSimple) return decorationIcon('extraPlant')

  const map: Record<string, string> = {
    coral: `<path d="M56 98c-8-22-6-38 2-50 8-12 10-22 6-30 14 8 18 22 12 42 10-4 18-2 24 8-18-4-30 6-32 30h-12Z" fill="url(#coral)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="72" cy="58" r="3" fill="${GOLD}" opacity="0.9"/>`,
    seaweed: `<path d="M44 104c-2-28 6-44 16-56 10-12 12-22 6-34 18 10 22 26 12 48 12-6 22-4 30 6-22-4-34 10-36 42H44Z" fill="url(#weed)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="72" cy="34" r="4" fill="#FFFFFF" opacity="0.2"/>`,
    castle: `<path d="M28 98V46l10 8 10-8 10 8 10-8 10 8 10-8 10 8V98H28Z" fill="url(#stone)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M44 98V72c0-8 8-14 16-14s16 6 16 14v26H44Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>`,
    sunkenShip: `<path d="M26 88c20-18 44-26 68-22l4 22c-24 10-48 12-72 0Z" fill="url(#wood)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M48 64V34" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/><path d="M48 36c18 4 30 16 34 34-18 0-30-10-34-34Z" fill="url(#sail)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>`,
    rubberDuck: `<path d="M38 82c0-16 12-28 28-28h10c14 0 26 12 26 28 0 12-10 22-22 22H60c-12 0-22-10-22-22Z" fill="url(#duck)" stroke="${NAVY}" stroke-width="4"/><path d="M84 60c10 0 16 6 16 12-10 2-18 0-22-6" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="64" cy="66" r="3" fill="${NAVY}"/>`,
    miniVolcano: `<path d="M28 104l18-56h28l18 56H28Z" fill="url(#rock)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M52 48l8-14 8 14" fill="url(#lava)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M44 76c8-10 16-10 24 0" fill="none" stroke="url(#lava)" stroke-width="8" stroke-linecap="round"/>`,
    crystalCave: `<path d="M24 98l14-48 18 18 10-26 18 26 14-14 10 44H24Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M38 92l8-34 18 18-10 16H38Z" fill="url(#crystal)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M66 92l10-42 18 18-10 24H66Z" fill="url(#crystal)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" opacity="0.9"/>`,
    rainbowArch: `<path d="M28 98c0-32 16-58 32-58s32 26 32 58" fill="none" stroke="#FF6B6B" stroke-width="10" stroke-linecap="round"/><path d="M36 98c0-26 12-48 24-48s24 22 24 48" fill="none" stroke="${PINK}" stroke-width="10" stroke-linecap="round"/><path d="M44 98c0-20 8-38 16-38s16 18 16 38" fill="none" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/><path d="M52 98c0-14 4-28 8-28s8 14 8 28" fill="none" stroke="#7AE7B9" stroke-width="10" stroke-linecap="round"/><path d="M60 98c0-8 2-18 4-18s4 10 4 18" fill="none" stroke="#6EC7FF" stroke-width="10" stroke-linecap="round"/>`,
    mushroomHouse: `<path d="M30 64c0-22 14-38 30-38s30 16 30 38c0 4-2 8-6 10H36c-4-2-6-6-6-10Z" fill="url(#cap)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="46" cy="48" r="6" fill="#FFFFFF" opacity="0.9"/><circle cx="72" cy="50" r="5" fill="#FFFFFF" opacity="0.9"/><path d="M40 74h40v28c0 6-5 10-10 10H50c-6 0-10-4-10-10V74Z" fill="url(#stem)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><rect x="54" y="88" width="12" height="16" rx="6" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    lantern: `<path d="M60 20c10 10 14 20 14 30" fill="none" stroke="${PINK}" stroke-width="6" stroke-linecap="round"/><path d="M44 48h32l-4 44H48l-4-44Z" fill="url(#lantern)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="70" r="10" fill="#FFFFFF" opacity="0.22"/><path d="M40 48h40" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/>`,
    starfish: `<path d="M60 28l8 18 20 2-14 14 4 20-18-10-18 10 4-20-14-14 20-2 8-18Z" fill="url(#star)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="54" cy="58" r="3" fill="${NAVY}" opacity="0.85"/><circle cx="66" cy="58" r="3" fill="${NAVY}" opacity="0.85"/>`,
    giantPearl: `<circle cx="60" cy="66" r="28" fill="url(#pearl)" stroke="${NAVY}" stroke-width="4"/><circle cx="50" cy="56" r="8" fill="#FFFFFF" opacity="0.35"/>`,
    wizardTower: `<path d="M46 104V44l14-18 14 18v60H46Z" fill="url(#tower)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M40 48l20-26 20 26" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><rect x="54" y="62" width="12" height="16" rx="6" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    neonSign: `<path d="M30 38h60c10 0 18 8 18 18v20c0 10-8 18-18 18H30c-10 0-18-8-18-18V56c0-10 8-18 18-18Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M38 58c8-12 18-18 30-18s22 6 30 18-18 28-30 28-38-16-30-28Z" fill="none" stroke="url(#sign)" stroke-width="8" stroke-linecap="round" opacity="0.95"/><circle cx="86" cy="50" r="3" fill="${GOLD}" opacity="0.9"/><circle cx="34" cy="50" r="3" fill="${GOLD}" opacity="0.9"/>`
  }

  const defs: Record<string, string> = {
    coral: `<linearGradient id="coral" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FF4D6D"/></linearGradient>`,
    seaweed: `<linearGradient id="weed" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7AE7B9"/><stop offset="1" stop-color="#0FB07B"/></linearGradient>`,
    castle: `<linearGradient id="stone" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6EC7FF"/><stop offset="1" stop-color="#B9A8FF"/></linearGradient>`,
    sunkenShip: `<linearGradient id="wood" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#D9A441"/><stop offset="1" stop-color="#A46A1F"/></linearGradient><linearGradient id="sail" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDE6FF"/></linearGradient>`,
    rubberDuck: `<linearGradient id="duck" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`,
    miniVolcano: `<linearGradient id="rock" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2A2A4A"/><stop offset="1" stop-color="#0F1030"/></linearGradient><linearGradient id="lava" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`,
    crystalCave: `<linearGradient id="crystal" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6EC7FF"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient>`,
    mushroomHouse: `<linearGradient id="cap" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="#FF4D6D"/></linearGradient><linearGradient id="stem" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF1F5"/><stop offset="1" stop-color="#FFD1DC"/></linearGradient>`,
    lantern: `<linearGradient id="lantern" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="#FFE59A"/></linearGradient>`,
    starfish: `<linearGradient id="star" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="${GOLD}"/></linearGradient>`,
    giantPearl: `<radialGradient id="pearl" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#DDE6FF"/><stop offset="1" stop-color="#B9A8FF"/></radialGradient>`,
    wizardTower: `<linearGradient id="tower" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7C5CFF"/><stop offset="1" stop-color="#1B1B6B"/></linearGradient>`,
    neonSign: `<linearGradient id="sign" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6EC7FF"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`
  }

  return iconSvg(`<g>${map[kind] ?? ''}</g>`, defs[kind] ?? '')
}

function accessoryIcon(kind: string) {
  if (kind === 'flowerCrown') {
    return iconSvg(
      `<g>
        <path d="M30 70c10-14 20-20 30-20s20 6 30 20" fill="none" stroke="${NAVY}" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
        <circle cx="40" cy="64" r="8" fill="${PINK}" stroke="${NAVY}" stroke-width="4"/><circle cx="40" cy="64" r="3" fill="${GOLD}"/>
        <circle cx="60" cy="56" r="8" fill="#FF6B6B" stroke="${NAVY}" stroke-width="4"/><circle cx="60" cy="56" r="3" fill="${GOLD}"/>
        <circle cx="80" cy="64" r="8" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/><circle cx="80" cy="64" r="3" fill="${GOLD}"/>
      </g>`
    )
  }
  if (kind === 'astronautHelmet') {
    return iconSvg(
      `<g>
        <path d="M36 70c0-18 12-32 24-32s24 14 24 32c0 18-12 34-24 34s-24-16-24-34Z" fill="#DDE6FF" stroke="${NAVY}" stroke-width="4"/>
        <path d="M42 70c0-12 8-22 18-22s18 10 18 22-8 22-18 22-18-10-18-22Z" fill="#141428" stroke="${NAVY}" stroke-width="4"/>
        <path d="M46 70c6 8 12 10 14 10 8 0 14-6 18-18" fill="none" stroke="#6EC7FF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
        <path d="M30 70h12" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
        <path d="M78 70h12" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
      </g>`
    )
  }

  const map: Record<string, string> = {
    tinyGraduationCap: `<path d="M26 62l34-16 34 16-34 16-34-16Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 70v12c8 6 20 6 28 0V70" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M86 64v16" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/><circle cx="86" cy="84" r="4" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    starGlasses: `<path d="M34 66c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18Z" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/><path d="M68 66c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18Z" fill="#B9A8FF" stroke="${NAVY}" stroke-width="4"/><path d="M52 66h16" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><path d="M60 46l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1 3-6Z" fill="${GOLD}" opacity="0.9"/>`,
    tinyScarf: `<path d="M34 60c10 10 22 14 38 14 8 0 14-2 14-8 0-8-10-14-24-14-10 0-18 2-28 8Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 74l-8 18" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><path d="M60 76l-4 18" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.9"/>`,
    partyHat: `<path d="M40 92l20-44 20 44H40Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M52 70l16-8" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/><path d="M48 82l24-12" stroke="#6EC7FF" stroke-width="6" stroke-linecap="round" opacity="0.85"/><circle cx="60" cy="44" r="6" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    crown: `<path d="M34 82l6-26 14 16 10-22 10 22 14-16 6 26H34Z" fill="${GOLD}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="40" cy="58" r="4" fill="#FF6B6B" stroke="${NAVY}" stroke-width="4"/><circle cx="60" cy="50" r="4" fill="#6EC7FF" stroke="${NAVY}" stroke-width="4"/><circle cx="80" cy="58" r="4" fill="#7AE7B9" stroke="${NAVY}" stroke-width="4"/>`,
    bowTie: `<path d="M44 68c-10-10-14-18-12-24 2-6 12-6 26 6 14-12 24-12 26-6 2 6-2 14-12 24 10 10 14 18 12 24-2 6-12 6-26-6-14 12-24 12-26 6-2-6 2-14 12-24Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="68" r="8" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    sunglasses: `<path d="M34 66c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18Z" fill="#0A0A1A" stroke="${GOLD}" stroke-width="4"/><path d="M68 66c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18Z" fill="#0A0A1A" stroke="${GOLD}" stroke-width="4"/><path d="M52 66h16" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>`,
    wizardHat: `<path d="M38 92c10-8 20-12 32-12s22 4 32 12c-10 6-20 8-32 8s-22-2-32-8Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" opacity="0.9"/><path d="M44 82c10-26 16-42 18-50 2-8 6-10 12-6 6 4 2 12-8 24 12 10 18 20 18 30-16 6-28 6-40 2Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M64 44l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1 3-6Z" fill="${GOLD}" opacity="0.9"/>`,
    santaHat: `<path d="M34 78c6-28 22-40 48-38 6 0 10 2 12 6-10 6-16 14-18 24" fill="#FF4D6D" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M30 78h60c6 0 10 4 10 10s-4 10-10 10H30c-6 0-10-4-10-10s4-10 10-10Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="4"/><circle cx="88" cy="44" r="10" fill="#FFFFFF" stroke="${NAVY}" stroke-width="4"/>`,
    halo: `<ellipse cx="60" cy="56" rx="28" ry="12" fill="none" stroke="${GOLD}" stroke-width="8"/><ellipse cx="60" cy="56" rx="20" ry="7" fill="none" stroke="#FFE59A" stroke-width="4" opacity="0.9"/><path d="M42 72c8 10 16 14 18 14 10 0 18-6 18-14" fill="none" stroke="${PINK}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`,
    devilHorns: `<path d="M42 86c-10-24-10-40 0-50 10 10 14 22 12 38" fill="#FF4D6D" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M78 86c10-24 10-40 0-50-10 10-14 22-12 38" fill="#FF4D6D" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M44 76c10 8 22 8 32 0" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`,
    graduationCap: `<path d="M22 64l38-18 38 18-38 18-38-18Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 74v12c10 8 24 8 28 0V74" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M92 66v18" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/><circle cx="92" cy="88" r="5" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    topHat: `<path d="M38 86c-10-4-16-10-16-18 14-4 28-6 38-6s24 2 38 6c0 8-6 14-16 18-14 4-30 4-44 0Z" fill="${GOLD}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 62V40c0-6 6-10 14-10s14 4 14 10v22" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 54h28" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`,
    pirateHat: `<path d="M24 72c10-18 22-26 36-26s26 8 36 26c-12 10-24 14-36 14S36 82 24 72Z" fill="#141428" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M28 72h64" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><circle cx="54" cy="76" r="3" fill="#FFFFFF" opacity="0.75"/><circle cx="66" cy="76" r="3" fill="#FFFFFF" opacity="0.75"/>`,
    angelWings: `<path d="M36 74c-10-14-12-26-6-36 12 4 20 14 24 30-6 4-12 6-18 6Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M84 74c10-14 12-26 6-36-12 4-20 14-24 30 6 4 12 6 18 6Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M46 70c6-10 10-14 14-14s8 4 14 14" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`,
    cape: `<path d="M44 44c8 8 12 10 16 10s8-2 16-10c6 10 10 20 10 30 0 20-10 32-26 32S34 94 34 74c0-10 4-20 10-30Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M60 54v54" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.75"/><circle cx="60" cy="54" r="5" fill="${GOLD}" stroke="${NAVY}" stroke-width="4"/>`,
    backpack: `<path d="M44 96c-10 0-18-8-18-18V60c0-14 10-26 24-26h20c14 0 24 12 24 26v18c0 10-8 18-18 18H44Z" fill="${PINK}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M42 58c0-10 8-18 18-18s18 8 18 18" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><rect x="42" y="70" width="36" height="20" rx="10" fill="#141428" stroke="${NAVY}" stroke-width="4"/><circle cx="60" cy="80" r="3" fill="${GOLD}" opacity="0.9"/>`
  }
  if (map[kind]) return iconSvg(`<g>${map[kind]}</g>`)
  return accessoryIcon('flowerCrown')
}

function colourIcon(colourKey: string) {
  const stops: Record<string, [string, string]> = {
    pink: [PINK, '#FFB6C8'],
    blue: ['#6EC7FF', '#3A86FF'],
    purple: ['#C77DFF', '#7C5CFF'],
    green: ['#7AE7B9', '#2EE59D'],
    golden: [GOLD, '#FFE59A'],
    rainbow: ['#FF6B6B', '#7AE7B9'],
    midnight: ['#2A2A4A', NAVY],
    albino: ['#FFFFFF', '#DDE6FF'],
    spotted: ['#FFB6C8', PINK],
    striped: ['#6EC7FF', '#B9A8FF'],
    galaxy: ['#7C5CFF', '#1B1B6B'],
    sakura: [PINK, '#FFD1DC'],
    cherry: [PINK, '#FFD1DC']
  }
  const [c1, c2] = stops[colourKey] ?? stops.pink
  return iconSvg(
    `<g>
      <path d="M40 72c0-16 12-28 26-28s26 12 26 28c0 18-12 32-26 32S40 90 40 72Z" fill="url(#ax)" stroke="${NAVY}" stroke-width="4"/>
      <path d="M40 68c-10-6-16-14-18-26 14 2 22 8 26 18" fill="url(#ax)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" opacity="0.9"/>
      <path d="M92 68c10-6 16-14 18-26-14 2-22 8-26 18" fill="url(#ax)" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" opacity="0.9"/>
      <circle cx="54" cy="70" r="3" fill="${colourKey === 'midnight' ? '#FFFFFF' : NAVY}" opacity="0.9"/>
      <circle cx="66" cy="70" r="3" fill="${colourKey === 'midnight' ? '#FFFFFF' : NAVY}" opacity="0.9"/>
      <path d="M54 80c4 6 8 6 12 0" fill="none" stroke="${colourKey === 'golden' ? GOLD : NAVY}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      ${colourKey === 'spotted' ? `<circle cx="56" cy="60" r="4" fill="#2A2A4A" opacity="0.45"/><circle cx="70" cy="76" r="4" fill="#2A2A4A" opacity="0.45"/><circle cx="62" cy="86" r="3" fill="#2A2A4A" opacity="0.35"/>` : ''}
      ${colourKey === 'striped' ? `<path d="M48 60h40" stroke="${NAVY}" stroke-width="5" stroke-linecap="round" opacity="0.35"/><path d="M46 72h44" stroke="${NAVY}" stroke-width="5" stroke-linecap="round" opacity="0.35"/><path d="M48 84h40" stroke="${NAVY}" stroke-width="5" stroke-linecap="round" opacity="0.35"/>` : ''}
      ${colourKey === 'galaxy' ? `<circle cx="44" cy="56" r="3" fill="#FFFFFF" opacity="0.35"/><circle cx="76" cy="54" r="3" fill="#FFFFFF" opacity="0.25"/><circle cx="62" cy="86" r="3" fill="${GOLD}" opacity="0.6"/>` : ''}
      ${colourKey === 'rainbow' ? `<circle cx="44" cy="56" r="3" fill="#FFFFFF" opacity="0.25"/><circle cx="76" cy="54" r="3" fill="#FFFFFF" opacity="0.25"/>` : ''}
    </g>`,
    `<linearGradient id="ax" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`
  )
}

export const shopCatalog: ShopCatalogItem[] = [
  { id: id(0x01), name: 'Pellets', type: 'food', cost: 5, image_url: foodIcon('pellets'), is_premium: false, is_seasonal: false, meta: { happiness: 5, hunger: 8 } },
  { id: id(0x02), name: 'Bloodworms', type: 'food', cost: 12, image_url: foodIcon('bloodworms'), is_premium: false, is_seasonal: false, meta: { happiness: 10, hunger: 14 } },
  { id: id(0x03), name: 'Brine shrimp', type: 'food', cost: 15, image_url: foodIcon('brineShrimp'), is_premium: false, is_seasonal: false, meta: { happiness: 12, hunger: 16 } },
  { id: id(0x04), name: 'Daphnia', type: 'food', cost: 18, image_url: foodIcon('daphnia'), is_premium: false, is_seasonal: false, meta: { happiness: 14, hunger: 18 } },
  { id: id(0x05), name: 'Tubifex worms', type: 'food', cost: 22, image_url: foodIcon('tubifex'), is_premium: false, is_seasonal: false, meta: { happiness: 16, hunger: 20 } },
  { id: id(0x06), name: 'Snail', type: 'food', cost: 28, image_url: foodIcon('snail'), is_premium: false, is_seasonal: false, meta: { happiness: 18, hunger: 22 } },
  { id: id(0x07), name: 'Mini crab', type: 'food', cost: 32, image_url: foodIcon('miniCrab'), is_premium: false, is_seasonal: false, meta: { happiness: 20, hunger: 24 } },
  { id: id(0x08), name: 'Water flea', type: 'food', cost: 10, image_url: foodIcon('daphnia'), is_premium: false, is_seasonal: false, meta: { happiness: 8, hunger: 12 } },
  { id: id(0x09), name: 'Algae wafer', type: 'food', cost: 14, image_url: foodIcon('algaeWafer'), is_premium: false, is_seasonal: false, meta: { happiness: 10, hunger: 14 } },
  { id: id(0x0a), name: 'Shrimp', type: 'food', cost: 26, image_url: foodIcon('brineShrimp'), is_premium: false, is_seasonal: false, meta: { happiness: 18, hunger: 22 } },
  { id: id(0x0b), name: 'Tadpole', type: 'food', cost: 30, image_url: foodIcon('tadpole'), is_premium: false, is_seasonal: false, meta: { happiness: 20, hunger: 26 } },
  { id: id(0x0c), name: 'Earthworm', type: 'food', cost: 34, image_url: foodIcon('tubifex'), is_premium: false, is_seasonal: false, meta: { happiness: 22, hunger: 28 } },
  { id: id(0x0d), name: 'Feeder fish', type: 'food', cost: 38, image_url: foodIcon('feederFish'), is_premium: false, is_seasonal: false, meta: { happiness: 24, hunger: 32 } },
  { id: id(0x0e), name: 'Mystery snack', type: 'food', cost: 45, image_url: foodIcon('mystery'), is_premium: false, is_seasonal: true, meta: { happiness: 30, hunger: 36 } },
  { id: id(0x0f), name: 'Golden apple', type: 'food', cost: 60, image_url: foodIcon('goldenApple'), is_premium: false, is_seasonal: false, meta: { happiness: 40, hunger: 44 } },
  { id: id(0x10), name: 'Birthday cake slice', type: 'food', cost: 80, image_url: foodIcon('cake'), is_premium: false, is_seasonal: true, meta: { happiness: 55, hunger: 55 } },
  { id: id(0x41), name: 'Watermelon slice', type: 'food', cost: 22, image_url: foodIcon('watermelon'), is_premium: false, is_seasonal: true, meta: { happiness: 16, hunger: 18 } },
  { id: id(0x42), name: 'Strawberry', type: 'food', cost: 18, image_url: foodIcon('strawberry'), is_premium: false, is_seasonal: true, meta: { happiness: 14, hunger: 16 } },
  { id: id(0x43), name: 'Donut', type: 'food', cost: 40, image_url: foodIcon('donut'), is_premium: false, is_seasonal: true, meta: { happiness: 26, hunger: 28 } },
  { id: id(0x44), name: 'Sushi roll', type: 'food', cost: 45, image_url: foodIcon('sushi'), is_premium: false, is_seasonal: false, meta: { happiness: 30, hunger: 32 } },
  { id: id(0x11), name: 'Extra plant', type: 'decoration', cost: 15, image_url: decorationIcon('extraPlant'), is_premium: false, is_seasonal: false },
  { id: id(0x12), name: 'Fairy lights', type: 'decoration', cost: 25, image_url: decorationIcon('fairyLights'), is_premium: false, is_seasonal: true },
  { id: id(0x13), name: 'Little desk', type: 'decoration', cost: 35, image_url: decorationIcon('littleDesk'), is_premium: false, is_seasonal: false },
  { id: id(0x14), name: 'Bookshelf', type: 'decoration', cost: 45, image_url: decorationIcon('bookshelf'), is_premium: false, is_seasonal: false },
  { id: id(0x15), name: 'Disco ball', type: 'decoration', cost: 70, image_url: decorationIcon('discoBall'), is_premium: false, is_seasonal: true },
  { id: id(0x16), name: 'Treasure chest', type: 'decoration', cost: 90, image_url: decorationIcon('treasureChest'), is_premium: false, is_seasonal: false },
  { id: id(0x17), name: 'Coral', type: 'decoration', cost: 40, image_url: decorationIcon('coral'), is_premium: false, is_seasonal: false },
  { id: id(0x18), name: 'Seaweed', type: 'decoration', cost: 35, image_url: decorationIcon('seaweed'), is_premium: false, is_seasonal: false },
  { id: id(0x19), name: 'Castle', type: 'decoration', cost: 120, image_url: decorationIcon('castle'), is_premium: false, is_seasonal: false },
  { id: id(0x1a), name: 'Sunken ship', type: 'decoration', cost: 130, image_url: decorationIcon('sunkenShip'), is_premium: false, is_seasonal: false },
  { id: id(0x1b), name: 'Rubber duck', type: 'decoration', cost: 30, image_url: decorationIcon('rubberDuck'), is_premium: false, is_seasonal: false },
  { id: id(0x1c), name: 'Mini volcano', type: 'decoration', cost: 110, image_url: decorationIcon('miniVolcano'), is_premium: false, is_seasonal: false },
  { id: id(0x1d), name: 'Crystal cave', type: 'decoration', cost: 150, image_url: decorationIcon('crystalCave'), is_premium: true, is_seasonal: false },
  { id: id(0x1e), name: 'Rainbow arch', type: 'decoration', cost: 140, image_url: decorationIcon('rainbowArch'), is_premium: true, is_seasonal: false },
  { id: id(0x1f), name: 'Mushroom house', type: 'decoration', cost: 125, image_url: decorationIcon('mushroomHouse'), is_premium: false, is_seasonal: false },
  { id: id(0x20), name: 'Lantern', type: 'decoration', cost: 60, image_url: decorationIcon('lantern'), is_premium: false, is_seasonal: false },
  { id: id(0x45), name: 'Starfish', type: 'decoration', cost: 35, image_url: decorationIcon('starfish'), is_premium: false, is_seasonal: false },
  { id: id(0x46), name: 'Giant pearl', type: 'decoration', cost: 95, image_url: decorationIcon('giantPearl'), is_premium: false, is_seasonal: false },
  { id: id(0x47), name: 'Wizard tower', type: 'decoration', cost: 150, image_url: decorationIcon('wizardTower'), is_premium: true, is_seasonal: false },
  { id: id(0x48), name: 'Neon sign', type: 'decoration', cost: 140, image_url: decorationIcon('neonSign'), is_premium: true, is_seasonal: false },
  { id: id(0x21), name: 'Tiny graduation cap', type: 'accessory', cost: 30, image_url: accessoryIcon('tinyGraduationCap'), is_premium: false, is_seasonal: false },
  { id: id(0x22), name: 'Star glasses', type: 'accessory', cost: 25, image_url: accessoryIcon('starGlasses'), is_premium: false, is_seasonal: false },
  { id: id(0x23), name: 'Flower crown', type: 'accessory', cost: 35, image_url: accessoryIcon('flowerCrown'), is_premium: false, is_seasonal: true },
  { id: id(0x24), name: 'Tiny scarf', type: 'accessory', cost: 20, image_url: accessoryIcon('tinyScarf'), is_premium: false, is_seasonal: false },
  { id: id(0x25), name: 'Astronaut helmet', type: 'accessory', cost: 150, image_url: accessoryIcon('astronautHelmet'), is_premium: true, is_seasonal: false },
  { id: id(0x26), name: 'Party hat', type: 'accessory', cost: 40, image_url: accessoryIcon('partyHat'), is_premium: false, is_seasonal: true },
  { id: id(0x27), name: 'Crown', type: 'accessory', cost: 200, image_url: accessoryIcon('crown'), is_premium: true, is_seasonal: false },
  { id: id(0x28), name: 'Bow tie', type: 'accessory', cost: 60, image_url: accessoryIcon('bowTie'), is_premium: false, is_seasonal: false },
  { id: id(0x29), name: 'Sunglasses', type: 'accessory', cost: 80, image_url: accessoryIcon('sunglasses'), is_premium: false, is_seasonal: false },
  { id: id(0x2a), name: 'Wizard hat', type: 'accessory', cost: 120, image_url: accessoryIcon('wizardHat'), is_premium: false, is_seasonal: false },
  { id: id(0x2b), name: 'Santa hat', type: 'accessory', cost: 110, image_url: accessoryIcon('santaHat'), is_premium: false, is_seasonal: true },
  { id: id(0x2c), name: 'Halo', type: 'accessory', cost: 160, image_url: accessoryIcon('halo'), is_premium: true, is_seasonal: false },
  { id: id(0x2d), name: 'Devil horns', type: 'accessory', cost: 160, image_url: accessoryIcon('devilHorns'), is_premium: true, is_seasonal: false },
  { id: id(0x2e), name: 'Graduation cap', type: 'accessory', cost: 90, image_url: accessoryIcon('graduationCap'), is_premium: false, is_seasonal: false },
  { id: id(0x2f), name: 'Top hat', type: 'accessory', cost: 140, image_url: accessoryIcon('topHat'), is_premium: false, is_seasonal: false },
  { id: id(0x30), name: 'Pirate hat', type: 'accessory', cost: 140, image_url: accessoryIcon('pirateHat'), is_premium: false, is_seasonal: false },
  { id: id(0x49), name: 'Angel wings', type: 'accessory', cost: 180, image_url: accessoryIcon('angelWings'), is_premium: true, is_seasonal: false },
  { id: id(0x4a), name: 'Cape', type: 'accessory', cost: 120, image_url: accessoryIcon('cape'), is_premium: false, is_seasonal: false },
  { id: id(0x4b), name: 'Backpack', type: 'accessory', cost: 130, image_url: accessoryIcon('backpack'), is_premium: false, is_seasonal: false },
  { id: id(0x31), name: 'Golden', type: 'colour', cost: 150, image_url: colourIcon('golden'), is_premium: false, is_seasonal: false, meta: { colour: 'golden' } },
  { id: id(0x32), name: 'Galaxy', type: 'colour', cost: 350, image_url: colourIcon('galaxy'), is_premium: true, is_seasonal: false, meta: { colour: 'galaxy' } },
  { id: id(0x33), name: 'Rainbow', type: 'colour', cost: 400, image_url: colourIcon('rainbow'), is_premium: true, is_seasonal: false, meta: { colour: 'rainbow' } },
  { id: id(0x34), name: 'Cherry blossom', type: 'colour', cost: 300, image_url: colourIcon('cherry'), is_premium: true, is_seasonal: true, meta: { colour: 'cherry' } },
  { id: id(0x35), name: 'Midnight black', type: 'colour', cost: 220, image_url: colourIcon('midnight'), is_premium: false, is_seasonal: false, meta: { colour: 'midnight' } },
  { id: id(0x36), name: 'Pink (default)', type: 'colour', cost: 50, image_url: colourIcon('pink'), is_premium: false, is_seasonal: false, meta: { colour: 'pink' } },
  { id: id(0x37), name: 'Blue', type: 'colour', cost: 120, image_url: colourIcon('blue'), is_premium: false, is_seasonal: false, meta: { colour: 'blue' } },
  { id: id(0x38), name: 'Purple', type: 'colour', cost: 140, image_url: colourIcon('purple'), is_premium: false, is_seasonal: false, meta: { colour: 'purple' } },
  { id: id(0x39), name: 'Green', type: 'colour', cost: 140, image_url: colourIcon('green'), is_premium: false, is_seasonal: false, meta: { colour: 'green' } },
  { id: id(0x3a), name: 'Albino white', type: 'colour', cost: 260, image_url: colourIcon('albino'), is_premium: false, is_seasonal: false, meta: { colour: 'albino' } },
  { id: id(0x3b), name: 'Spotted', type: 'colour', cost: 280, image_url: colourIcon('spotted'), is_premium: true, is_seasonal: false, meta: { colour: 'spotted' } },
  { id: id(0x3c), name: 'Striped', type: 'colour', cost: 280, image_url: colourIcon('striped'), is_premium: true, is_seasonal: false, meta: { colour: 'striped' } },
  { id: id(0x3d), name: 'Sakura', type: 'colour', cost: 320, image_url: colourIcon('sakura'), is_premium: true, is_seasonal: true, meta: { colour: 'sakura' } }
]

export function tabLabel(type: ShopItemType) {
  if (type === 'food') return 'Food'
  if (type === 'decoration') return 'Decorations'
  if (type === 'accessory') return 'Accessories'
  return 'Colour changes'
}
