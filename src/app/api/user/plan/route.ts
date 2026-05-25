import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'
import { getUserPlan } from '@/lib/data/user'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const plan = await getUserPlan(user.id)
  return NextResponse.json({ ok: true, plan })
}

