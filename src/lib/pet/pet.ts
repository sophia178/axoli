import { getSupabaseAdmin } from '@/lib/supabase/admin'

function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(fromISO: string, toISO: string) {
  const from = new Date(`${fromISO}T00:00:00.000Z`)
  const to = new Date(`${toISO}T00:00:00.000Z`)
  const diff = to.getTime() - from.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export async function applyPetDailyDecay(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('pet_happiness,pet_last_updated')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return null
    const today = toISODate(new Date())
    const last = (data as any)?.pet_last_updated as string | null
    const base = (data as any)?.pet_happiness as number | null

    const lastISO = last ?? today
    const current = base ?? 100
    const days = daysBetween(lastISO, today)
    if (days <= 0) return { happiness: Math.max(0, Math.min(100, current)), updated: false }

    const decayed = clamp(current - days * 10, 0, 100)
    await supabase
      .from('profiles')
      .update({ pet_happiness: decayed, pet_last_updated: today })
      .eq('user_id', userId)

    return { happiness: decayed, updated: true }
  } catch {
    return null
  }
}

export async function applyPetHungerDecay(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('hunger_level,last_fed_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return null

    const now = new Date()
    const base = (data as any)?.hunger_level as number | null
    const lastFed = (data as any)?.last_fed_at as string | null
    if (!lastFed || base === null || typeof base !== 'number') {
      const initLevel = 100
      await supabase
        .from('profiles')
        .update({ hunger_level: initLevel, last_fed_at: now.toISOString() })
        .eq('user_id', userId)
      return { hunger: initLevel, updated: true }
    }

    const last = new Date(lastFed)
    const stepMs = 4 * 60 * 60 * 1000
    const steps = Math.floor((now.getTime() - last.getTime()) / stepMs)
    if (steps <= 0) return { hunger: clamp(base, 0, 100), updated: false }

    const decayed = clamp(base - steps * 5, 0, 100)
    const advanced = new Date(last.getTime() + steps * stepMs)

    await supabase
      .from('profiles')
      .update({ hunger_level: decayed, last_fed_at: advanced.toISOString() })
      .eq('user_id', userId)

    return { hunger: decayed, updated: true }
  } catch {
    return null
  }
}

export async function changePetHappiness(userId: string, delta: number) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return 100
    const applied = await applyPetDailyDecay(userId)
    const current = applied?.happiness ?? 100
    const next = clamp(current + delta, 0, 100)
    const today = toISODate(new Date())
    await supabase
      .from('profiles')
      .update({ pet_happiness: next, pet_last_updated: today })
      .eq('user_id', userId)
    return next
  } catch {
    return 100
  }
}

export async function changePetHunger(userId: string, delta: number) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return 100
    const applied = await applyPetHungerDecay(userId)
    const current = applied?.hunger ?? 100
    const next = clamp(current + delta, 0, 100)
    await supabase
      .from('profiles')
      .update({ hunger_level: next, last_fed_at: new Date().toISOString() })
      .eq('user_id', userId)
    return next
  } catch {
    return 100
  }
}

export async function ensurePetFields(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return
    const today = toISODate(new Date())
    await supabase
      .from('profiles')
      .update({
        pet_happiness: 100,
        pet_last_updated: today,
        hunger_level: 100,
        last_fed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .or('pet_last_updated.is.null,hunger_level.is.null,last_fed_at.is.null')
  } catch {
    return
  }
}
