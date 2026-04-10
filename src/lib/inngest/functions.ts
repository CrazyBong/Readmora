import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateBookSummary } from '@/services/ai.service';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database, ShelfEntry } from '@/types/database';

import { inngest } from './client';

type AiSummaryRequestedEvent = {
  data: {
    userId: string;
    bookId: string;
    title: string;
    author: string;
    version?: string;
  };
};

type GenerateAiSummaryContext = {
  event: AiSummaryRequestedEvent;
  // Inngest step tools are runtime-provided; we keep this explicit until client-wide event/step schemas are added.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step: any;
};

async function updateShelfSummaryStatus(
  client: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  bookId: string,
  status: ShelfEntry['summary_status']
): Promise<{ error: PostgrestError | null }> {
  const shelfTable = client.from('shelf_entries') as unknown as {
    update: (values: { summary_status: ShelfEntry['summary_status'] }) => {
      eq: (
        column: 'user_id',
        value: string
      ) => {
        eq: (column: 'book_id', value: string) => Promise<{ error: PostgrestError | null }>;
      };
    };
  };

  return shelfTable.update({ summary_status: status }).eq('user_id', userId).eq('book_id', bookId);
}

async function upsertAiSummary(
  client: ReturnType<typeof createSupabaseAdminClient>,
  values: Database['public']['Tables']['ai_summaries']['Insert']
): Promise<{ error: PostgrestError | null }> {
  const summariesTable = client.from('ai_summaries') as unknown as {
    upsert: (
      summary: Database['public']['Tables']['ai_summaries']['Insert'],
      options: { onConflict: string }
    ) => Promise<{ error: PostgrestError | null }>;
  };

  return summariesTable.upsert(values, { onConflict: 'book_id' });
}

async function insertTaskLog(
  client: ReturnType<typeof createSupabaseAdminClient>,
  values: Database['public']['Tables']['ai_task_logs']['Insert']
): Promise<{ error: PostgrestError | null }> {
  const taskLogTable = client.from('ai_task_logs') as unknown as {
    insert: (
      log: Database['public']['Tables']['ai_task_logs']['Insert']
    ) => Promise<{ error: PostgrestError | null }>;
  };

  return taskLogTable.insert(values);
}

export const generateAiSummaryJob = inngest.createFunction(
  {
    id: 'generate-ai-summary',
    triggers: { event: 'app/ai.summary.requested' },
    idempotency: "event.data.userId + '-' + event.data.bookId + '-' + (event.data.version || '1')",
  },
  async ({ event, step }: GenerateAiSummaryContext) => {
    const { userId, bookId, title, author } = event.data;
    const admin = createSupabaseAdminClient();

    try {
      await step.run('update-status-processing', async () => {
        const { error } = await updateShelfSummaryStatus(admin, userId, bookId, 'processing');

        if (error) throw error;
      });

      const result = await step.run('generate-summary', async () => {
        const summaryResult = await Promise.race([
          generateBookSummary(title, author),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 60000)),
        ]);

        return summaryResult as { summary_markdown: string; model_version: string };
      });

      await step.run('save-result', async () => {
        const { error: upsertError } = await upsertAiSummary(admin, {
          book_id: bookId,
          summary_markdown: result.summary_markdown,
          model_version: result.model_version,
        });

        if (upsertError) throw upsertError;

        const { error: statusError } = await updateShelfSummaryStatus(
          admin,
          userId,
          bookId,
          'completed'
        );

        if (statusError) throw statusError;
      });

      return { success: true, bookId };
    } catch (error) {
      await step.run('mark-failed', async () => {
        const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

        await updateShelfSummaryStatus(admin, userId, bookId, 'failed');

        await insertTaskLog(admin, {
          user_id: userId,
          book_id: bookId,
          task_id: null,
          status: 'failed',
          error_message: errorMessage,
          metadata: {
            title,
            author,
          },
        });
      });

      throw error;
    }
  }
);
