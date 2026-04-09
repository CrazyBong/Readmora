-- Migration: 002_create_books.sql
-- Global book catalogue — publicly readable, server-only writes

-- ─────────────────────────────────────────────
-- TABLE: books
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.books (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  isbn             TEXT UNIQUE,
  cover_url        TEXT,
  description      TEXT,
  published_year   INT,
  genres           TEXT[]   DEFAULT '{}',
  openlibrary_id   TEXT UNIQUE,
  cover_source     TEXT DEFAULT 'open_library',
  cover_id         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
-- Note: isbn and openlibrary_id have UNIQUE constraints, so indexing them again is redundant.
-- CREATE INDEX IF NOT EXISTS idx_books_isbn          ON public.books(isbn);
-- CREATE INDEX IF NOT EXISTS idx_books_openlib_id    ON public.books(openlibrary_id);
CREATE INDEX IF NOT EXISTS idx_books_title_author  ON public.books(title, author);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read books
DROP POLICY IF EXISTS "books_select_public" ON public.books;
CREATE POLICY "books_select_public"
  ON public.books FOR SELECT
  USING (true);

-- Only service role can insert/update books (via API search proxy)
DROP POLICY IF EXISTS "books_service_role_write" ON public.books;
CREATE POLICY "books_service_role_write"
  ON public.books FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "books_service_role_update" ON public.books;
CREATE POLICY "books_service_role_update"
  ON public.books FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
-- Only service role can delete books (admin maintenance)
DROP POLICY IF EXISTS "books_service_role_delete" ON public.books;
CREATE POLICY "books_service_role_delete"
  ON public.books FOR DELETE
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TRIGGER: updated_at
-- ─────────────────────────────────────────────
-- Reuses function from 001_create_profiles.sql
DROP TRIGGER IF EXISTS tr_books_updated_at ON public.books;
CREATE TRIGGER tr_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
