import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay payment events. Verifies HMAC signature before processing.
 */
export async function POST(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId, context: 'razorpay-webhook' });

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ?? '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      log.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
    }

    // ── 1. Verify HMAC signature ───────────────────────────────
    const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      log.warn({ signatureLength: sigBuf.length }, 'Invalid signature rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // ── 2. Parse event ─────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: { event: string; payload: Record<string, any> };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    log.info({ eventType: event.event }, 'Received Razorpay webhook');

    if (event.event === 'payment.captured') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment = (event.payload as { payment: { entity: any } })?.payment?.entity;
      const paymentId = payment?.id;
      const userId: string | undefined = payment?.notes?.user_id;
      const planNote: string | undefined = payment?.notes?.plan;

      if (!paymentId || !userId || !planNote) {
        log.warn({ paymentId, userId, planNote }, 'Razorpay webhook: missing required metadata');
        return NextResponse.json({ received: true }); // Fail open to stop retries on bad data
      }

      const logContext = { paymentId, userId };

      // ── 3. Idempotency Check ───────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (admin.from('subscriptions') as any)
        .select('id')
        .eq('razorpay_payment_id', paymentId)
        .maybeSingle();

      if (existing) {
        log.info(logContext, 'Event already processed, skipping');
        return NextResponse.json({ received: true, duplicate: true });
      }

      // ── 4. Activate Subscription ──────────────────────────
      const plan = planNote === 'annual' ? 'annual' : 'monthly';
      const months = plan === 'annual' ? 12 : 1;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (admin as any)
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: expiresAt.toISOString(),
          razorpay_customer_id: payment?.customer_id ?? null,
        })
        .eq('id', userId);

      if (profileError) {
        log.error({ ...logContext, profileError }, 'Failed to update profile subscription status');
        throw profileError; // Trigger retry if database update fails
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: subError } = await (admin as any).from('subscriptions').insert({
        user_id: userId,
        razorpay_payment_id: paymentId,
        razorpay_subscription_id: payment?.subscription_id ?? null,
        plan: plan as 'monthly' | 'annual',
        amount_paise: payment?.amount ?? 0,
        status: 'captured',
      });

      if (subError) {
        log.error({ ...logContext, subError }, 'Failed to log subscription entry');
        // If profile updated but subscription log failed, we still want to know
        throw subError;
      }

      log.info({ ...logContext, plan }, 'Razorpay: subscription activated successfully');
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Unhandled exception in Razorpay webhook handler');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
