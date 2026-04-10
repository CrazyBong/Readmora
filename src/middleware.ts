import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Next.js Middleware — runs at the edge before every matching request.
 * Responsibilities:
 * 1. Refresh the Supabase auth session (rotates tokens into cookies)
 * 2. Guard protected routes — redirect unauthenticated users to /login
 * 3. Guard onboarding — redirect users who haven't completed it
 * 4. Guard auth pages — redirect authenticated users away from /login
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not run any logic between this and the return
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Public routes that never need auth ──────────────────────────
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/health') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/v1/books/search') || // public book search
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  // ── Auth API routes (webhooks, etc.) bypass session guard ───────
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    return supabaseResponse;
  }

  // ── Helper to redirect while preserving Supabase session cookies & options ──────────
  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url);
    // Properly copy cookies with ALL options (httpOnly, secure, etc) to the new response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      });
    });
    return res;
  };

  // ── Not authenticated — redirect to login ───────────────────────
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Don't nest 'next' params if we are repeatedly bounced
    if (!request.nextUrl.searchParams.has('next')) {
      loginUrl.searchParams.set('next', pathname);
    }
    return redirectWithCookies(loginUrl);
  }

  // ── Authenticated users should not see the login page ───────────
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const nextPath = request.nextUrl.searchParams.get('next');
    let target = '/home';

    // Strict Open Redirect protection: use URL constructor to verify same origin
    if (nextPath) {
      // Security: Block protocol-relative URLs (e.g. //google.com) which can bypass some origin checks
      if (nextPath.startsWith('//')) {
        return redirectWithCookies(new URL('/home', request.url));
      }

      try {
        const url = new URL(nextPath, request.url);
        if (url.origin === request.nextUrl.origin) {
          target = url.pathname + url.search + url.hash;
        }
      } catch {
        // Invalid URL, fallback to /home
      }
    }

    return redirectWithCookies(new URL(target, request.url));
  }

  // ── Onboarding guard ─────────────────────────────────────────────
  if (user && !pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .maybeSingle();

    const profileData = profile as { onboarding_complete: boolean } | null;
    const isOnboardingComplete = profileData?.onboarding_complete ?? false;

    if (!isOnboardingComplete) {
      return redirectWithCookies(new URL('/onboarding', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
