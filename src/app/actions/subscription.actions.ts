'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import type { SubscriptionPlan } from '@/types/database';
import { logger } from '@/lib/logger';

const PLANS = {
  monthly: 14900, // ₹149 in paise
  annual: 99900, // ₹999 in paise
};

export async function createRazorpayOrder(
  plan: SubscriptionPlan
): Promise<{ orderId: string } | { error: string }> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const amount = PLANS[plan];
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return { error: 'Payment not configured' };

  try {
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `readmora_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id: user.id, plan },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error({ err }, 'Razorpay order creation failed');
      return { error: 'Failed to create order. Please try again.' };
    }

    const order = await res.json();
    return { orderId: order.id };
  } catch (err) {
    logger.error({ err }, 'Razorpay order creation exception');
    return { error: 'Payment service unavailable. Please try again.' };
  }
}

export async function getCurrentUserProfile() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin.from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile };
}
