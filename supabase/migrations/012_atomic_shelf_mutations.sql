-- Migration: 012_atomic_shelf_mutations.sql
-- Description: Makes shelf entry mutations and books_count updates atomic.

CREATE OR REPLACE FUNCTION public.increment_books_count(profile_id UUID)
RETURNS void AS $$
BEGIN
    IF auth.role() <> 'service_role' AND auth.uid() <> profile_id THEN
        RAISE EXCEPTION 'Not authorized to increment books_count for this profile';
    END IF;

    UPDATE public.profiles
    SET books_count = books_count + 1
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_books_count(profile_id UUID)
RETURNS void AS $$
BEGIN
    IF auth.role() <> 'service_role' AND auth.uid() <> profile_id THEN
        RAISE EXCEPTION 'Not authorized to decrement books_count for this profile';
    END IF;

    UPDATE public.profiles
    SET books_count = GREATEST(0, books_count - 1)
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.reconcile_dirty_profiles()
RETURNS void AS $$
BEGIN
    IF auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Not authorized to reconcile shelf counts';
    END IF;

    UPDATE public.profiles p
    SET
        books_count = COALESCE(sub.actual_count, 0),
        needs_recount = FALSE
    FROM public.profiles dirty
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS actual_count
        FROM public.shelf_entries
        GROUP BY user_id
    ) sub
        ON sub.user_id = dirty.id
    WHERE p.id = dirty.id
      AND dirty.needs_recount = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.sync_books_count(profile_id UUID)
RETURNS void AS $$
BEGIN
    IF auth.role() <> 'service_role' AND auth.uid() <> profile_id THEN
        RAISE EXCEPTION 'Not authorized to sync books_count for this profile';
    END IF;

    UPDATE public.profiles
    SET
        books_count = (
            SELECT COUNT(*)
            FROM public.shelf_entries
            WHERE user_id = profile_id
        ),
        needs_recount = FALSE
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.upsert_shelf_entry_and_sync_count(
    p_user_id UUID,
    p_book_id UUID,
    p_shelf TEXT,
    p_rating SMALLINT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_started_at DATE DEFAULT NULL,
    p_finished_at DATE DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    inserted_new boolean := FALSE;
BEGIN
    IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Not authorized to update shelf entries for this profile';
    END IF;

    INSERT INTO public.shelf_entries (
        user_id,
        book_id,
        shelf,
        rating,
        notes,
        started_at,
        finished_at
    )
    VALUES (
        p_user_id,
        p_book_id,
        p_shelf,
        p_rating,
        p_notes,
        p_started_at,
        p_finished_at
    )
    ON CONFLICT (user_id, book_id) DO NOTHING;

    IF FOUND THEN
        inserted_new := TRUE;
        UPDATE public.profiles
        SET
            books_count = books_count + 1,
            needs_recount = FALSE
        WHERE id = p_user_id;
    END IF;

    UPDATE public.shelf_entries
    SET
        shelf = p_shelf,
        rating = p_rating,
        notes = p_notes,
        started_at = p_started_at,
        finished_at = p_finished_at
    WHERE user_id = p_user_id
      AND book_id = p_book_id;

    RETURN inserted_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.remove_shelf_entry_and_sync_count(
    p_user_id UUID,
    p_book_id UUID
)
RETURNS boolean AS $$
DECLARE
    removed_existing boolean := FALSE;
BEGIN
    IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Not authorized to remove shelf entries for this profile';
    END IF;

    DELETE FROM public.shelf_entries
    WHERE user_id = p_user_id
      AND book_id = p_book_id;

    IF FOUND THEN
        removed_existing := TRUE;
        UPDATE public.profiles
        SET
            books_count = GREATEST(0, books_count - 1),
            needs_recount = FALSE
        WHERE id = p_user_id;
    END IF;

    RETURN removed_existing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
