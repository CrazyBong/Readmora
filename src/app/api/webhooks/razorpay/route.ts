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

      // ── 3. Atomic Transaction via RPC ──────────────────────
      const plan = planNote === 'annual' ? 'annual' : 'monthly';
      const months = plan === 'annual' ? 12 : 1;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Using RPC ensures that the subscription log and profile update are coupled
      // in a single database transaction, preventing partial-failure bugs.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (admin as any).rpc('process_subscription', {
        p_user_id: userId,
        p_payment_id: paymentId,
        p_subscription_id: payment?.subscription_id ?? null,
        p_plan: plan,
        p_amount_paise: payment?.amount ?? 0,
        p_expires_at: expiresAt.toISOString(),
        p_customer_id: payment?.customer_id ?? null,
      });

      if (rpcError) {
        log.error({ ...logContext, rpcError }, 'RPC failed: process_subscription');
        throw rpcError; // Force retry for transient DB issues
      }

      const result = data as { success: boolean; duplicate?: boolean };
      if (result?.duplicate) {
        log.info(logContext, 'Idempotency catch: payment already processed in RPC');
        return NextResponse.json({ received: true, duplicate: true });
      }

      log.info({ ...logContext, plan }, 'Razorpay: subscription activated atomically via RPC');
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Unhandled exception in Razorpay webhook handler');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
