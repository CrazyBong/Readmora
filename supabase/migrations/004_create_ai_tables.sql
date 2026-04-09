-- Migration: 004_create_ai_tables.sql
-- Global AI summary cache + per-user rate limiting table

-- ─────────────────────────────────────────────
-- TABLE: ai_summaries (global cache — not per-user)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id          UUID     NOT NULL UNIQUE REFERENCES public.books(id) ON DELETE CASCADE,
  summary_markdown TEXT     NOT NULL,
  model_version    TEXT     DEFAULT 'gemini-1.5-flash',
  generated_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_book_id ON public.ai_summaries(book_id);

CREATE TRIGGER ai_summaries_updated_at
  BEFORE UPDATE ON public.ai_summaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Everyone can READ summaries (they're global, not user-data)
CREATE POLICY "ai_summaries_select_public"
  ON public.ai_summaries FOR SELECT
  USING (true);

-- Only service_role can write (via API route)
CREATE POLICY "ai_summaries_service_role_write"
  ON public.ai_summaries FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "ai_summaries_service_role_update"
  ON public.ai_summaries FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: ai_usage (per-user, per-week rate limit)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- ISO-8601: Monday 00:00 UTC is the start of the week
  -- Use: date_trunc('week', NOW())::DATE in queries
  week_start  DATE     NOT NULL,
  usage_count SMALLINT NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  UNIQUE (user_id, week_start)
);

-- Primary index: rate limit lookup on every AI request (redundant as UNIQUE already creates index)
-- CREATE INDEX IF NOT EXISTS idx_ai_usage_user_week ON public.ai_usage(user_id, week_start);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can see their own usage (for the counter badge)
CREATE POLICY "ai_usage_select_own"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can write (prevents client-side tampering)
CREATE POLICY "ai_usage_service_role_all"
  ON public.ai_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
