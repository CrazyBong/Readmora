import { createSupabaseAdminClient } from '../src/lib/supabase/admin';
import type { Profile } from '../src/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

const PAGE_SIZE = 500;
type AuditProfile = Pick<Profile, 'id' | 'username' | 'books_count'>;

async function callAuditRpc(
  client: ReturnType<typeof createSupabaseAdminClient>,
  fn: string
): Promise<{ error: PostgrestError | null }> {
  return client.rpc(fn as never) as unknown as Promise<{ error: PostgrestError | null }>;
}

async function markProfileDirty(
  client: ReturnType<typeof createSupabaseAdminClient>,
  profileId: string
): Promise<void> {
  const profilesTable = client.from('profiles') as unknown as {
    update: (values: { needs_recount: boolean }) => {
      eq: (column: 'id', value: string) => Promise<{ error: PostgrestError | null }>;
    };
  };

  await profilesTable.update({ needs_recount: true }).eq('id', profileId);
}

/**
 * Data Integrity Audit Script
 * Compares denormalized profiles.books_count against actual COUNT(shelf_entries).
 * Logs mismatches and triggers reconciliation only for profiles that drifted.
 */
async function runAudit() {
  const supabase = createSupabaseAdminClient();
  console.log('Starting Data Integrity Audit: Shelf Counts...');

  let totalMismatches = 0;
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, books_count')
      .order('id', { ascending: true })
      .range(from, to)
      .returns<AuditProfile[]>();

    if (error) {
      console.error('Failed to fetch profiles:', error);
      process.exit(1);
    }

    if (!profiles || profiles.length === 0) {
      break;
    }

    for (const profile of profiles) {
      const { count, error: countError } = await supabase
        .from('shelf_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      if (countError) {
        console.error(`Error counting for ${profile.username || profile.id}:`, countError);
        continue;
      }

      if (count !== profile.books_count) {
        console.warn(`Mismatch found for ${profile.username || profile.id}:`);
        console.warn(`  Expected: ${profile.books_count} | Actual: ${count}`);
        totalMismatches += 1;

        await markProfileDirty(supabase, profile.id);
      }
    }

    if (profiles.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  if (totalMismatches > 0) {
    console.log(`\nAudit Complete: ${totalMismatches} mismatches discovered.`);
    console.log('Running healing process...');

    const { error: rpcError } = await callAuditRpc(supabase, 'reconcile_dirty_profiles');

    if (rpcError) {
      console.error('Healing failed:', rpcError);
    } else {
      console.log('All counts reconciled successfully.');
    }
    return;
  }

  console.log('\nAudit Complete: All counts are perfectly in sync.');
}

void runAudit();
