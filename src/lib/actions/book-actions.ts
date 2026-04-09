'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function ingestBook(bookData: {
  title: string;
  author: string;
  cover_url?: string | null;
  description?: string | null;
  published_year?: number | null;
  genres?: string[];
  openlibrary_id?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  // Cast to any to bypass Supabase generated types when 'books' table isn't in schema.ts
  const db = admin as any;

  // Try to find by OpenLibrary ID first to avoid duplicates
  if (bookData.openlibrary_id) {
    const { data: existing } = await db
      .from('books')
      .select('*')
      .eq('openlibrary_id', bookData.openlibrary_id)
      .maybeSingle();

    if (existing) return { data: existing, error: null };
  }

  // Upsert to books table using Service Role key
  const { data: newBook, error } = await db
    .from('books')
    .upsert({
      title: bookData.title,
      author: bookData.author,
      cover_url: bookData.cover_url,
      description: bookData.description,
      published_year: bookData.published_year,
      genres: bookData.genres || [],
      openlibrary_id: bookData.openlibrary_id,
      cover_source: 'open_library',
    })
    .select()
    .single();

  return { data: newBook, error };
}
