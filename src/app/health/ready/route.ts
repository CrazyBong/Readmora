import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();

  let dbStatus: 'ok' | 'error' = 'ok';
  let cacheStatus: 'ok' | 'disabled' | 'error' = redis ? 'ok' : 'disabled';

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('profiles').select('id').limit(1);
    if (error) {
      dbStatus = 'error';
    }
  } catch {
    dbStatus = 'error';
  }

  if (redis) {
    try {
      await redis.get('__healthcheck__');
    } catch {
      cacheStatus = 'error';
    }
  }

  const isReady = dbStatus === 'ok' && cacheStatus !== 'error';

  return NextResponse.json(
    {
      status: isReady ? 'ok' : 'error',
      timestamp,
      db: dbStatus,
      cache: cacheStatus,
    },
    { status: isReady ? 200 : 503 }
  );
}
