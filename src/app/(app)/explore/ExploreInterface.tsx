/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search,
  Loader2,
  Check,
  Star,
  ArrowLeft,
  X,
  TrendingUp,
  Flame,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { addBookToShelf, type BookInsert } from '@/app/actions/shelf.actions';
import BookCoverImage from '@/components/BookCoverImage';
import { normalizeCoverUrl, normalizeOpenLibraryWorkId } from '@/lib/books';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  openlibrary_id: string;
  rating?: number;
  isSaved?: boolean;
}

function buildSearchResultKey(book: BookInsert, index: number) {
  const normalizedOpenLibraryId = normalizeOpenLibraryWorkId(book.openlibrary_id);
  if (normalizedOpenLibraryId) {
    return normalizedOpenLibraryId;
  }

  const normalizedCoverUrl = normalizeCoverUrl(book.cover_url) ?? 'no-cover';
  const title = book.title.trim().toLowerCase();
  const author = book.author.trim().toLowerCase();
  return `${title}::${author}::${normalizedCoverUrl}::${index}`;
}

// ── 25 Genre Tags with background images ─────────────────────────────────────
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

// ── Curated Ideas for search overlay ─────────────────────────────────────────
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
  {
    label: 'Feminist reads',
    query: 'feminist_fiction',
    img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=300',
  },
  {
    label: 'Hidden gems',
    query: 'underrated_novels',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300',
  },
  {
    label: 'Midnight reads',
    query: 'dark_fiction',
    img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=300',
  },
  {
    label: 'Mind-bending sci-fi',
    query: 'mind_bending_scifi',
    img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300',
  },
];

// ── Trend Filters ─────────────────────────────────────────────────────────────
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

