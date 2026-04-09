import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { logger } from '@/lib/logger';

/**
 * GET /auth/callback
 * Handles the OAuth redirect from Supabase (Google, Apple, Email magic link).
 * Exchanges the PKCE code for a session and redirects to the correct page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors returned from provider
  if (error) {
    logger.warn({ error, errorDescription }, 'OAuth callback received an error');
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    logger.warn('OAuth callback missing code parameter');
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    logger.error({ err: exchangeError }, 'Failed to exchange code for session');
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Ensure redirect is to same origin (prevent open redirect)
  if (next.startsWith('/')) {
    return response;
  }

  return NextResponse.redirect(`${origin}/home`);
}
