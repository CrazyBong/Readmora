import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import type { PostgrestError } from '@supabase/supabase-js';

import { FREE_AI_SUMMARY_LIMIT, PREMIUM_AI_SUMMARY_LIMIT } from '@/lib/ai-usage';
import { logger } from '@/lib/logger';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getISOWeekStart, getNextWeekStart } from '@/services/ai.service';
import {
  AiSummaryRequestSchema,
  ErrorCode,
  type AiSummaryResponse,
  type ApiResponse,
  type RateLimitExceededResponse,
} from '@/types/api';
import type { AiSummary, AiUsage, Database, Profile, ShelfEntry } from '@/types/database';

function buildUsage(isPremium: boolean, used: number) {
  return {
    used,
    limit: isPremium ? PREMIUM_AI_SUMMARY_LIMIT : FREE_AI_SUMMARY_LIMIT,
    resets_at: getNextWeekStart(),
  };
}

async function callAdminRpc<T>(
  client: ReturnType<typeof createSupabaseAdminClient>,
  fn: string,
  args: Record<string, unknown>
): Promise<{ data: T | null; error: PostgrestError | null }> {
  return client.rpc(fn as never, args as never) as unknown as Promise<{
    data: T | null;
    error: PostgrestError | null;
  }>;
}

async function updateShelfSummaryStatus(
  client: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  bookId: string,
  status: ShelfEntry['summary_status']
): Promise<{ data: { id: string } | null; error: PostgrestError | null }> {
  const shelfTable = client.from('shelf_entries') as unknown as {
    update: (values: { summary_status: ShelfEntry['summary_status'] }) => {
      eq: (
        column: 'user_id',
        value: string
      ) => {
        eq: (
          column: 'book_id',
          value: string
        ) => {
          select: (columns: 'id') => {
            maybeSingle: () => Promise<{
              data: { id: string } | null;
              error: PostgrestError | null;
            }>;
          };
        };
      };
    };
  };

  return shelfTable
    .update({ summary_status: status })
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .select('id')
    .maybeSingle();
}

