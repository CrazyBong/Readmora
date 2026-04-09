-- Atomic increment function for AI usage tracking
-- Prevents race conditions in rate-limit enforcement

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id uuid, p_week_start date, p_max_limit int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_usage int;
BEGIN
  -- 1. Ensure the row exists
  INSERT INTO ai_usage (user_id, week_start, usage_count)
  VALUES (p_user_id, p_week_start, 0)
  ON CONFLICT (user_id, week_start) DO NOTHING;

  -- 2. Select with lock to prevent concurrent increments passing the limit
  SELECT usage_count INTO v_current_usage
  FROM ai_usage
  WHERE user_id = p_user_id AND week_start = p_week_start
  FOR UPDATE;

  -- 3. Guard against bypass
  IF v_current_usage >= p_max_limit THEN
    RETURN -1; -- Special value indicating limit exceeded
  END IF;

  -- 4. Increment and return new value
  UPDATE ai_usage
  SET usage_count = usage_count + 1
  WHERE user_id = p_user_id AND week_start = p_week_start
  RETURNING usage_count INTO v_current_usage;

  RETURN v_current_usage;
END;
$$;
