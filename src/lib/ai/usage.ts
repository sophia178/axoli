import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { awardCoins } from '@/lib/coins'

function monthKey(d = new Date()) {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

export async function consumeGeneration(userId: string, plan: string) {
  const supabase = getSupabaseAdmin()
  const key = monthKey()
  const limit = plan === 'free' ? 5 : 500

  const { data: usageRow } = await supabase
    .from('ai_usage')
    .select('id,count')
    .eq('user_id', userId)
    .eq('month', key)
    .maybeSingle()

  const used = usageRow?.count ?? 0
  if (used >= limit) {
    return { ok: false as const, remaining: 0, limit, used }
  }

  const { data: totalRow } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)

  const totalUsed = (totalRow ?? []).reduce((acc: number, r: any) => acc + (r.count ?? 0), 0)
  const firstTime = totalUsed === 0

  await supabase.from('ai_usage').upsert(
    {
      id: usageRow?.id,
      user_id: userId,
      month: key,
      count: used + 1
    },
    { onConflict: 'user_id,month' }
  )

  let coinsAwarded = 0
  if (firstTime) {
    await awardCoins(userId, 20, 'ai_first_use')
    coinsAwarded = 20
  }

  return {
    ok: true as const,
    remaining: Math.max(0, limit - (used + 1)),
    limit,
    used: used + 1,
    coinsAwarded
  }
}