// ── Portrait Category Cards (bottom grid) ─────────────────────────────────────
const CATEGORIES = [
  {
    name: 'Dark Academia',
    query: 'dark_academia',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    hint: 'Gothic Ivy & Scholarly Secrets',
  },
  {
    name: 'Solarpunk',
    query: 'solarpunk',
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    hint: 'Green Futures & Optimism',
  },
  {
    name: 'Gothic Horror',
    query: 'gothic_horror',
    img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop',
    hint: 'Melancholy & Haunted Halls',
  },
  {
    name: 'Cyberpunk',
    query: 'cyberpunk',
    img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop',
    hint: 'Neon Nightmares & Digital Noir',
  },
  {
    name: 'Cozy Mystery',
    query: 'cozy_mystery',
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    hint: 'Tea, Knits & Quiet Crimes',
  },
  {
    name: 'Magic Realism',
    query: 'magic_realism',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    hint: 'Surreal Wonder in Every Day',
  },
  {
    name: 'Epistolary',
    query: 'epistolary',
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
    hint: 'Lost Letters & Found Diaries',
  },
  {
    name: 'Modern Classics',
    query: 'modern_classics',
    img: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=800&auto=format&fit=crop',
    hint: 'Defining Voices of Our Era',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ExploreInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'categories' | 'results'>('categories');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<
    { label: string; query: string; img?: string }[]
  >([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const { scrollDirection } = useScrollDirection('main');

  // Close overlays on click outside
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

  useEffect(() => {
    return () => searchAbortRef.current?.abort();
  }, []);

  const handleSearch = useCallback(
    async (searchQuery: string, label?: string, coverImg?: string) => {
      if (!searchQuery.trim()) return;
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearchFocused(false);
      setFilterOpen(false);
      setIsLoading(true);
      setView('results');

      // Save to recent searches
      if (label) {
        setRecentSearches((prev) => {
          const filtered = prev.filter((r) => r.query !== searchQuery);
          const entry: { label: string; query: string; img?: string } = {
            label,
            query: searchQuery,
          };
          if (coverImg) entry.img = coverImg;
          return [entry, ...filtered].slice(0, 8);
        });
      }

      try {
        const res = await fetch(
          `/api/v1/books/search?q=${encodeURIComponent(searchQuery)}&limit=30`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          throw new Error(`Search request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (controller.signal.aborted) return;

        const books = Array.isArray(data.data) ? (data.data as BookInsert[]) : [];
        setResults(
          books.map((book, index) => ({
            id: buildSearchResultKey(book, index),
            title: book.title,
            author: book.author,
            cover_url: normalizeCoverUrl(book.cover_url) ?? '',
            openlibrary_id: normalizeOpenLibraryWorkId(book.openlibrary_id) ?? '',
            isSaved: false,
          }))
        );
      } catch (e) {
        if (!(e instanceof Error && e.name === 'AbortError')) {
          console.error(e);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const handleFilterClick = (f: (typeof FILTERS)[0]) => {
    setActiveFilter(f.label);
    setActiveTag(null);
    setFilterOpen(false);
    handleSearch(f.query, f.label);
  };

  const handleTagClick = (tag: (typeof TAGS)[0]) => {
    setActiveTag(tag.label);
    setActiveFilter(null);
    setQuery(tag.label);
    handleSearch(tag.query, tag.label, tag.img);
  };

  const handleQuickSave = async (book: SearchResult) => {
    if (savingId) return;
    const normalizedOpenLibraryId = normalizeOpenLibraryWorkId(book.openlibrary_id);
    if (!normalizedOpenLibraryId) {
      alert('This book is missing a valid Open Library identifier and cannot be saved yet.');
      return;
    }
    setSavingId(book.id);
    try {
      const result = await addBookToShelf(
        {
          title: book.title,
          author: book.author,
          isbn: null,
          cover_url: book.cover_url || null,
          description: null,
          published_year: null,
          genres: [],
          openlibrary_id: `/works/${normalizedOpenLibraryId}`,
          cover_source: 'open_library',
          cover_id: null,
        },
        { shelf: 'want_to_read', rating: undefined }
      );

      if (!result.success) {
        throw new Error(result.error || 'Login to save');
      }
      setResults((prev) => prev.map((b) => (b.id === book.id ? { ...b, isSaved: true } : b)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-32">
      {/* ── SEO ── */}
      <h1 className="sr-only">Readmora: Stay Inspired with Your Personal Book Discovery Hub</h1>

      {/* ── Adaptive Header Section ── */}
      <div className="sticky top-0 z-40 pt-6 pb-2 transition-all duration-500 will-change-transform translate3d">
        {/* Row 1: Search Bar (Always Sticky) */}
        <div ref={searchRef} className="w-full max-w-3xl mx-auto relative z-50 px-1">
          <div
            className={cn(
              'bg-[#E9E9E9] rounded-full flex px-5 py-3.5 items-center transition-all duration-200 shadow-sm',
              searchFocused
                ? 'bg-white shadow-2xl ring-2 ring-black/10 rounded-b-none rounded-t-2xl'
                : 'hover:bg-[#DCDCDC]'
            )}
          >
            <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Explore your next read…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(query, query);
                if (e.key === 'Escape') setSearchFocused(false);
              }}
              className="w-full bg-transparent border-none outline-none text-[#111111] font-medium placeholder:text-gray-500 text-base"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors mr-1"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-b-2xl border border-t-0 border-black/5 max-h-[70vh] overflow-y-auto z-40"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Recent searches
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {recentSearches.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(r.label);
                            handleSearch(r.query, r.label, r.img);
                          }}
                          className="flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                        >
                          {r.img ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={r.img}
                                alt={r.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                              <Search className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                          <span className="text-xs font-semibold text-gray-700 leading-snug truncate">
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ideas for you */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Ideas for you
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {IDEAS.map((idea) => (
                      <button
                        key={idea.label}
                        onClick={() => {
                          setQuery(idea.label);
                          handleSearch(idea.query, idea.label, idea.img);
                        }}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        <img
                          src={idea.img}
                          alt={idea.label}
                          className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-[0.5] transition-all"
                        />
                        <div className="absolute inset-0 flex items-end p-2">
                          <span className="text-white text-xs font-bold leading-tight text-left drop-shadow">
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

        {/* Row 2: Tags & Filter Toggle (Adaptive Scroll) */}
        <motion.div
          animate={{
            y: scrollDirection === 'down' ? -80 : 0,
            opacity: scrollDirection === 'down' ? 0 : 1,
            scale: scrollDirection === 'down' ? 0.95 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto flex items-center gap-3 mt-4 will-change-transform translate3d"
        >
          {/* Filter Dropdown Toggle */}
          <div ref={filterRef} className="relative shrink-0 ml-1">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm border border-black/5 hover:scale-105 active:scale-95',
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
                  className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-black/5 p-3 flex flex-col gap-1 z-50 overflow-hidden translate3d"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">
                    Discovery Mode
                  </p>
                  {FILTERS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.label}
                        onClick={() => handleFilterClick(f)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-[1.25rem] text-sm font-bold transition-all group',
                          activeFilter === f.label
                            ? 'bg-gray-900 text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              activeFilter === f.label ? 'text-white' : f.color
                            )}
                          />
                          <span>{f.label}</span>
                        </div>
                        {activeFilter === f.label ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 -rotate-90" />
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
                    'relative flex-shrink-0 h-9 pl-1.5 pr-4 rounded-full flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-sm bg-white/50 backdrop-blur-sm border border-black/5',
                    activeTag === tag.label
                      ? 'ring-2 ring-black bg-white shadow-md'
                      : 'hover:ring-1 hover:ring-black/20 text-gray-700'
                  )}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                    <img src={tag.img} alt={tag.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="whitespace-nowrap">{tag.label}</span>
                  {activeTag === tag.label && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black ml-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Main Content ── */}
      <div className="mt-8">
        {view === 'categories' ? (
          <>
            {/* Context Title */}
            <div className="space-y-0.5 text-center mb-10">
              <p className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase">
                Viewing Trends
              </p>
              <p className="text-4xl font-black text-[#111111] tracking-tight">Stay Inspired</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-700">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => {
                    setQuery(cat.name);
                    handleSearch(cat.query, cat.name, cat.img);
                  }}
                  className="relative aspect-[2/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                >
                  <img
                    src={cat.img}
                    className="w-full h-full object-cover transition-transform duration-700 brightness-[0.7] group-hover:brightness-[0.6] group-hover:scale-105"
                    alt={cat.name}
                  />
                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end items-center text-center bg-gradient-to-t from-black/95 via-black/20 to-transparent">
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-200 mb-1 leading-none drop-shadow-sm">
                      {cat.hint}
                    </p>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-[1.1]">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setView('categories');
                  setActiveTag(null);
                  setActiveFilter(null);
                  setQuery('');
                }}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Inspiration
              </button>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                {activeTag && (
                  <span className="bg-gray-900 text-white px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <span>{activeTag}</span>
                    <button
                      onClick={() => {
                        setActiveTag(null);
                        setView('categories');
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeFilter && (
                  <span className="bg-gray-900 text-white px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <span>{activeFilter}</span>
                    <button
                      onClick={() => {
                        setActiveFilter(null);
                        setView('categories');
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {!isLoading && results.length > 0 && <span>{results.length} books found</span>}
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-5 space-y-5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="break-inside-avoid mb-5">
                    <div className="aspect-[2/3] rounded-3xl bg-gray-100 animate-pulse" />
                    <div className="mt-2 space-y-1.5 px-1">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                      <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-5 space-y-8 pb-32">
                {results.map((book, index) => (
                  <div
                    key={book.id}
                    className="break-inside-avoid group cursor-pointer mb-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
                  >
                    {book.openlibrary_id ? (
                      <Link href={`/book/${book.openlibrary_id}`} className="block">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-50 border border-black/5">
                          <div className="aspect-[2/3] relative">
                            <BookCoverImage
                              title={book.title}
                              coverUrl={book.cover_url}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-90"
                              priority={index < 4}
                            />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!book.isSaved) handleQuickSave(book);
                                }}
                                disabled={
                                  savingId === book.id || book.isSaved || !book.openlibrary_id
                                }
                                className={cn(
                                  'absolute top-4 right-4 text-white px-5 py-2.5 rounded-full font-black text-xs shadow-xl transform active:scale-95 transition-all flex items-center gap-1.5',
                                  book.isSaved ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'
                                )}
                              >
                                {savingId === book.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : book.isSaved ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : null}
                                {book.isSaved ? 'Saved' : 'Save'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="relative rounded-[2rem] overflow-hidden border border-dashed border-black/10 bg-gray-50/70 opacity-80"
                        aria-disabled="true"
                        title="This result is missing a valid Open Library page"
                      >
                        <div className="aspect-[2/3] relative">
                          <BookCoverImage
                            title={book.title}
                            coverUrl={book.cover_url}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover"
                            priority={index < 4}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                              Detail Page Unavailable
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 px-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate leading-snug hover:underline underline-offset-2 transition-all">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium truncate mb-1 uppercase tracking-tighter opacity-70">
                        {book.author}
                      </p>
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-black text-gray-400">
                            {book.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">
                  No books found. Try a different tag or search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
