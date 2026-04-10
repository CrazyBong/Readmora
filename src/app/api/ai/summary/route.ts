import { type NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getISOWeekStart, getNextWeekStart } from '@/services/ai.service';
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

  // ── 4. Check user rate limit profile ─────────────────────────
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

  // ── 5. Check global summary cache ────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cached } = await (admin.from('ai_summaries') as any)
    .select('summary_markdown, model_version')
    .eq('book_id', book_id)
    .maybeSingle();

  // ── 6. Enforce rate limit (Atomic via RPC) ────────────────────
  // We increment usage here. If it's already cached, it still counts as a use.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newUsageCount, error: rpcError } = await (admin as any).rpc('increment_ai_usage', {
    p_user_id: user.id,
    p_week_start: weekStart,
    p_max_limit: isPremium ? 999999 : FREE_LIMIT,
  });

  if (rpcError || newUsageCount === -1) {
    const used = newUsageCount === -1 ? FREE_LIMIT : usedThisWeek;
    if (newUsageCount === -1 || (rpcError && !isPremium && usedThisWeek >= FREE_LIMIT)) {
      return NextResponse.json<ApiResponse<RateLimitExceededResponse>>(
        {
          success: false,
          error: {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Weekly AI summary limit reached',
            details: {
              code: 'RATE_LIMIT_EXCEEDED',
              used: used,
              limit: FREE_LIMIT,
              resets_at: getNextWeekStart(),
              upgrade_required: true,
            },
          },
        },
        { status: 429 }
      );
    }
    // If RPC fails but we aren't sure about the limit, we'll log and continue for now (fail-open for UX, or fail-closed for cost)
    logger.error({ err: rpcError }, 'Atomic usage increment failed');
  }

  const finalUsageCount =
    typeof newUsageCount === 'number' && newUsageCount > 0 ? newUsageCount : usedThisWeek + 1;

  // ── 7. Check user_books status machine ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shelfEntry } = await (admin.from('user_books') as any)
    .select('summary_status')
    .eq('user_id', user.id)
    .eq('book_id', book_id)
    .maybeSingle();

  // ── 8. Return cached summary or queued status ────────────────
  if (cached) {
    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: cached.summary_markdown,
        cached: true,
        usage: {
          used: finalUsageCount,
          limit: isPremium ? Infinity : FREE_LIMIT,
          resets_at: getNextWeekStart(),
        },
      },
    });
  }

  if (shelfEntry?.summary_status === 'processing' || shelfEntry?.summary_status === 'pending') {
    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: '',
        cached: false,
        status: 'queued', // UI can use this to show loading/processing
        usage: {
          used: finalUsageCount,
          limit: isPremium ? Infinity : FREE_LIMIT,
          resets_at: getNextWeekStart(),
        },
      },
    });
  }

  // ── 9. Trigger Background Job via Inngest ─────────────────────
  try {
    const { inngest } = await import('@/lib/inngest/client');

    // Set status to PENDING in DB immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('user_books') as any)
      .update({ summary_status: 'pending' })
      .eq('user_id', user.id)
      .eq('book_id', book_id);

    await inngest.send({
      name: 'app/ai.summary.requested',
      data: {
        userId: user.id,
        bookId: book_id,
        title: book.title,
        author: book.author,
        version: '1', // Incremented if user manually retries or system forces regeneration
      },
    });

    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: '',
        cached: false,
        status: 'queued',
        usage: {
          used: finalUsageCount,
          limit: isPremium ? Infinity : FREE_LIMIT,
          resets_at: getNextWeekStart(),
        },
      },
    });
  } catch (err) {
    logger.error({ err, book_id }, 'Failed to enqueue AI summary job');
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Background worker failure. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
