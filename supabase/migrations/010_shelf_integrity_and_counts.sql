-- Migration: 010_shelf_integrity_and_counts.sql
-- Description: Enforces data integrity at the constraint level and implements efficient, lazy count reconciliation.

-- 1. Eliminate the source of drift: Prevent duplicate shelf entries at the DB level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'shelf_entries_user_id_book_id_key'
    ) THEN
        ALTER TABLE public.shelf_entries
        ADD CONSTRAINT shelf_entries_user_id_book_id_key UNIQUE (user_id, book_id);
    END IF;
END $$;

-- 2. Add denormalized columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS books_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_recount BOOLEAN DEFAULT FALSE;

-- 3. Atomic Count RPCs: To be used by Server Actions with row-level locking
CREATE OR REPLACE FUNCTION public.increment_books_count(profile_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET books_count = books_count + 1
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_books_count(profile_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET books_count = GREATEST(0, books_count - 1)
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create lazy healer: Reconcile only 'dirty' profiles to avoid massive table scans
CREATE OR REPLACE FUNCTION public.reconcile_dirty_profiles()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles p
    SET 
        books_count = sub.actual_count,
        needs_recount = FALSE
    FROM (
        SELECT user_id, COUNT(*) as actual_count
        FROM public.shelf_entries
        GROUP BY user_id
    ) sub
    WHERE p.id = sub.user_id 
    AND p.needs_recount = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Initial Backfill (One-time table scan is acceptable here)
UPDATE public.profiles p
SET books_count = (
    SELECT COUNT(*) 
    FROM public.shelf_entries ub 
    WHERE ub.user_id = p.id
);
