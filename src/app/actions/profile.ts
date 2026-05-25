'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireUser } from '@/lib/auth/user'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  username: z.string().min(2).max(24)
})

export async function updateUsernameAction(formData: FormData) {
  const user = await requireUser()
  const parsed = schema.safeParse({ username: formData.get('username') })
  if (!parsed.success) redirect('/dashboard/settings?error=invalid_username')

  const supabase = getSupabaseAdmin()
  if (!supabase) redirect('/dashboard/settings?error=server_misconfigured')
  await supabase
    .from('profiles')
    .update({ username: parsed.data.username })
    .eq('user_id', user.id)

  redirect('/dashboard/settings?saved=1')
}
