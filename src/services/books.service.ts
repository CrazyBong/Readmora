import { logger } from '@/lib/logger';
import type { Database } from '@/types/database';

type BookInsert = Database['public']['Tables']['books']['Insert'];

export const BookService = {
  /**
   * Search Open Library by query string and return normalized book objects.
   * This does NOT save to the database yet. It simply proxies and normalizes the search.
   */
  async searchOpenLibrary(query: string): Promise<BookInsert[]> {
    if (!query) return [];

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Readmora/1.0 (readmora@example.com)',
          },
          next: { revalidate: 3600 },
          signal: controller.signal,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (!response || !response.ok) {
          logger.warn(
            { status: response?.status, query },
            'Open Library search response not OK, falling back'
          );
          return await this.searchGoogleBooks(query);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.docs) || data.docs.length === 0) {
          return await this.searchGoogleBooks(query);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.docs.map((doc: any): BookInsert => {
          let isbn: string | null = null;
          if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
            const isbn13 = doc.isbn.find((i: string) => i.length === 13);
            isbn = isbn13 || doc.isbn[0];
          }

          return {
            title: doc.title,
            author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Unknown Author',
            isbn,
            cover_url: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
              : null,
            description: null,
            published_year: doc.first_publish_year ?? null,
            genres: [],
            openlibrary_id: doc.key,
            cover_source: 'open_library',
            cover_id: doc.cover_i ? doc.cover_i.toString() : null,
          };
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.warn({ query }, 'Open Library search timed out, falling back to Google Books');
        return await this.searchGoogleBooks(query);
      }
      logger.error({ err, query }, 'BookService.searchOpenLibrary failed, attempting fallback');
      return await this.searchGoogleBooks(query);
    }
  },

  /**
   * Fallback search via Google Books API.
   */
  async searchGoogleBooks(query: string): Promise<BookInsert[]> {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await fetch(url, { next: { revalidate: 3600 } } as any);

      if (!response || !response.ok) return [];

      const data = await response.json();
      if (!data || !Array.isArray(data.items)) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.items.map((item: any): BookInsert => {
        const info = item.volumeInfo;
        const ident = info.industryIdentifiers || [];
        const isbn13 = ident.find(
          (i: { type: string; identifier: string }) => i.type === 'ISBN_13'
        )?.identifier;
        const isbn10 = ident.find(
          (i: { type: string; identifier: string }) => i.type === 'ISBN_10'
        )?.identifier;

        return {
          title: info.title,
          author: Array.isArray(info.authors) ? info.authors.join(', ') : 'Unknown Author',
          isbn: isbn13 || isbn10 || null,
          cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          description: info.description || null,
          published_year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : null,
          genres: Array.isArray(info.categories) ? info.categories : [],
          openlibrary_id: `/google/${item.id}`, // Custom key for Google Books
          cover_source: 'google_books',
          cover_id: item.id,
        };
      });
    } catch (err) {
      logger.error({ err, query }, 'BookService.searchGoogleBooks failed');
      return [];
    }
  },
};
