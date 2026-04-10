import { logger } from '@/lib/logger';
import { getOrSetCache } from '@/lib/redis';
import type { Database } from '@/types/database';

type BookInsert = Database['public']['Tables']['books']['Insert'];

interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  first_publish_year?: number;
  key: string;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string };
    description?: string;
    publishedDate?: string;
    categories?: string[];
  };
}

interface SearchOptions {
  limit?: number;
}

interface OpenLibraryWorkResponse {
  title?: string;
  description?: string | { value?: string };
  covers?: number[];
  first_publish_date?: string;
  subjects?: string[];
  authors?: { author?: { key?: string } }[];
}

interface OpenLibraryRatingsResponse {
  summary?: { average?: number };
}

function normalizeLimit(limit: number | undefined, fallback: number, max: number) {
  if (!Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(Math.trunc(limit ?? fallback), 1), max);
}

export const BookService = {
  /**
   * Search Open Library by query string and return normalized book objects.
   * This does NOT save to the database yet. It simply proxies and normalizes the search.
   */
  async searchOpenLibrary(query: string, options?: SearchOptions): Promise<BookInsert[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];
    const limit = normalizeLimit(options?.limit, 10, 40);

    const cacheKey = `book_search:v2:${trimmedQuery.toLowerCase()}:${limit}`;

    const openLibraryResults = await getOrSetCache(cacheKey, async () => {
      try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Readmora/1.0 (readmora@example.com)',
            },
            next: { revalidate: 3600 },
            signal: controller.signal,
          } as unknown as RequestInit);

          if (!response || !response.ok) {
            logger.warn(
              { status: response?.status, query: trimmedQuery },
              'Open Library search response not OK'
            );
            return [];
          }

          const data = await response.json();

          if (!data || !Array.isArray(data.docs) || data.docs.length === 0) {
            return [];
          }

          return (data.docs as OpenLibraryDoc[]).map((doc): BookInsert => {
            let isbn: string | null = null;
            if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
              const isbn13 = doc.isbn.find((i: string) => i.length === 13);
              const [firstIsbn] = doc.isbn;
              isbn = isbn13 ?? firstIsbn ?? null;
            }

            return {
              title: doc.title,
              author: Array.isArray(doc.author_name)
                ? doc.author_name.join(', ')
                : 'Unknown Author',
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
          logger.warn({ query: trimmedQuery }, 'Open Library search timed out');
          return [];
        }
        logger.error({ err, query: trimmedQuery }, 'BookService.searchOpenLibrary failed');
        return [];
      }
    });

    if (openLibraryResults.length > 0) {
      return openLibraryResults;
    }

    return this.searchGoogleBooks(trimmedQuery, { limit });
  },

  /**
   * Fallback search via Google Books API.
   */
  async searchGoogleBooks(query: string, options?: SearchOptions): Promise<BookInsert[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];
    const limit = normalizeLimit(options?.limit, 10, 40);

    const cacheKey = `book_search:google:v2:${trimmedQuery.toLowerCase()}:${limit}`;

    return getOrSetCache(cacheKey, async () => {
      try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmedQuery)}&maxResults=${limit}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await fetch(url, { next: { revalidate: 3600 } } as any);

        if (!response || !response.ok) return [];

        const data = await response.json();
        if (!data || !Array.isArray(data.items)) return [];

        return (data.items as GoogleBookItem[]).map((item): BookInsert => {
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
            published_year: (() => {
              const publishedYear = info.publishedDate?.substring(0, 4);
              if (!publishedYear || !/^\d{4}$/.test(publishedYear)) return null;
              const year = Number.parseInt(publishedYear, 10);
              return Number.isNaN(year) ? null : year;
            })(),
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
    });
  },

  async discoverBySubject(subject: string, page = 1, limit = 24): Promise<BookInsert[]> {
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) return [];

    const normalizedPage = Math.max(1, Math.trunc(page));
    const normalizedLimit = normalizeLimit(limit, 24, 40);
    const cacheKey = `book_discover:v1:${trimmedSubject.toLowerCase()}:${normalizedPage}:${normalizedLimit}`;

    return getOrSetCache(cacheKey, async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const url = `https://openlibrary.org/search.json?q=subject:${encodeURIComponent(trimmedSubject)}&limit=${normalizedLimit}&page=${normalizedPage}&fields=key,title,author_name,cover_i,ratings_average`;

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Readmora/1.0 (readmora@example.com)',
            },
            next: { revalidate: 300 },
            signal: controller.signal,
          } as unknown as RequestInit);

          if (!response.ok) {
            logger.warn(
              { subject: trimmedSubject, page: normalizedPage, status: response.status },
              'Open Library discovery response not OK'
            );
            return [];
          }

          const data = await response.json();
          if (!data || !Array.isArray(data.docs)) return [];

          return (data.docs as OpenLibraryDoc[])
            .filter((doc) => doc.cover_i)
            .map(
              (doc): BookInsert => ({
                title: doc.title,
                author: Array.isArray(doc.author_name)
                  ? doc.author_name.join(', ')
                  : 'Unknown Author',
                isbn: null,
                cover_url: doc.cover_i
                  ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                  : null,
                description: null,
                published_year: doc.first_publish_year ?? null,
                genres: [trimmedSubject],
                openlibrary_id: doc.key,
                cover_source: 'open_library',
                cover_id: doc.cover_i ? doc.cover_i.toString() : null,
              })
            );
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          logger.warn(
            { subject: trimmedSubject, page: normalizedPage },
            'Open Library discovery timed out'
          );
          return [];
        }

        logger.error(
          { err, subject: trimmedSubject, page: normalizedPage },
          'BookService.discoverBySubject failed'
        );
        return [];
      }
    });
  },

  async fetchOpenLibraryWork(workId: string) {
    const normalizedWorkId = workId.trim().replace(/^\/works\//, '');
    if (!/^OL[\w]+W$/i.test(normalizedWorkId)) {
      return null;
    }

    const cacheKey = `book_work:v1:${normalizedWorkId.toLowerCase()}`;

    return getOrSetCache(cacheKey, async () => {
      try {
        const workUrl = `https://openlibrary.org/works/${normalizedWorkId}.json`;
        const ratingsUrl = `https://openlibrary.org/works/${normalizedWorkId}/ratings.json`;
        const headers = {
          'User-Agent': 'Readmora/1.0 (readmora@example.com)',
        };

        const [bookRes, ratingsRes] = await Promise.all([
          fetch(workUrl, { headers, next: { revalidate: 3600 } } as unknown as RequestInit),
          fetch(ratingsUrl, { headers, next: { revalidate: 3600 } } as unknown as RequestInit),
        ]);

        if (!bookRes.ok) {
          logger.warn(
            { workId: normalizedWorkId, status: bookRes.status },
            'Open Library work response not OK'
          );
          return null;
        }

        const olData = (await bookRes.json()) as OpenLibraryWorkResponse;
        const ratingsData = ratingsRes.ok
          ? ((await ratingsRes.json()) as OpenLibraryRatingsResponse)
          : null;

        let authorName = 'Unknown Author';
        const authorKey = olData.authors?.[0]?.author?.key;
        if (authorKey) {
          const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
            headers,
            next: { revalidate: 3600 },
          } as unknown as RequestInit);

          if (authorRes.ok) {
            const authorData = await authorRes.json();
            authorName = authorData.name || authorData.personal_name || 'Unknown Author';
          }
        }

        const publishedYear = olData.first_publish_date
          ? Number.parseInt(olData.first_publish_date, 10)
          : null;

        return {
          id: normalizedWorkId,
          title: olData.title ?? 'Untitled',
          author: authorName,
          description:
            typeof olData.description === 'string'
              ? olData.description
              : olData.description?.value || '',
          cover_url: olData.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${olData.covers[0]}-L.jpg`
            : null,
          published_year: Number.isNaN(publishedYear ?? Number.NaN) ? null : publishedYear,
          genres: olData.subjects?.slice(0, 3) || ['Literature'],
          rating: ratingsData?.summary?.average || 0,
        };
      } catch (err) {
        logger.error({ err, workId: normalizedWorkId }, 'BookService.fetchOpenLibraryWork failed');
        return null;
      }
    });
  },
};
