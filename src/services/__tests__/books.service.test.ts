import { describe, it, expect, vi, type Mock } from 'vitest';
import { BookService } from '../books.service';

// Mock global fetch
global.fetch = vi.fn();

describe('BookService', () => {
  it('should return empty array when query is empty', async () => {
    const results = await BookService.searchOpenLibrary('');
    expect(results).toEqual([]);
  });

  it('should map Open Library results correctly', async () => {
    const mockResponse = {
      docs: [
        {
          key: '/works/OL123W',
          title: 'A Great Book',
          author_name: ['John Doe', 'Jane Smith'],
          first_publish_year: 2021,
          isbn: ['1234567890123', '0987654321'],
          cover_i: 9999,
        },
      ],
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await BookService.searchOpenLibrary('A Great Book');

    expect(results).toHaveLength(1);
    const book = results[0];
    if (!book) {
      throw new Error('Test failed: book is undefined');
    }

    expect(book.title).toBe('A Great Book');
    expect(book.author).toBe('John Doe, Jane Smith'); // Joined authors
    expect(book.isbn).toBe('1234567890123'); // prioritized the 13 digit one
    expect(book.openlibrary_id).toBe('/works/OL123W');
    expect(book.cover_source).toBe('open_library');
    expect(book.cover_id).toBe('9999');
    expect(book.cover_url).toBe('https://covers.openlibrary.org/b/id/9999-L.jpg');
    expect(book.published_year).toBe(2021);
    expect(book.genres).toEqual([]); // Expected to be empty array per design
  });

  it('should throw an AppError on API failure', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    await expect(BookService.searchOpenLibrary('A Great Book')).rejects.toThrow(
      'Failed to proxy Open Library API'
    );
  });
});
