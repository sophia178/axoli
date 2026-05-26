import { getSupabaseAdmin } from '@/lib/supabase/admin'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export async function applyPetHappinessDecay(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('pet_happiness,pet_last_updated,hunger_level')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return null
    const now = new Date()
    const base = (data as any)?.pet_happiness as number | null
    const lastUpdated = (data as any)?.pet_last_updated as string | null
    const hunger = Number((data as any)?.hunger_level ?? 100)

    if (base === null || typeof base !== 'number' || !lastUpdated) {
      const initHappiness = clamp(typeof base === 'number' ? base : 100, 0, 100)
      await supabase
        .from('profiles')
        .update({ pet_happiness: initHappiness, pet_last_updated: now.toISOString() })
        .eq('user_id', userId)
      return { happiness: initHappiness, updated: true }
    }

    const last = new Date(lastUpdated)
    const stepMs = 3 * 60 * 60 * 1000
    const diffMs = now.getTime() - last.getTime()
    if (!Number.isFinite(diffMs) || diffMs <= 0) {
      return { happiness: clamp(base, 0, 100), updated: false }
    }

    if (hunger >= 30) {
      if (diffMs < stepMs) return { happiness: clamp(base, 0, 100), updated: false }
      await supabase
        .from('profiles')
        .update({ pet_last_updated: now.toISOString() })
        .eq('user_id', userId)
      return { happiness: clamp(base, 0, 100), updated: true }
    }

    const steps = Math.floor(diffMs / stepMs)
    if (steps <= 0) return { happiness: clamp(base, 0, 100), updated: false }
    const decayed = clamp(base - steps * 2, 0, 100)
    const advanced = new Date(last.getTime() + steps * stepMs)

    await supabase
      .from('profiles')
      .update({ pet_happiness: decayed, pet_last_updated: advanced.toISOString() })
      .eq('user_id', userId)

    return { happiness: decayed, updated: true }
  } catch {
    return null
  }
}

export async function applyPetDailyDecay(userId: string) {
  return applyPetHappinessDecay(userId)
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
    const stepMs = 2 * 60 * 60 * 1000
    const steps = Math.floor((now.getTime() - last.getTime()) / stepMs)
    if (steps <= 0) return { hunger: clamp(base, 0, 100), updated: false }

    const decayed = clamp(base - steps * 3, 0, 100)
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
    const applied = await applyPetHappinessDecay(userId)
    const current = applied?.happiness ?? 100
    const next = clamp(current + delta, 0, 100)
    await supabase
      .from('profiles')
      .update({ pet_happiness: next, pet_last_updated: new Date().toISOString() })
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
    await supabase
      .from('profiles')
      .update({
        pet_happiness: 100,
        pet_last_updated: new Date().toISOString(),
        hunger_level: 100,
        last_fed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .or('pet_last_updated.is.null,hunger_level.is.null,last_fed_at.is.null')
  } catch {
    return
  }
}
