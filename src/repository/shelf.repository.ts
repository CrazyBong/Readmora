import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ShelfEntry, ShelfEntryWithBook, ShelfType } from '@/types/database';
import type { AddToShelfInput } from '@/types/api';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@/types/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;
type ShelfEntryInsert = Database['public']['Tables']['shelf_entries']['Insert'];

export const ShelfRepository = {
  async findByUserAndShelf(
    db: AnyClient,
    userId: string,
    shelf: ShelfType
  ): Promise<ShelfEntryWithBook[]> {
    const { data, error } = await db
      .from('shelf_entries')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .eq('shelf', shelf)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error({ err: error, userId, shelf }, 'ShelfRepository.findByUserAndShelf failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to fetch shelf', 500);
    }

    return (data ?? []) as ShelfEntryWithBook[];
  },

  async findAllByUser(db: AnyClient, userId: string): Promise<ShelfEntryWithBook[]> {
    const { data, error } = await db
      .from('shelf_entries')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error({ err: error, userId }, 'ShelfRepository.findAllByUser failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to fetch shelf entries', 500);
    }

    return (data ?? []) as ShelfEntryWithBook[];
  },

  async findByUserAndBook(
    db: AnyClient,
    userId: string,
    bookId: string
  ): Promise<ShelfEntry | null> {
    const { data, error } = await db
      .from('shelf_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) {
      logger.error({ err: error, userId, bookId }, 'ShelfRepository.findByUserAndBook failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to check shelf entry', 500);
    }

    return data as ShelfEntry | null;
  },

  async upsert(db: AnyClient, userId: string, input: AddToShelfInput): Promise<ShelfEntry> {
    const payload = {
      user_id: userId,
      book_id: input.book_id,
      shelf: input.shelf,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
      started_at: input.started_at ?? null,
      finished_at:
        input.finished_at ??
        (input.shelf === 'finished' ? new Date().toISOString().split('T')[0] : null),
    };

    const { data, error } = await db
      .from('shelf_entries')
      .upsert(payload, { onConflict: 'user_id,book_id' })
      .select()
      .single();

    if (error) {
      logger.error({ err: error, userId, input }, 'ShelfRepository.upsert failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update shelf', 500);
    }

    return data as ShelfEntry;
  },

  async remove(db: AnyClient, userId: string, bookId: string): Promise<void> {
    const { error } = await db
      .from('shelf_entries')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      logger.error({ err: error, userId, bookId }, 'ShelfRepository.remove failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to remove from shelf', 500);
    }
  },

  async batchUpsert(db: AnyClient, entries: ShelfEntryInsert[]): Promise<{ count: number }> {
    if (entries.length === 0) return { count: 0 };

    const { error, count } = await db
      .from('shelf_entries')
      .upsert(entries, { onConflict: 'user_id,book_id', count: 'exact' });

    if (error) {
      logger.error({ err: error, count: entries.length }, 'ShelfRepository.batchUpsert failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to import shelf entries', 500);
    }

    return { count: count ?? entries.length };
  },
};
