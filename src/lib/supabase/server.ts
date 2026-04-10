import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client for use in:
 * - React Server Components
 * - API Route Handlers
 * - Server Actions
 *
 * Uses the anon key with the user's JWT session from cookies.
 * RLS policies ARE enforced.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll may be called from a Server Component where cookies
            // cannot be set — this is safe to ignore if middleware handles refresh
          }
        },
      },
    }
  );
}
