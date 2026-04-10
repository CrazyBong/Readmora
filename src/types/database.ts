/**
 * Database types derived from the Supabase schema.
 * These mirror the SQL migrations exactly.
 * DO NOT add `any` — every field must have an explicit type.
 */

export type VibeId = 'wildflower' | 'winter_frost' | 'sakura' | 'botanical' | 'harvest';

export type SubscriptionStatus = 'free' | 'premium';

export type ShelfType = 'want_to_read' | 'currently_reading' | 'finished' | 'dnf';

export type SubscriptionPlan = 'monthly' | 'annual';

export type SubscriptionEventStatus = 'captured' | 'failed' | 'cancelled' | 'refunded';

export type AiTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ─────────────────────────────────────────────
// TABLE ROWS
// ─────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  genre_preferences: string[];
  vibe_preference: VibeId;
  onboarding_complete: boolean;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null; // ISO timestamptz
  razorpay_customer_id: string | null;
  books_count: number;
  needs_recount: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  cover_url: string | null;
  description: string | null;
  published_year: number | null;
  genres: string[];
  openlibrary_id: string | null;
  cover_source: string;
  cover_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShelfEntry {
  id: string;
  user_id: string;
  book_id: string;
  shelf: ShelfType;
  rating: number | null; // 1–5
  notes: string | null;
  started_at: string | null; // ISO date
  finished_at: string | null; // ISO date
  summary_status: AiTaskStatus | null;
  last_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiSummary {
  id: string;
  book_id: string;
  summary_markdown: string;
  model_version: string;
  generated_at: string;
  updated_at: string;
}

export interface AiUsage {
  id: string;
  user_id: string;
  week_start: string; // ISO date — Monday 00:00 UTC
  usage_count: number;
}

export interface Subscription {
  id: string;
  user_id: string | null; // Nullable after account deletion
  razorpay_payment_id: string;
  razorpay_subscription_id: string | null;
  plan: SubscriptionPlan;
  amount_paise: number;
  status: SubscriptionEventStatus;
  created_at: string;
}

export interface Vibe {
  id: VibeId;
  display_name: string;
  color_bg: string;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_muted: string;
}

export interface AiTaskLog {
  id: string;
  user_id: string | null;
  book_id: string | null;
  task_id: string | null;
  status: AiTaskStatus | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─────────────────────────────────────────────
// JOINED / EXTENDED TYPES
// ─────────────────────────────────────────────

/** Shelf entry with its book details joined */
export interface ShelfEntryWithBook extends ShelfEntry {
  book: Book;
}

/** Profile with subscription status computed */
export interface ProfileWithStatus extends Profile {
  is_premium: boolean;
  ai_remaining_this_week: number;
}

// ─────────────────────────────────────────────
// DATABASE SCHEMA TYPE (for supabase-js generics)
// ─────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'books_count' | 'needs_recount'> & {
          books_count?: number;
          needs_recount?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      books: {
        Row: Book;
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'cover_source'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          cover_source?: string;
        };
        Update: Partial<Omit<Book, 'id'>>;
      };
      shelf_entries: {
        Row: ShelfEntry;
        Insert: Partial<
          Pick<
            ShelfEntry,
            'rating' | 'notes' | 'started_at' | 'finished_at' | 'summary_status' | 'last_task_id'
          >
        > &
          Pick<ShelfEntry, 'user_id' | 'book_id' | 'shelf'> & {
            id?: string;
            created_at?: string;
            updated_at?: string;
          };
        Update: Partial<Omit<ShelfEntry, 'id' | 'user_id' | 'book_id'>>;
      };
      ai_summaries: {
        Row: AiSummary;
        Insert: Omit<AiSummary, 'id' | 'generated_at' | 'updated_at'> & {
          id?: string;
          generated_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<AiSummary, 'summary_markdown' | 'model_version'>>;
      };
      ai_usage: {
        Row: AiUsage;
        Insert: Omit<AiUsage, 'id'> & { id?: string };
        Update: Pick<AiUsage, 'usage_count'>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Pick<Subscription, 'status'>;
      };
      vibes: {
        Row: Vibe;
        Insert: Vibe;
        Update: Partial<Omit<Vibe, 'id'>>;
      };
      ai_task_logs: {
        Row: AiTaskLog;
        Insert: Partial<
          Pick<AiTaskLog, 'user_id' | 'book_id' | 'task_id' | 'status' | 'error_message'>
        > & {
          id?: string;
          created_at?: string;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<Omit<AiTaskLog, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
