import { createSupabaseAdminClient } from '../src/lib/supabase/admin';

/**
 * Data Integrity Audit Script
 * Compares denormalized profiles.books_count against actual COUNT(user_books).
 * Logs mismatches and provides a command to fix them.
 */
async function runAudit() {
  const supabase = createSupabaseAdminClient();
  console.log('🚀 Starting Data Integrity Audit: Shelf Counts...');

  // 1. Fetch all profiles where count might be drifting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles, error } = (await supabase
    .from('profiles')
    .select('id, username, books_count')) as any;

  if (error) {
    console.error('❌ Failed to fetch profiles:', error);
    process.exit(1);
  }

  let totalMismatches = 0;

  for (const profile of profiles as any[]) {
    // 2. Get actual count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: countError } = await (supabase.from('shelf_entries') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    if (countError) {
      console.error(`❌ Error counting for ${profile.username || profile.id}:`, countError);
      continue;
    }

    if (count !== profile.books_count) {
      console.warn(`⚠️ Mismatch found for ${profile.username || profile.id}:`);
      console.warn(`   Expected: ${profile.books_count} | Actual: ${count}`);
      totalMismatches++;

      // Mark as dirty so the reconciliation RPC can fix it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any).update({ needs_recount: true }).eq('id', profile.id);
    }
  }

  if (totalMismatches > 0) {
    console.log(`\n🚨 Audit Complete: ${totalMismatches} mismatches discovered.`);
    console.log('💡 Running healing process...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcError } = await (supabase as any).rpc('reconcile_dirty_profiles');

    if (rpcError) {
      console.error('❌ Healing failed:', rpcError);
    } else {
      console.log('✅ All counts reconciled successfully.');
    }
  } else {
    console.log('\n✨ Audit Complete: All counts are perfectly in sync.');
  }
}

runAudit();
