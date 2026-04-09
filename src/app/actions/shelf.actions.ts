'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { BookRepository } from '@/repository/books.repository';
import { ShelfRepository } from '@/repository/shelf.repository';
import { AddToShelfSchema, type AddToShelfInput, ErrorCode } from '@/types/api';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getBookOpenLibraryId } from '@/lib/books';

import type { Database } from '@/types/database';
import { ZodError } from 'zod';

export type BookInsert = Database['public']['Tables']['books']['Insert'];

/**
 * Ensures a book exists in our global database.
 * If not, inserts it. Uses the admin client to bypass the server-only write restriction.
 */
async function ensureBookExists(bookPayload: BookInsert): Promise<string> {
  const adminDb = createSupabaseAdminClient();
  const book = await BookRepository.upsertFromOpenLibrary(adminDb, bookPayload);
  return book.id;
}

/**
 * Adds a book to a user's shelf. Will upsert the book globally if missing.
 */
export async function addBookToShelf(
  bookPayload: BookInsert,
  shelfData: Omit<AddToShelfInput, 'book_id'>
) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    // Ensure the book exists globally
    const bookId = await ensureBookExists(bookPayload);

    // Validate payload against schema
    const payload = AddToShelfSchema.parse({
      book_id: bookId,
      ...shelfData,
    });

    const entry = await ShelfRepository.upsert(supabase, user.id, payload);

    revalidatePath('/home');
    return { success: true, entry };
  } catch (err) {
    logger.error({ err }, 'addBookToShelf failed');
    if (err instanceof ZodError) {
      return {
        success: false,
        error: (err as ZodError).issues[0]?.message || 'Validation error',
        code: ErrorCode.VALIDATION_ERROR,
      };
    }
    if (err instanceof AppError) {
      return { success: false, error: err.message, code: err.code as ErrorCode };
    }
    return {
      success: false,
      error: 'Failed to add book to shelf.',
      code: ErrorCode.INTERNAL_ERROR,
    };
  }
}

/**
 * Removes a book from a user's shelf.
 */
export async function removeBookFromShelf(bookId: string) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    await ShelfRepository.remove(supabase, user.id, bookId);

    revalidatePath('/home');
    return { success: true };
  } catch (err) {
    logger.error({ err, bookId }, 'removeBookFromShelf failed');
    if (err instanceof AppError) {
      return { success: false, error: err.message, code: err.code as ErrorCode };
    }
    return {
      success: false,
      error: 'Failed to remove from shelf.',
      code: ErrorCode.INTERNAL_ERROR,
    };
  }
}

/**
 * Imports books from Goodreads CSV parsed payload in batches.
 * Accepts a pre-parsed entries array to avoid massive payload/timeout constraints from edge functions.
 */
export async function importGoodreads(
  entries: Array<{
    title: string;
    author: string;
    isbn?: string; // from CSV
    shelf: 'want_to_read' | 'currently_reading' | 'finished' | 'dnf';
    rating?: number;
    finished_at?: string;
  }>
) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    if (!entries || entries.length === 0) return { success: true, count: 0 };

    const shelfEntriesToInsert = [];

    // Prepare book payloads
    const bookPayloads: BookInsert[] = entries.map((entry) => ({
      title: entry.title,
      author: entry.author,
      isbn: entry.isbn || null,
      openlibrary_id: getBookOpenLibraryId(entry.title, entry.author, entry.isbn),
      cover_url: null,
      cover_source: 'open_library',
      cover_id: null,
      published_year: null,
      description: null,
      genres: [],
    }));

    const adminDb = createSupabaseAdminClient();
    const olIds = Array.from(new Set(bookPayloads.map((p) => p.openlibrary_id as string)));

    // Chunking helper
    const chunkArray = <T>(arr: T[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const olIdChunks = chunkArray(olIds, 100);
    let allExistingBooks: { id: string; openlibrary_id: string }[] = [];

    for (const chunk of olIdChunks) {
      const { data, error } = await adminDb
        .from('books')
        .select('id, openlibrary_id')
        .in('openlibrary_id', chunk);

      if (error)
        throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to fetch existing books', 500);
      if (data) allExistingBooks = [...allExistingBooks, ...data];
    }

    const existingOlIdMap = new Map(allExistingBooks.map((b) => [b.openlibrary_id, b.id]));
    const missingPayloads = bookPayloads.filter(
      (p) => !existingOlIdMap.has(p.openlibrary_id as string)
    );

    let allBooks = [...allExistingBooks];

    if (missingPayloads.length > 0) {
      const payloadChunks = chunkArray(missingPayloads, 100);
      for (const chunk of payloadChunks) {
        const { data: newBooks, error: insertError } = await adminDb
          .from('books')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(chunk as any)
          .select('id, openlibrary_id');

        if (insertError)
          throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to insert missing books', 500);
        if (newBooks) allBooks = [...allBooks, ...newBooks];
      }
    }

    // Map openlibrary_id back to book.id
    const bookIdMap = new Map(
      (allBooks as { id: string; openlibrary_id: string }[]).map((b) => [b.openlibrary_id, b.id])
    );

    // Now map entries to shelf_entries using the newly created/fetched book IDs
    for (const entry of entries) {
      const openlibrary_id = getBookOpenLibraryId(entry.title, entry.author, entry.isbn);
      const bookId = bookIdMap.get(openlibrary_id);
      if (bookId) {
        shelfEntriesToInsert.push({
          user_id: user.id,
          book_id: bookId,
          shelf: entry.shelf,
          rating: entry.rating ?? null,
          finished_at: entry.finished_at ?? null,
          notes: null,
          started_at: null,
        });
      }
    }

    const { count } = await ShelfRepository.batchUpsert(supabase, shelfEntriesToInsert);

    revalidatePath('/home');
    return { success: true, count };
  } catch (err) {
    logger.error({ err }, 'importGoodreads failed');
    return {
      success: false,
      error: 'Import failed due to server error.',
      code: ErrorCode.INTERNAL_ERROR,
    };
  }
}
