-- Migration: 003_create_shelf_entries.sql
-- Per-user book shelves with strict RLS isolation

-- ─────────────────────────────────────────────
-- TABLE: shelf_entries
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shelf_entries (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id     UUID     NOT NULL REFERENCES public.books(id)    ON DELETE CASCADE,
  shelf       TEXT     NOT NULL
              CHECK (shelf IN ('want_to_read', 'currently_reading', 'finished', 'dnf')),
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes       TEXT,
  started_at  DATE,
  finished_at DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A user can only have each book on ONE shelf at a time
  UNIQUE (user_id, book_id)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
-- Primary query: "get all books on user's 'finished' shelf"
CREATE INDEX IF NOT EXISTS idx_shelf_user_shelf   ON public.shelf_entries(user_id, shelf);
-- Used for duplicate checks during import (Note: UNIQUE(user_id, book_id) already creates an index, making this redundant. Commented out to resolve linter warnings.)
-- CREATE INDEX IF NOT EXISTS idx_shelf_user_book    ON public.shelf_entries(user_id, book_id);
-- Allow ordering by most recently added
CREATE INDEX IF NOT EXISTS idx_shelf_created_at   ON public.shelf_entries(created_at DESC);

-- ─────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS shelf_entries_updated_at ON public.shelf_entries;
CREATE TRIGGER shelf_entries_updated_at
  BEFORE UPDATE ON public.shelf_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY — strict user isolation
-- ─────────────────────────────────────────────
ALTER TABLE public.shelf_entries ENABLE ROW LEVEL SECURITY;

-- Full CRUD — but only on own rows
DROP POLICY IF EXISTS "shelf_entries_all_own" ON public.shelf_entries;
CREATE POLICY "shelf_entries_all_own"
  ON public.shelf_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypass for batch import
DROP POLICY IF EXISTS "shelf_entries_service_role_all" ON public.shelf_entries;
CREATE POLICY "shelf_entries_service_role_all"
  ON public.shelf_entries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
