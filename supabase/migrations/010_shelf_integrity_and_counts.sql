-- Migration: 010_shelf_integrity_and_counts.sql
-- Description: Enforces data integrity at the constraint level and implements efficient, lazy count reconciliation.

-- 1. Eliminate the source of drift: Prevent duplicate shelf entries at the DB level
-- Note: If duplicates already exist, this will fail. User should clean data or use ON CONFLICT.
ALTER TABLE public.user_books
ADD CONSTRAINT user_books_user_id_book_id_key UNIQUE (user_id, book_id);

-- 2. Add denormalized columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS books_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_recount BOOLEAN DEFAULT FALSE;

-- 3. Create lazy healer: Reconcile only 'dirty' profiles to avoid massive table scans
CREATE OR REPLACE FUNCTION public.reconcile_dirty_profiles()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles p
    SET 
        books_count = sub.actual_count,
        needs_recount = FALSE
    FROM (
        SELECT user_id, COUNT(*) as actual_count
        FROM public.user_books
        GROUP BY user_id
    ) sub
    WHERE p.id = sub.user_id 
    AND p.needs_recount = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Initial Backfill (One-time table scan is acceptable here)
UPDATE public.profiles p
SET books_count = (
    SELECT COUNT(*) 
    FROM public.user_books ub 
    WHERE ub.user_id = p.id
);
