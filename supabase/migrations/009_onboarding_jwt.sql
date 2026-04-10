-- Migration: 009_onboarding_jwt.sql
-- Synchronizes onboarding_complete status to auth.users.raw_app_meta_data for zero-latency middleware checks.

-- ─────────────────────────────────────────────
-- FUNCTION: sync_onboarding_to_metadata
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_onboarding_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users table's raw_app_meta_data field
  -- Note: Supabase exposes this as 'app_metadata' in the JS library, 
  -- but the underlying Postgres column is 'raw_app_meta_data'.
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{onboarding_complete}',
    to_jsonb(NEW.onboarding_complete)
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ─────────────────────────────────────────────
-- TRIGGER: on_profile_onboarding_update
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_profile_onboarding_update ON public.profiles;
CREATE TRIGGER on_profile_onboarding_update
  AFTER UPDATE OF onboarding_complete ON public.profiles
  FOR EACH ROW
  WHEN (OLD.onboarding_complete IS DISTINCT FROM NEW.onboarding_complete)
  EXECUTE FUNCTION public.sync_onboarding_to_metadata();

-- ─────────────────────────────────────────────
-- BACKFILL: Existing Users
-- ─────────────────────────────────────────────
-- One-time sync for current profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, onboarding_complete FROM public.profiles LOOP
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{onboarding_complete}',
      to_jsonb(profile_record.onboarding_complete)
    )
    WHERE id = profile_record.id;
  END LOOP;
END $$;
