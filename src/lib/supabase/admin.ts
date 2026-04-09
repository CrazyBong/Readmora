import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Admin Supabase client using the service role key.
 * BYPASSES all RLS policies.
 *
 * ONLY use in:
 * - Server-side API routes for privileged operations
 * - Rate limit writes (ai_usage)
 * - Subscription updates from webhooks
 * - Goodreads import batch upserts
 *
 * NEVER expose this client or the service role key to the browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
