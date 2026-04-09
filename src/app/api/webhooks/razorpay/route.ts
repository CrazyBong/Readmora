import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay payment events. Verifies HMAC signature before processing.
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId, context: 'razorpay-webhook' });

  try {
    const admin = createSupabaseAdminClient();
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
        return NextResponse.json({ received: true });
      }

      const logContext = { paymentId, userId };

      // ── 3. Atomic Idempotency + Processing ──────────────────
      // Note: subscriptions.razorpay_payment_id has a UNIQUE constraint.
      // We insert first to "claim" this payment atomically.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: subError } = await (admin.from('subscriptions') as any).insert({
        user_id: userId,
        razorpay_payment_id: paymentId,
        razorpay_subscription_id: payment?.subscription_id ?? null,
        plan: planNote === 'annual' ? 'annual' : 'monthly',
        amount_paise: payment?.amount ?? 0,
        status: 'captured',
      });

      if (subError) {
        // Code 23505 is Postgres unique_violation
        if (subError.code === '23505') {
          log.info(logContext, 'Event already processed (duplicate detected), skipping');
          return NextResponse.json({ received: true, duplicate: true });
        }
        log.error({ ...logContext, subError }, 'Failed to record subscription entry');
        throw subError; // Retry
      }

      // If we reached here, the insert was successful and we "own" this processing run.
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
        log.error(
          { ...logContext, profileError },
          'Critical: Subscription logged but profile update failed'
        );
        // NOTE: In a perfect world, this would be a single transaction.
        // Since we insert into subscriptions first, we can at least detect partial failures
        // manually or via a cleanup job. We throw here to force a retry.
        throw profileError;
      }

      log.info({ ...logContext, plan }, 'Razorpay: subscription activated successfully');
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Unhandled exception in Razorpay webhook handler');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
