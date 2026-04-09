import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay payment events. Verifies HMAC signature before processing.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

  // ── 1. Verify HMAC signature ───────────────────────────────
  const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    logger.warn('Razorpay webhook: invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── 2. Parse event ─────────────────────────────────────────
  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (event.event === 'payment.captured') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = (event.payload as { payment: { entity: any } })?.payment?.entity;
    const userId: string | undefined = payment?.notes?.user_id;
    const planNote: string | undefined = payment?.notes?.plan;

    if (!userId || !planNote) {
      logger.warn({ payment }, 'Razorpay webhook: missing user_id or plan in notes');
      return NextResponse.json({ received: true });
    }

    const plan = planNote === 'annual' ? 'annual' : 'monthly';
    const months = plan === 'annual' ? 12 : 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('profiles')
      .update({
        subscription_status: 'premium',
        subscription_expires_at: expiresAt.toISOString(),
        razorpay_customer_id: payment?.customer_id ?? null,
      })
      .eq('id', userId);

    // Log subscription event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('subscriptions').insert({
      user_id: userId,
      razorpay_payment_id: payment?.id ?? '',
      razorpay_subscription_id: payment?.subscription_id ?? null,
      plan: plan as 'monthly' | 'annual',
      amount_paise: payment?.amount ?? 0,
      status: 'captured',
    });

    logger.info({ userId, plan }, 'Razorpay: subscription activated');
  }

  return NextResponse.json({ received: true });
}
