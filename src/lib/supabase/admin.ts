import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client with service role privileges.
 * This client bypasses Row Level Security (RLS) policies.
 *
 * IMPORTANT: Only use this for server-side operations where RLS bypass is necessary,
 * such as querying user profiles immediately after authentication before the session
 * is fully established.
 *
 * Never expose this client to the browser or use it for user-initiated operations
 * that should respect RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
