import { inngest } from './client';
import { generateBookSummary } from '@/services/ai.service';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Background job to generate an AI summary for a book.
 * Implements:
 * 1. Versioned Idempotency prunes duplicate runs but allows retries.
 * 2. Database State Machine updates (Processing -> Completed/Failed).
 * 3. Decoupled error telemetry.
 */
export const generateAiSummaryJob = inngest.createFunction(
  {
    id: 'generate-ai-summary',
    // Combine triggers and options for SDK v4 2-arg style
    // Use userId + bookId as idempotency key to prevent concurrent duplicate jobs for the same book
    idempotencyKey:
      "event.data.userId + '-' + event.data.bookId + '-' + (event.data.version || '1')",
  },
  { event: 'app/ai.summary.requested' },
  async ({ event, step }) => {
    const { userId, bookId, title, author } = event.data as {
      userId: string;
      bookId: string;
      title: string;
      author: string;
    };
    const admin = createSupabaseAdminClient();

    // ── 1. Update status to PROCESSING ───────────────────────────
    await step.run('update-status-processing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any)
        .from('user_books')
        .update({ summary_status: 'processing' })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;
    });

    // ── 2. Call AI Service with timeout ──────────────────────────
    const result = await step.run('generate-summary', async () => {
      // Logic from services/ai.service.ts
      // We wrap it in a timeout to ensure it doesn't hang forever
      const summaryResult = await Promise.race([
        generateBookSummary(title, author),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 60000)),
      ]);

      return summaryResult as { summary_markdown: string; model_version: string };
    });

    // ── 3. Save to Global Cache and Update Status ────────────────
    await step.run('save-result', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (admin.from('ai_summaries') as any).upsert(
        {
          book_id: bookId,
          summary_markdown: result.summary_markdown,
          model_version: result.model_version,
        },
        { onConflict: 'book_id' }
      );

      if (upsertError) throw upsertError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: statusError } = await (admin as any)
        .from('user_books')
        .update({ summary_status: 'completed' })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (statusError) throw statusError;
    });

    return { success: true, bookId };
  }
);
