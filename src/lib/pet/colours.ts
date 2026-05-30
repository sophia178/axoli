// Shared axolotl colour palette — single source of truth used by both the
// shop swatches (lib/shop/catalog.ts) and the live pet (components/pet/AxolotlAvatar.tsx).

export const NAVY = '#0A0A1A'
export const PINK = '#FF8FAB'
export const GOLD = '#FFD700'

export type ColourStops = [string, string]

export const PET_COLOUR_STOPS: Record<string, ColourStops> = {
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

export function getColourStops(key: string | null | undefined): ColourStops {
  return PET_COLOUR_STOPS[key ?? 'pink'] ?? PET_COLOUR_STOPS.pink
}
