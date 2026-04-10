'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, Check } from 'lucide-react';
import { addBookToShelf, type BookInsert } from '@/app/actions/shelf.actions';
import BookCoverImage from '@/components/BookCoverImage';

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<BookInsert[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Track which books are being added or successfully added in this session
  const [addingState, setAddingState] = useState<Record<string, 'loading' | 'success'>>({});
  const [selectedShelf, setSelectedShelf] = useState<
    'want_to_read' | 'currently_reading' | 'finished' | 'dnf'
  >('want_to_read');
  const searchAbortRef = useRef<AbortController | null>(null);

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        searchAbortRef.current?.abort();
        setResults([]);
        setIsSearching(false);
        return;
      }
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setIsSearching(true);
      try {
        const res = await fetch(`/api/v1/books/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Search request failed with status ${res.status}`);
        }
        const json = await res.json();
        if (!controller.signal.aborted && json.success) {
          setResults(json.data);
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.error('Search failed', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }
    search();
    return () => {
      searchAbortRef.current?.abort();
    };
  }, [debouncedQuery]);

  const handleAdd = async (book: BookInsert, key: string) => {
    if (!book.title) {
      alert('Cannot add book with missing title.');
      return;
    }
    setAddingState((prev) => ({ ...prev, [key]: 'loading' }));

    // Server action
    const res = await addBookToShelf(book, { shelf: selectedShelf, rating: undefined });

    if (res.success) {
      setAddingState((prev) => ({ ...prev, [key]: 'success' }));
      setTimeout(() => {
        setAddingState((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }, 3000);
    } else {
      setAddingState((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      alert(res.error || 'Failed to add book.');
    }
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 text-[color:var(--foreground)]" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[color:var(--color-primary)] bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Quick shelf selector for adding */}
        <select
          value={selectedShelf}
          onChange={(e) =>
            setSelectedShelf(
              e.target.value as 'want_to_read' | 'currently_reading' | 'finished' | 'dnf'
            )
          }
          className="px-4 py-3 rounded-xl border border-[color:var(--color-primary)] bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all shadow-sm"
        >
          <option value="want_to_read">Add to: Want to Read</option>
          <option value="currently_reading">Add to: Reading</option>
          <option value="finished">Add to: Finished</option>
          <option value="dnf">Add to: DNF</option>
        </select>
      </div>

      <div className="flex-1 rounded-2xl bg-white/40 border border-white/60 backdrop-blur shadow-inner p-4 md:p-6 overflow-y-auto">
        {isSearching ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[color:var(--foreground)] opacity-60">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[color:var(--color-primary)]" />
            <p>Searching Open Library...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {results.map((book, idx) => {
              const key = book.openlibrary_id || `${book.title}-${idx}`;
              const state = addingState[key];

              return (
                <div
                  key={key}
                  className="flex gap-4 p-4 rounded-xl bg-white/80 shadow-sm border border-black/5 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 md:w-20 aspect-[2/3] bg-gray-200 rounded overflow-hidden shrink-0">
                    {book.cover_url ? (
                      <BookCoverImage
                        title={book.title}
                        coverUrl={book.cover_url}
                        width={80}
                        height={120}
                        sizes="(max-width: 768px) 64px, 80px"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[color:var(--color-primary)] flex items-center justify-center p-1">
                        <p className="text-white text-[10px] text-center leading-tight line-clamp-3 font-serif">
                          {book.title}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-base md:text-lg text-[color:var(--foreground)] line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[color:var(--foreground)] opacity-70 line-clamp-1">
                      {book.author}
                    </p>
                    <p className="text-xs text-[color:var(--foreground)] opacity-50 mt-1">
                      {book.published_year ? `Published ${book.published_year} · ` : ''}
                      {book.isbn ? `ISBN: ${book.isbn}` : 'No ISBN'}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    <button
                      onClick={() => handleAdd(book, key)}
                      disabled={!!state}
                      className={`p-3 md:px-4 md:py-2 rounded-lg flex items-center justify-center transition-all ${
                        state === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[color:var(--color-primary)] text-white hover:brightness-110 shadow-sm disabled:opacity-50'
                      }`}
                    >
                      {state === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin md:mr-2" />
                      ) : state === 'success' ? (
                        <Check className="w-5 h-5 md:mr-2" />
                      ) : (
                        <Plus className="w-5 h-5 md:mr-2" />
                      )}
                      <span className="hidden md:inline font-semibold">
                        {state === 'success' ? 'Added' : state === 'loading' ? 'Adding...' : 'Add'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : debouncedQuery ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[color:var(--foreground)] opacity-60">
            <p>No results found for &quot;{debouncedQuery}&quot;.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[color:var(--foreground)] opacity-50 text-center">
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="max-w-xs">
              Type a book title or author above to search the global catalogue and add to your
              library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
