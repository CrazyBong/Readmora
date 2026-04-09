import { type NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateBookSummary, getISOWeekStart, getNextWeekStart } from '@/services/ai.service';
import {
  AiSummaryRequestSchema,
  ErrorCode,
  type ApiResponse,
  type AiSummaryResponse,
  type RateLimitExceededResponse,
} from '@/types/api';
import type { Database } from '@/types/database';
import { logger } from '@/lib/logger';

const FREE_LIMIT = 3;

export async function POST(request: NextRequest) {
  // ── 1. Authenticate user ──────────────────────────────────────
  const supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  // ── 2. Validate body ──────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = AiSummaryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid request body',
          details: parsed.error.issues,
        },
      },
      { status: 400 }
    );
  }
  const { book_id } = parsed.data;

  const admin = createSupabaseAdminClient();

  // ── 3. Fetch book metadata ────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: book } = await (admin.from('books') as any)
    .select('id, title, author')
    .eq('id', book_id)
    .maybeSingle();

  if (!book) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: ErrorCode.NOT_FOUND, message: 'Book not found' } },
      { status: 404 }
    );
  }

  // ── 4. Check global summary cache ────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cached } = await (admin.from('ai_summaries') as any)
    .select('summary_markdown, model_version')
    .eq('book_id', book_id)
    .maybeSingle();

  // ── 5. Check user rate limit ──────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin.from('profiles') as any)
    .select('subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .maybeSingle();

  const isPremium =
    profile?.subscription_status === 'premium' &&
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

  const weekStart = getISOWeekStart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: usage } = await (admin.from('ai_usage') as any)
    .select('usage_count')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle();

  const usedThisWeek = usage?.usage_count ?? 0;

  // ── 6. Enforce rate limit (free users, uncached books only count) ──
  if (!isPremium && usedThisWeek >= FREE_LIMIT) {
    return NextResponse.json<ApiResponse<RateLimitExceededResponse>>(
      {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Weekly AI summary limit reached',
          details: {
            code: 'RATE_LIMIT_EXCEEDED',
            used: usedThisWeek,
            limit: FREE_LIMIT,
            resets_at: getNextWeekStart(),
            upgrade_required: true,
          },
        },
      },
      { status: 429 }
    );
  }

  // ── 7. Return cached summary (still increments usage counter) ─
  if (cached) {
    // Increment usage even for cached summary (reading counts as a use)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('ai_usage') as any).upsert(
      { user_id: user.id, week_start: weekStart, usage_count: usedThisWeek + 1 },
      { onConflict: 'user_id,week_start' }
    );

    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: cached.summary_markdown,
        cached: true,
        usage: {
          used: usedThisWeek + 1,
          limit: isPremium ? Infinity : FREE_LIMIT,
          resets_at: getNextWeekStart(),
        },
      },
    });
  }

  // ── 8. Generate new summary via Gemini ────────────────────────
  try {
    const result = await generateBookSummary(book.title, book.author);

    // Cache globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('ai_summaries') as any).upsert(
      { book_id, summary_markdown: result.summary_markdown, model_version: result.model_version },
      { onConflict: 'book_id' }
    );

    // Increment usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('ai_usage') as any).upsert(
      { user_id: user.id, week_start: weekStart, usage_count: usedThisWeek + 1 },
      { onConflict: 'user_id,week_start' }
    );

    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: result.summary_markdown,
        cached: false,
        usage: {
          used: usedThisWeek + 1,
          limit: isPremium ? Infinity : FREE_LIMIT,
          resets_at: getNextWeekStart(),
        },
      },
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    logger.error(
      { err: isTimeout ? 'Gemini timeout' : err, book_id },
      'AI summary generation failed'
    );

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: ErrorCode.EXTERNAL_API_ERROR,
          message: isTimeout
            ? 'AI summary timed out. Please try again.'
            : 'Failed to generate AI summary. Please try again.',
        },
      },
      { status: 502 }
    );
  }
}
