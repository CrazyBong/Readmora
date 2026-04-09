/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Star, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function KanbanDashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const supabase = createSupabaseBrowserClient();
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchEntries = useCallback(
    async (pageNum: number) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const limit = 20;
        const from = pageNum * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
          .from('shelf_entries')
          .select(
            `
          *,
          book:books(*)
        `
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data) {
          setEntries((prev) => {
            const newEntries = [...prev, ...data];
            // Filter dupes just in case strict mode double-fires
            return Array.from(new Map(newEntries.map((item) => [item.id, item])).values());
          });
          if (data.length < limit) {
            setHasMore(false);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Initial load
  useEffect(() => {
    fetchEntries(0);
  }, [fetchEntries]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entriesObserver) => {
        if (entriesObserver[0]?.isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchEntries(nextPage);
        }
      },
      { rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchEntries]);

  // Grouping logic for Kanban
  const wantToRead = entries.filter((e) => e.shelf === 'want_to_read');
  const currentlyReading = entries.filter((e) => e.shelf === 'currently_reading');
  const finished = entries.filter((e) => e.shelf === 'finished' || e.shelf === 'dnf');

  const renderStars = (rating: number | null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${rating && s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  const KanbanColumn = ({
    title,
    icon,
    items,
    actionLabel,
  }: {
    title: string;
    icon: React.ReactNode;
    items: any[];
    actionLabel: string;
  }) => (
    <div className="flex flex-col bg-card/60 backdrop-blur-sm rounded-2xl border border-[color:var(--color-primary)] p-4 shadow-sm min-w-0">
      <div className="flex items-center gap-2 px-2 py-3 border-b mb-4 font-[family-name:var(--font-display)]">
        <span className="text-[color:var(--color-primary)]">{icon}</span>
        <h3 className="font-semibold text-foreground/80">{title}</h3>
      </div>

      <Link
        href="/search"
        className="flex items-center justify-center gap-2 bg-white hover:bg-black/5 hover:text-[color:var(--color-primary)] border border-dashed border-gray-300 rounded-xl py-3 mb-4 transition-colors font-medium text-sm text-muted-foreground w-full"
      >
        <Plus className="w-4 h-4" /> Add A New Book
      </Link>

      <div className="flex flex-col gap-4 flex-1">
        {items.map((entry) => (
          <Link href={`/book/${entry.book.id}`} key={entry.id} className="block group">
            <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-3 right-3 text-gray-300 hover:text-[color:var(--color-primary)] transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-16 h-24 shrink-0 rounded-md bg-gray-100 shadow-sm overflow-hidden flex items-center justify-center border border-black/5">
                  {entry.book.cover_url ? (
                    <img
                      src={entry.book.cover_url}
                      alt={entry.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-center text-muted-foreground italic px-1">
                      {entry.book.title}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-display font-semibold text-sm leading-tight mb-1 text-foreground line-clamp-2">
                    {entry.book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gray-200 inline-block overflow-hidden">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.book.author}`}
                        alt="author"
                        className="w-full h-full object-cover opacity-50"
                      />
                    </span>{' '}
                    {entry.book.author}
                  </p>
                  {renderStars(entry.rating)}
                </div>
              </div>

              {/* Meta line */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold mb-3">
                {entry.started_at && (
                  <span>Started {new Date(entry.started_at).toLocaleDateString()}</span>
                )}
                {!entry.started_at && entry.finished_at && (
                  <span>Finished {new Date(entry.finished_at).toLocaleDateString()}</span>
                )}
                {entry.shelf === 'currently_reading' && (
                  <span className="ml-auto text-[color:var(--color-accent)]">In Progress</span>
                )}
              </div>

              {/* Progress bar mock */}
              {entry.shelf === 'currently_reading' && (
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mb-4 relative">
                  <div className="absolute top-0 left-0 h-full bg-[color:var(--color-accent)] w-[45%]" />
                </div>
              )}

              <button className="w-full py-2 bg-gray-50 hover:bg-gray-100/50 border text-xs font-semibold rounded-lg transition-colors text-foreground">
                {actionLabel}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-[color:var(--color-primary)] mb-6">
          Bookshelves
        </h1>

        {/* Navigation Tabs - Imitating Goodreads */}
        <div className="flex space-x-8 border-b border-gray-200 text-sm font-medium text-muted-foreground">
          <button className="text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)] pb-2 transition-colors inline-flex">
            Board
          </button>
          <button
            className="hover:text-foreground pb-2 transition-colors cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            Table
          </button>
          <button
            className="hover:text-foreground pb-2 transition-colors cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            Timeline
          </button>
          <button
            className="hover:text-foreground pb-2 transition-colors cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            Calendar
          </button>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start pb-8">
        <KanbanColumn
          title="Want To Read"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          }
          items={wantToRead}
          actionLabel="Update Progress"
        />

        <KanbanColumn
          title="Currently Reading"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
          items={currentlyReading}
          actionLabel="Update Progress"
        />

        <KanbanColumn
          title="Read"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
          items={finished}
          actionLabel="Write A Review"
        />
      </div>

      {loading && (
        <div className="w-full py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[color:var(--color-primary)]" />
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !loading && <div ref={loaderRef} className="w-full h-10 opacity-0" />}
    </div>
  );
}
