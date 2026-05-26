import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseAdmin(): SupabaseClient | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      console.error('[SupabaseAdmin] MISSING env vars — url:', !!url, 'serviceKey:', !!serviceKey, '— RLS will NOT be bypassed')
      return null
    }

    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  } catch (e) {
    console.error('[SupabaseAdmin] createClient failed:', e)
    return null
  }
}
