/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Loader2,
  Search,
  BookOpen,
  MoreHorizontal,
  Check,
  Star,
  X,
  TrendingUp,
  Flame,
  Sparkles,
  Award,
  Clock,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ingestBook } from '@/lib/actions/book-actions';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface DiscoveryBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  openlibrary_id: string;
  genre: string;
  isSaved?: boolean;
  rating?: number;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  ratings_average?: number;
}

interface ProfileData {
  genre_preferences: string[];
}

const SEARCH_LIMIT = 24;

function dedupeDiscoveryBooks(books: DiscoveryBook[]): DiscoveryBook[] {
  const dedupedBooks = new Map<string, DiscoveryBook>();

  for (const book of books) {
    const stableKey = book.openlibrary_id || book.id;
    const existingBook = dedupedBooks.get(stableKey);

    if (!existingBook) {
      dedupedBooks.set(stableKey, book);
      continue;
    }

    const mergedRating = existingBook.rating ?? book.rating;

    dedupedBooks.set(stableKey, {
      ...existingBook,
      ...book,
      genre: existingBook.genre,
      ...(existingBook.isSaved || book.isSaved ? { isSaved: true } : {}),
      ...(mergedRating !== undefined ? { rating: mergedRating } : {}),
    });
  }

  return Array.from(dedupedBooks.values());
}

// ── Shared Discovery Tech ───────────────────────────────────────────────────

const TAGS = [
  {
    label: 'Romance',
    query: 'romance',
    img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Fantasy',
    query: 'fantasy',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Sci-Fi',
    query: 'science_fiction',
    img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Thriller',
    query: 'thriller',
    img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Mystery',
    query: 'mystery',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Dark Academia',
    query: 'dark_academia',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Horror',
    query: 'horror',
    img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Historical',
    query: 'historical_fiction',
    img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Self-Help',
    query: 'self_help',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Biography',
    query: 'biography',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Non-Fiction',
    query: 'nonfiction',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Poetry',
    query: 'poetry',
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Cozy Mystery',
    query: 'cozy_mystery',
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Solarpunk',
    query: 'solarpunk',
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Cyberpunk',
    query: 'cyberpunk',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Magic Realism',
    query: 'magic_realism',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Young Adult',
    query: 'young_adult',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Philosophy',
    query: 'philosophy',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Science',
    query: 'popular_science',
    img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Graphic Novel',
    query: 'graphic_novel',
    img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Literary Fiction',
    query: 'literary_fiction',
    img: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Travel',
    query: 'travel',
    img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Business',
    query: 'business',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Gothic',
    query: 'gothic_fiction',
    img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Epistolary',
    query: 'epistolary',
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&auto=format&fit=crop',
  },
];

const IDEAS = [
  {
    label: 'Books that change lives',
    query: 'life_changing_books',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300',
  },
  {
    label: 'Award-winning fiction',
    query: 'booker_prize',
    img: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=300',
  },
  {
    label: 'Read in one sitting',
    query: 'page_turner thriller',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=300',
  },
  {
    label: 'Slow mornings',
    query: 'cozy contemplative',
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300',
  },
];

const FILTERS = [
  { label: 'Trending', icon: TrendingUp, query: 'bestsellers 2024', color: 'text-orange-500' },
  { label: 'Hot', icon: Flame, query: 'most popular fiction 2024', color: 'text-red-500' },
  { label: 'New', icon: Sparkles, query: 'new releases 2024', color: 'text-blue-500' },
  { label: 'Award Winners', icon: Award, query: 'prize winning fiction', color: 'text-yellow-500' },
  {
    label: 'All Time',
    icon: BookOpen,
    query: 'greatest novels all time',
    color: 'text-purple-500',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

async function fetchBooksForGenre(genre: string, page: number): Promise<DiscoveryBook[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=subject:${genre}&limit=${SEARCH_LIMIT}&page=${page + 1}&fields=key,title,author_name,cover_i,ratings_average`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.docs ?? [])
    .filter((doc: OpenLibraryDoc) => doc.cover_i)
    .map((doc: OpenLibraryDoc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? 'Unknown Author',
      cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
      openlibrary_id: doc.key.split('/')[2],
      genre,
      rating: doc.ratings_average,
    }));
}

async function searchBooks(query: string): Promise<DiscoveryBook[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}&fields=key,title,author_name,cover_i,ratings_average`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.docs ?? [])
    .filter((doc: OpenLibraryDoc) => doc.cover_i)
    .map((doc: OpenLibraryDoc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? 'Unknown Author',
      cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
      openlibrary_id: doc.key.split('/')[2],
      genre: 'Search Result',
      rating: doc.ratings_average,
    }));
}

