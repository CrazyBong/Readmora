-- Migration: 011_ai_task_telemetry.sql
-- Description: Implements a queryable state machine and decoupled error logging for background workers.

-- 1. Create AI Status Enum
DO $$ BEGIN
    CREATE TYPE public.ai_task_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add status tracking to shelf_entries
-- We scope summary status to the user's specific shelf entry.
ALTER TABLE public.shelf_entries 
ADD COLUMN IF NOT EXISTS summary_status public.ai_task_status DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_task_id text;

-- 3. Create decoupled telemetry table for searchable error logs
CREATE TABLE IF NOT EXISTS public.ai_task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    task_id TEXT,
    status public.ai_task_status,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for observability queries
CREATE INDEX IF NOT EXISTS idx_ai_task_logs_status ON public.ai_task_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_task_logs_user_book ON public.ai_task_logs(user_id, book_id);