export async function POST(request: NextRequest) {
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
      {
        success: false,
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' },
      },
      { status: 401 }
    );
  }

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

  const bookResult = await admin
    .from('books')
    .select('id, title, author')
    .eq('id', book_id)
    .maybeSingle();
  const book = bookResult.data as Pick<
    Database['public']['Tables']['books']['Row'],
    'id' | 'title' | 'author'
  > | null;

  if (!book) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: 'Book not found' },
      },
      { status: 404 }
    );
  }

  const profileResult = await admin
    .from('profiles')
    .select('subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .maybeSingle();
  const profile = profileResult.data as Pick<
    Profile,
    'subscription_status' | 'subscription_expires_at'
  > | null;

  const isPremium =
    profile?.subscription_status === 'premium' &&
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
  const usageLimit = isPremium ? PREMIUM_AI_SUMMARY_LIMIT : FREE_AI_SUMMARY_LIMIT;

  const weekStart = getISOWeekStart();
  const usageResult = await admin
    .from('ai_usage')
    .select('usage_count')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle();
  const usage = usageResult.data as Pick<AiUsage, 'usage_count'> | null;

  const usedThisWeek = usage?.usage_count ?? 0;

  const cachedResult = await admin
    .from('ai_summaries')
    .select('summary_markdown, model_version')
    .eq('book_id', book_id)
    .maybeSingle();
  const cached = cachedResult.data as Pick<AiSummary, 'summary_markdown' | 'model_version'> | null;

  const shelfEntryResult = await admin
    .from('shelf_entries')
    .select('summary_status')
    .eq('user_id', user.id)
    .eq('book_id', book_id)
    .maybeSingle();
  const shelfEntry = shelfEntryResult.data as Pick<ShelfEntry, 'summary_status'> | null;

  if (cached) {
    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: cached.summary_markdown,
        cached: true,
        usage: buildUsage(isPremium, usedThisWeek),
      },
    });
  }

  if (!shelfEntry) {
    const { error: ensureShelfError } = await callAdminRpc<boolean>(
      admin,
      'upsert_shelf_entry_and_sync_count',
      {
        p_user_id: user.id,
        p_book_id: book_id,
        p_shelf: 'want_to_read',
        p_rating: null,
        p_notes: null,
        p_started_at: null,
        p_finished_at: null,
      }
    );

    if (ensureShelfError) {
      logger.error(
        { ensureShelfError, book_id, userId: user.id },
        'Failed to ensure shelf entry before AI summary'
      );
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Unable to prepare this book for AI analysis. Please try again.',
          },
        },
        { status: 500 }
      );
    }
  }

  const currentShelfEntryResult = await admin
    .from('shelf_entries')
    .select('summary_status')
    .eq('user_id', user.id)
    .eq('book_id', book_id)
    .maybeSingle();
  const currentShelfEntry = currentShelfEntryResult.data as Pick<
    ShelfEntry,
    'summary_status'
  > | null;
  const shelfEntryError = currentShelfEntryResult.error;

  if (shelfEntryError) {
    logger.error({ shelfEntryError, book_id, userId: user.id }, 'Failed to read shelf entry state');
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Unable to inspect AI summary state. Please try again.',
        },
      },
      { status: 500 }
    );
  }

  if (
    currentShelfEntry?.summary_status === 'processing' ||
    currentShelfEntry?.summary_status === 'pending'
  ) {
    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: '',
        cached: false,
        status: 'queued',
        usage: buildUsage(isPremium, usedThisWeek),
      },
    });
  }

  const { data: newUsageCount, error: usageError } = await callAdminRpc<number>(
    admin,
    'increment_ai_usage',
    {
      p_user_id: user.id,
      p_week_start: weekStart,
      p_max_limit: usageLimit,
    }
  );

  if (usageError || newUsageCount === -1) {
    const used = newUsageCount === -1 ? usageLimit : usedThisWeek;

    if (newUsageCount === -1 || (usageError && usedThisWeek >= usageLimit)) {
      return NextResponse.json<ApiResponse<RateLimitExceededResponse>>(
        {
          success: false,
          error: {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Weekly AI summary limit reached',
            details: {
              code: 'RATE_LIMIT_EXCEEDED',
              used,
              limit: usageLimit,
              resets_at: getNextWeekStart(),
              upgrade_required: !isPremium,
            },
          },
        },
        { status: 429 }
      );
    }

    logger.error({ err: usageError, userId: user.id }, 'Atomic usage increment failed');
  }

  const finalUsageCount =
    typeof newUsageCount === 'number' && newUsageCount > 0 ? newUsageCount : usedThisWeek + 1;

  try {
    const { inngest } = await import('@/lib/inngest/client');

    const { data: pendingRow, error: pendingError } = await updateShelfSummaryStatus(
      admin,
      user.id,
      book_id,
      'pending'
    );

    if (pendingError || !pendingRow) {
      logger.error(
        { pendingError, book_id, userId: user.id },
        'Failed to set summary_status pending'
      );
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Unable to queue AI analysis right now. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    await inngest.send({
      name: 'app/ai.summary.requested',
      data: {
        userId: user.id,
        bookId: book_id,
        title: book.title,
        author: book.author,
        version: '1',
      },
    });

    return NextResponse.json<ApiResponse<AiSummaryResponse>>({
      success: true,
      data: {
        book_id,
        summary_markdown: '',
        cached: false,
        status: 'queued',
        usage: buildUsage(isPremium, finalUsageCount),
      },
    });
  } catch (error) {
    logger.error({ err: error, book_id, userId: user.id }, 'Failed to enqueue AI summary job');

    const { error: rollbackError } = await updateShelfSummaryStatus(admin, user.id, book_id, null);
    if (rollbackError) {
      logger.error(
        { rollbackError, book_id, userId: user.id },
        'Failed to roll back summary_status after enqueue failure'
      );
    }

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
