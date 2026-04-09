-- Migration: 005_create_subscriptions.sql
-- Financial audit log — retained 7 years, not cascade-deleted with user

-- ─────────────────────────────────────────────
-- TABLE: subscriptions
-- NOTE: user_id uses ON DELETE SET NULL (not CASCADE).
-- Financial records must persist for 7 years per tax law,
-- even after account deletion.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable after account deletion (user data purged, record kept)
  user_id                  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- UNIQUE ensures idempotency: Razorpay retries won't create duplicates
  razorpay_payment_id      TEXT UNIQUE NOT NULL,
  razorpay_subscription_id TEXT UNIQUE,
  plan                     TEXT NOT NULL CHECK (plan IN ('monthly', 'annual')),
  amount_paise             INT  NOT NULL CHECK (amount_paise > 0),
  status                   TEXT NOT NULL
                           CHECK (status IN ('captured', 'failed', 'cancelled', 'refunded')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id        ON public.subscriptions(user_id);
-- NOTE: razorpay_payment_id and razorpay_subscription_id are UNIQUE, so indexes are redundant.
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id     ON public.subscriptions(razorpay_payment_id);
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.subscriptions(razorpay_subscription_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can see their own subscription history
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can write (webhook handler)
DROP POLICY IF EXISTS "subscriptions_service_role_all" ON public.subscriptions;
CREATE POLICY "subscriptions_service_role_all"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
