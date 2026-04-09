-- Postgres RPC to handle Razorpay subscription activation atomically.
-- This ensures that the subscription record and profile update are coupled in a single transaction.

CREATE OR REPLACE FUNCTION process_subscription(
  p_user_id UUID,
  p_payment_id TEXT,
  p_subscription_id TEXT,
  p_plan TEXT,
  p_amount_paise INT,
  p_expires_at TIMESTAMPTZ,
  p_customer_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_id UUID;
BEGIN
  -- 1. Atomic Idempotency check via UNIQUE constraint on razorpay_payment_id
  INSERT INTO public.subscriptions (
    user_id,
    razorpay_payment_id,
    razorpay_subscription_id,
    plan,
    amount_paise,
    status
  )
  VALUES (
    p_user_id,
    p_payment_id,
    p_subscription_id,
    p_plan,
    p_amount_paise,
    'captured'
  )
  RETURNING id INTO v_sub_id;

  -- 2. Update profile (coupled with the insert)
  UPDATE public.profiles
  SET 
    subscription_status = 'premium',
    subscription_expires_at = p_expires_at,
    razorpay_customer_id = p_customer_id
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id
  );

EXCEPTION
  WHEN unique_violation THEN
    -- If the payment was already logged, it's a duplicate.
    -- We return success: true but with a duplicate flag so the logic can gracefully exit.
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true
    );
  WHEN OTHERS THEN
    -- Any other error (e.g. FK violation, constraint failure) triggers an exception
    -- which will cause the entire transaction to roll back and the RPC to return an error.
    RAISE EXCEPTION 'Failed to process subscription for user %: %', p_user_id, SQLERRM;
END;
$$;
