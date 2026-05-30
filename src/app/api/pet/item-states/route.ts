import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })

  const { data, error } = await supabase
    .from('profiles')
    .select('pet_item_states')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json({ states: data.pet_item_states })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  if (!json || typeof json.states !== 'object' || json.states === null) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'missing_supabase_admin' }, { status: 500 })

  await supabase
    .from('profiles')
    .update({ pet_item_states: json.states })
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
