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

    const decayed = Math.max(0, Math.min(100, current - days * 10))
    await supabase
      .from('profiles')
      .update({ pet_happiness: decayed, pet_last_updated: today })
      .eq('user_id', userId)

    return { happiness: decayed, updated: true }
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
    const next = Math.max(0, Math.min(100, current + delta))
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

export async function ensurePetFields(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return
    const today = toISODate(new Date())
    await supabase
      .from('profiles')
      .update({
        pet_happiness: 100,
        pet_last_updated: today
      })
      .eq('user_id', userId)
      .is('pet_last_updated', null)
  } catch {
    return
  }
}
