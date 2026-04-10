-- Migration: 010_denormalize_books_count.sql
-- Description: Adds a denormalized books_count to the profiles table to avoid expensive COUNT(*) queries at scale.

-- 1. Add the column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS books_count INTEGER DEFAULT 0;

-- 2. Create the sync function
CREATE OR REPLACE FUNCTION public.sync_profile_books_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles
        SET books_count = books_count + 1
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles
        SET books_count = GREATEST(0, books_count - 1)
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on user_books (shelf entries)
DROP TRIGGER IF EXISTS on_shelf_change_update_count ON public.user_books;
CREATE TRIGGER on_shelf_change_update_count
AFTER INSERT OR DELETE ON public.user_books
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_books_count();

-- 4. Backfill existing counts
UPDATE public.profiles p
SET books_count = (
    SELECT COUNT(*) 
    FROM public.user_books ub 
    WHERE ub.user_id = p.id
);
