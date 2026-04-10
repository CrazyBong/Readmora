import { z } from 'zod';
import type { ShelfType, VibeId } from './database';

// ─────────────────────────────────────────────
// REQUEST SCHEMAS (Zod — validated at API boundary)
// ─────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional(),
  genre_preferences: z.array(z.string()).min(1).max(20).optional(),
  vibe_preference: z
    .enum(['wildflower', 'winter_frost', 'sakura', 'botanical', 'harvest'])
    .optional(),
  avatar_url: z.string().url('Must be a valid URL').optional(),
});

export const AddToShelfSchema = z.object({
  book_id: z.string().uuid('Must be a valid book ID'),
  shelf: z.enum(['want_to_read', 'currently_reading', 'finished', 'dnf']),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  started_at: z.string().date().optional(),
  finished_at: z.string().date().optional(),
});

export const AiSummaryRequestSchema = z.object({
  book_id: z.string().uuid('Must be a valid book ID'),
});

export const GoodreadsImportSchema = z.object({
  entries: z
    .array(
      z.object({
        title: z.string().min(1),
        author: z.string().min(1),
        isbn: z.string().optional(),
        shelf: z.enum(['want_to_read', 'currently_reading', 'finished', 'dnf']),
        rating: z.number().int().min(1).max(5).optional(),
        finished_at: z.string().date().optional(),
      })
    )
    .max(2000, 'Max 2,000 books per import'),
});

export const CompleteOnboardingSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  genre_preferences: z.array(z.string()).min(5, 'Select at least 5 genres').max(20),
  vibe_preference: z.enum(['wildflower', 'winter_frost', 'sakura', 'botanical', 'harvest']),
  avatar_url: z.string().url().optional(),
});

// ─────────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type AddToShelfInput = z.infer<typeof AddToShelfSchema>;
export type AiSummaryRequest = z.infer<typeof AiSummaryRequestSchema>;
export type GoodreadsImportInput = z.infer<typeof GoodreadsImportSchema>;
export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;

// ─────────────────────────────────────────────
// API RESPONSE ENVELOPE
// ─────────────────────────────────────────────

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta?: { total?: number; returned?: number; page?: number; limit?: number; work_id?: string };
    }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// ─────────────────────────────────────────────
// WELL-KNOWN ERROR CODES
// ─────────────────────────────────────────────

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ─────────────────────────────────────────────
// AI SUMMARY SPECIFIC
// ─────────────────────────────────────────────

export interface AiSummaryResponse {
  book_id: string;
  summary_markdown: string;
  cached: boolean;
  status?: 'queued' | 'completed' | 'failed';
  usage?: {
    used: number;
    limit: number;
    resets_at: string; // ISO date of next Monday
  };
}

export interface RateLimitExceededResponse {
  code: 'RATE_LIMIT_EXCEEDED';
  used: number;
  limit: number;
  resets_at: string;
  upgrade_required: true;
}

// ─────────────────────────────────────────────
// SHELF TYPES
// ─────────────────────────────────────────────

export const SHELF_LABELS: Record<ShelfType, string> = {
  want_to_read: 'Want to Read',
  currently_reading: 'Currently Reading',
  finished: 'Finished',
  dnf: 'Did Not Finish',
};

export const VIBE_LABELS: Record<VibeId, string> = {
  wildflower: 'Wildflower',
  winter_frost: 'Winter Frost',
  sakura: 'Sakura',
  botanical: 'Botanical',
  harvest: 'Harvest',
};