export default function MasonryHomeFeed() {
  const supabase = createSupabaseBrowserClient();

  const [books, setBooks] = useState<DiscoveryBook[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Advanced Discovery States
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<
    { label: string; query: string; img?: string }[]
  >([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1, rootMargin: '200px' });
  const { scrollDirection } = useScrollDirection('main');

  // Close overlay on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setIsSearching(false);
    setActiveTag(null);
    setActiveFilter(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let resolvedGenres: string[] = ['fiction'];

      if (user) {
        const { data } = (await supabase
          .from('profiles')
          .select('genre_preferences')
          .eq('id', user.id)
          .maybeSingle()) as { data: ProfileData | null };

        if (data?.genre_preferences?.length && data.genre_preferences.length > 0) {
          resolvedGenres = data.genre_preferences.slice(0, 4);
        }
      }

      setGenres(resolvedGenres);

      const results = await Promise.all(resolvedGenres.map((g) => fetchBooksForGenre(g, 0)));
      const merged = dedupeDiscoveryBooks(results.flat()).sort(() => Math.random() - 0.5);
      setBooks(merged);
      setPage(1);
      setHasMore(merged.length >= SEARCH_LIMIT);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    init();
  }, [init]);

  const handleExecuteSearch = async (queryToUse: string, label?: string, coverImg?: string) => {
    if (!queryToUse.trim()) {
      init();
      return;
    }
    setLoading(true);
    setIsSearching(true);
    setSearchFocused(false);
    setFilterOpen(false);

    // Save to recent searches
    if (label) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((r) => r.query !== queryToUse);
        const entry: { label: string; query: string; img?: string } = { label, query: queryToUse };
        if (coverImg) entry.img = coverImg;
        return [entry, ...filtered].slice(0, 8);
      });
    }

    try {
      const results = dedupeDiscoveryBooks(await searchBooks(queryToUse));
      setBooks(results);
      setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: (typeof TAGS)[0]) => {
    setActiveTag(tag.label);
    setActiveFilter(null);
    setSearchQuery(tag.label);
    handleExecuteSearch(tag.query, tag.label, tag.img);
  };

  const handleFilterClick = (f: (typeof FILTERS)[0]) => {
    setActiveFilter(f.label);
    setActiveTag(null);
    setFilterOpen(false);
    setSearchQuery(f.label);
    handleExecuteSearch(f.query, f.label);
  };

  const clearSearch = () => {
    setSearchQuery('');
    init();
  };

  useEffect(() => {
    if (!inView || loadingMore || loading || !hasMore || genres.length === 0 || isSearching) return;

    async function loadMore() {
      setLoadingMore(true);
      try {
        const results = await Promise.all(genres.map((g) => fetchBooksForGenre(g, page)));
        const newBooks = results.flat().sort(() => Math.random() - 0.5);
        if (newBooks.length === 0) {
          setHasMore(false);
        } else {
          setBooks((prev) => dedupeDiscoveryBooks([...prev, ...newBooks]));
          setPage((p) => p + 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMore(false);
      }
    }
    loadMore();
  }, [inView, genres, hasMore, loading, loadingMore, page, isSearching]);

  const handleQuickSave = async (book: DiscoveryBook) => {
    if (savingId) return;
    setSavingId(book.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to save books');

      const { data: newBook, error: ingestErr } = await ingestBook({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        genres: [book.genre],
        openlibrary_id: book.openlibrary_id,
      });

      if (ingestErr) throw ingestErr;

      if (newBook && 'id' in newBook) {
        const { error: shelfErr } = await supabase.from('shelf_entries').insert({
          user_id: user.id,
          book_id: (newBook as { id: string }).id,
          shelf: 'want_to_read',
        } as any);

        if (shelfErr) throw shelfErr;
      }
      setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, isSaved: true } : b)));
    } catch (e: any) {
      alert(e.message || 'Failed to save book');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-full px-4 py-6 md:px-8 w-full max-w-[1600px] mx-auto pb-28 md:pb-8 font-sans">
      {/* Adaptive Header (Sticky inspired by Pinterest) */}
      <div className="sticky top-0 z-40 pt-4 pb-2 transition-all duration-500 will-change-transform translate3d">
        {/* Row 1: Search Bar (Permanent Sticky) */}
        <div ref={searchRef} className="w-full max-w-2xl mx-auto relative z-50">
          <div
            className={cn(
              'bg-white/95 backdrop-blur-xl border-2 shadow-xl flex px-5 py-3.5 items-center transition-all duration-300 group',
              searchFocused
                ? 'rounded-t-2xl border-black/10 shadow-2xl ring-4 ring-black/5'
                : 'rounded-full border-black/5 hover:border-black/10 hover:shadow-2xl'
            )}
          >
            <Search
              className={cn(
                'w-5 h-5 mr-3 transition-colors',
                searchFocused ? 'text-gray-900' : 'text-gray-400'
              )}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for your next adventure…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(searchQuery, searchQuery)}
              className="w-full bg-transparent border-none outline-none text-foreground font-bold placeholder:text-gray-400 text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-[color:var(--color-primary)] ml-1" />
            )}
          </div>

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-b-2xl border border-t-0 border-black/5 max-h-[70vh] overflow-y-auto z-40"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="px-5 py-5 border-b border-gray-100/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Recent searches
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {recentSearches.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(r.label);
                            handleExecuteSearch(r.query, r.label, r.img);
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all text-left group border border-transparent hover:border-black/5"
                        >
                          {r.img ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={r.img}
                                alt={r.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-black/5 shrink-0 flex items-center justify-center">
                              <Search className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-gray-700 leading-tight truncate">
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discovery Ideas */}
                <div className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Discovery Ideas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {IDEAS.map((idea) => (
                      <button
                        key={idea.label}
                        onClick={() => {
                          setSearchQuery(idea.label);
                          handleExecuteSearch(idea.query, idea.label, idea.img);
                        }}
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.03] transition-transform shadow-sm"
                      >
                        <img
                          src={idea.img}
                          alt={idea.label}
                          className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-[0.45] transition-all"
                        />
                        <div className="absolute inset-0 flex items-end p-3">
                          <span className="text-white text-[11px] font-black leading-tight text-left uppercase tracking-wider drop-shadow-md">
                            {idea.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 2: Adaptive Tag & Filter Bar */}
        <motion.div
          animate={{
            y: scrollDirection === 'down' ? -80 : 0,
            opacity: scrollDirection === 'down' ? 0 : 1,
            scale: scrollDirection === 'down' ? 0.95 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto flex items-center gap-3 mt-4 px-1"
        >
          {/* Filter Dropdown Toggle */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-xl border border-black/5 hover:scale-105 active:scale-95',
                filterOpen || activeFilter
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-600'
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-full left-0 mt-3 w-60 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-black/5 p-3 flex flex-col gap-1 z-50 overflow-hidden translate3d"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-5 py-3">
                    Discovery Mode
                  </p>
                  {FILTERS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.label}
                        onClick={() => handleFilterClick(f)}
                        className={cn(
                          'w-full flex items-center justify-between px-5 py-3.5 rounded-[1.5rem] text-sm font-bold transition-all group',
                          activeFilter === f.label
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              activeFilter === f.label ? 'text-white' : f.color
                            )}
                          />
                          <span>{f.label}</span>
                        </div>
                        {activeFilter === f.label ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-30 -rotate-90" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Horizontal Tags Scroll */}
          <div className="flex-1 overflow-x-auto scrollbar-hide py-1 overflow-hidden overscroll-contain">
            <div className="flex gap-2.5 w-max px-1 items-center">
              {TAGS.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    'relative flex-shrink-0 h-9 pl-1.5 pr-4 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg bg-white/60 backdrop-blur-md border border-black/5',
                    activeTag === tag.label
                      ? 'ring-2 ring-black scale-105 bg-white shadow-xl'
                      : 'hover:ring-1 hover:ring-black/20'
                  )}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                    <img src={tag.img} alt={tag.label} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className={cn(
                      'whitespace-nowrap font-bold text-sm',
                      activeTag === tag.label ? 'text-gray-900' : 'text-gray-700'
                    )}
                  >
                    {tag.label}
                  </span>
                  {activeTag === tag.label && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black ml-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Feed */}
      <div className="mt-6">
        {loading && books.length === 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-5 space-y-8">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="rounded-3xl bg-gray-100 animate-pulse aspect-[2/3] mb-3" />
                <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-5 space-y-10">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="break-inside-avoid group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <Link href={`/book/${book.openlibrary_id}`} className="block">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-50 border border-black/5">
                      <div className="aspect-[2/3] relative">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-90"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!book.isSaved) handleQuickSave(book);
                            }}
                            disabled={savingId === book.id || book.isSaved}
                            className={cn(
                              'absolute top-5 right-5 text-white px-5 py-2.5 rounded-full font-black text-sm shadow-xl transform active:scale-95 transition-all flex items-center gap-2',
                              book.isSaved ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'
                            )}
                          >
                            {savingId === book.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : book.isSaved ? (
                              <Check className="w-4 h-4" />
                            ) : null}
                            {book.isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 px-1 flex items-start justify-between gap-3 overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug truncate hover:underline underline-offset-2 transition-all">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-1 truncate uppercase tracking-tighter opacity-70">
                        {book.author}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 h-4">
                        {book.rating ? (
                          <>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'w-3 h-3',
                                    i <= Math.round(book.rating!)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-100 text-gray-200'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 ml-1">
                              {book.rating.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                            New Entry
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors shrink-0">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div ref={sentinelRef} className="flex justify-center py-24">
              {loadingMore && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[color:var(--color-primary)] animate-spin" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">
                    Summoning volumes...
                  </p>
                </div>
              )}
              {!hasMore && !loadingMore && !isSearching && (
                <div className="text-center py-20 opacity-30">
                  <BookOpen className="w-10 h-10 mx-auto mb-3" />
                  <p className="font-black uppercase text-[11px] tracking-[0.3em]">
                    All Collections Catalogued
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
