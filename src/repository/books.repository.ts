import type { SupabaseClient } from '@supabase/supabase-js';
import type { Book } from '@/types/database';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@/types/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export const BookRepository = {
  async findByOpenLibraryId(db: AnyClient, key: string): Promise<Book | null> {
    const { data, error } = await db
      .from('books')
      .select('*')
      .eq('openlibrary_id', key)
      .maybeSingle();

    if (error) {
      logger.error({ err: error, key }, 'BookRepository.findByOpenLibraryId failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to look up book', 500);
    }

    return data as Book | null;
  },

  async findByIsbn(db: AnyClient, isbn: string): Promise<Book | null> {
    const { data, error } = await db.from('books').select('*').eq('isbn', isbn).maybeSingle();

    if (error) {
      logger.error({ err: error, isbn }, 'BookRepository.findByIsbn failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to look up book by ISBN', 500);
    }

    return data as Book | null;
  },

  async upsertFromOpenLibrary(
    db: AnyClient,
    book: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'cover_source'> & {
      id?: string;
      cover_source?: string;
    }
  ): Promise<Book> {
    const { data, error } = await db
      .from('books')
      .upsert(book, { onConflict: 'openlibrary_id' })
      .select()
      .single();

    if (error) {
      logger.error({ err: error }, 'BookRepository.upsertFromOpenLibrary failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to upsert book', 500);
    }

    return data as Book;
  },

  async findById(db: AnyClient, bookId: string): Promise<Book | null> {
    const { data, error } = await db.from('books').select('*').eq('id', bookId).maybeSingle();

    if (error) {
      logger.error({ err: error, bookId }, 'BookRepository.findById failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to fetch book', 500);
    }

    return data as Book | null;
  },
};
