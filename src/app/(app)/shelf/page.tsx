/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Plus,
  Route,
  Rows3,
  Star,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Book, ShelfEntry, ShelfType } from '@/types/database';

type ShelfView = 'board' | 'table' | 'timeline' | 'calendar';

type ShelfPageBook = Pick<Book, 'id' | 'title' | 'author' | 'cover_url'>;

type ShelfPageEntry = Pick<
  ShelfEntry,
  'id' | 'shelf' | 'rating' | 'started_at' | 'finished_at' | 'created_at'
> & {
  book: ShelfPageBook | null;
};

type ShelfSection = {
  actionLabel: string;
  key: ShelfType;
  title: string;
};

const PAGE_SIZE = 20;

const SHELF_SECTIONS: ShelfSection[] = [
  { key: 'want_to_read', title: 'Want To Read', actionLabel: 'Plan Reading' },
  { key: 'currently_reading', title: 'Currently Reading', actionLabel: 'Log Progress' },
  { key: 'finished', title: 'Finished', actionLabel: 'Revisit Notes' },
  { key: 'dnf', title: 'Did Not Finish', actionLabel: 'Archive Thoughts' },
];

const VIEW_TABS: Array<{ icon: typeof LayoutGrid; id: ShelfView; label: string }> = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'table', label: 'Table', icon: Rows3 },
  { id: 'timeline', label: 'Timeline', icon: Route },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

function getShelfIcon(shelf: ShelfType) {
  switch (shelf) {
    case 'want_to_read':
      return <Bookmark className="h-4 w-4" />;
    case 'currently_reading':
      return <BookOpen className="h-4 w-4" />;
    case 'finished':
      return <Check className="h-4 w-4" />;
    case 'dnf':
      return <CircleSlash className="h-4 w-4" />;
  }
}

function getShelfLabel(shelf: ShelfType) {
  switch (shelf) {
    case 'want_to_read':
      return 'Want to Read';
    case 'currently_reading':
      return 'Currently Reading';
    case 'finished':
      return 'Finished';
    case 'dnf':
      return 'DNF';
  }
}

function getPrimaryDate(entry: ShelfPageEntry): Date {
  const source = entry.finished_at ?? entry.started_at ?? entry.created_at;
  return new Date(source);
}

function getDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getEntryDateKey(entry: ShelfPageEntry): string {
  return getDateKey(entry.finished_at ?? entry.started_at ?? entry.created_at);
}

function formatShortDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthLabel(value: Date): string {
  return value.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function getTimelineLabel(entry: ShelfPageEntry): string {
  if (entry.finished_at) return entry.shelf === 'dnf' ? 'Marked as DNF' : 'Finished reading';
  if (entry.started_at) return 'Started reading';
  return 'Added to shelf';
}

function renderStars(rating: number | null) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={`h-3.5 w-3.5 ${
            rating && step <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function BookCover({ book }: { book: ShelfPageBook | null }) {
  if (!book) {
    return (
      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs italic text-muted-foreground">
        Missing book
      </div>
    );
  }

  if (book.cover_url) {
    return (
      <Image
        src={book.cover_url}
        alt={book.title}
        fill
        sizes="(max-width: 768px) 64px, 96px"
        className="object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs italic text-muted-foreground">
      {book.title}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--color-primary)]/30 bg-white/70 p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function ShelfPage() {
  const [entries, setEntries] = useState<ShelfPageEntry[]>([]);
  const [activeView, setActiveView] = useState<ShelfView>('board');
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [supabase] = useState(() => createSupabaseBrowserClient());
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchEntries(pageNumber: number) {
      try {
        if (pageNumber === 0) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || isCancelled) {
          return;
        }

        const from = pageNumber * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from('shelf_entries')
          .select(
            `
              id,
              shelf,
              rating,
              started_at,
              finished_at,
              created_at,
              book:books(id, title, author, cover_url)
            `
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to)
          .returns<ShelfPageEntry[]>();

        if (error) {
          throw error;
        }

        if (isCancelled) {
          return;
        }

        const nextEntries = data ?? [];

        setEntries((previousEntries) => {
          const mergedEntries = [...previousEntries, ...nextEntries];
          return Array.from(new Map(mergedEntries.map((item) => [item.id, item])).values());
        });

        if (nextEntries.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    }

    void fetchEntries(page);

    return () => {
      isCancelled = true;
    };
  }, [page, supabase]);

  useEffect(() => {
    if (!hasMore || loading || isFetchingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          setPage((previousPage) => previousPage + 1);
        }
      },
      { rootMargin: '160px' }
    );

    const loaderElement = loaderRef.current;

    if (loaderElement) {
      observer.observe(loaderElement);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loading]);

  const sections = SHELF_SECTIONS.map((section) => ({
    ...section,
    items: entries.filter((entry) => entry.shelf === section.key),
  }));

  const timelineEntries = [...entries].sort(
    (left, right) => getPrimaryDate(right).getTime() - getPrimaryDate(left).getTime()
  );

  const monthEvents = [...entries]
    .filter((entry) => {
      const date = getPrimaryDate(entry);
      return (
        date.getFullYear() === visibleMonth.getFullYear() &&
        date.getMonth() === visibleMonth.getMonth()
      );
    })
    .sort((left, right) => getPrimaryDate(left).getTime() - getPrimaryDate(right).getTime());

  const eventMap = monthEvents.reduce<Record<string, ShelfPageEntry[]>>((accumulator, entry) => {
    const key = getEntryDateKey(entry);
    accumulator[key] = accumulator[key] ? [...accumulator[key], entry] : [entry];
    return accumulator;
  }, {});

  const calendarStart = new Date(visibleMonth);
  calendarStart.setDate(1 - calendarStart.getDay());

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });

  return (
    <div className="flex min-h-full flex-col p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-[color:var(--color-primary)]">
              Bookshelves
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Switch between a visual board, a sortable library table, a reading timeline, and a
              monthly activity calendar.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add A New Book
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[color:var(--color-primary)] text-white shadow-sm'
                    : 'bg-white text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {activeView === 'board' && (
        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section) => (
            <section
              key={section.key}
              className="flex min-w-0 flex-col rounded-2xl border border-[color:var(--color-primary)]/20 bg-card/60 p-4 shadow-sm backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-2 border-b px-2 py-3 font-[family-name:var(--font-display)]">
                <span className="text-[color:var(--color-primary)]">
                  {getShelfIcon(section.key)}
                </span>
                <h2 className="font-semibold text-foreground/80">{section.title}</h2>
                <span className="ml-auto rounded-full bg-[color:var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[color:var(--color-primary)]">
                  {section.items.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                {section.items.length === 0 ? (
                  <EmptyState message={`No books in ${section.title.toLowerCase()} yet.`} />
                ) : (
                  section.items.map((entry) => (
                    <Link
                      href={entry.book ? `/book/${entry.book.id}` : '/search'}
                      key={entry.id}
                      className="group block"
                    >
                      <article className="relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="absolute right-3 top-3 text-gray-300 transition-colors group-hover:text-[color:var(--color-primary)]">
                          <MoreHorizontal className="h-5 w-5" />
                        </div>

                        <div className="mb-4 flex gap-4">
                          <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md border border-black/5 bg-gray-100 shadow-sm">
                            <BookCover book={entry.book} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                              {entry.book?.title ?? 'Unknown Title'}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {entry.book?.author ?? 'Unknown Author'}
                            </p>
                            <div className="mt-3">{renderStars(entry.rating)}</div>
                          </div>
                        </div>

                        <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase text-muted-foreground">
                          <span>{getTimelineLabel(entry)}</span>
                          <span>{formatShortDate(getPrimaryDate(entry).toISOString())}</span>
                        </div>

                        {entry.shelf === 'currently_reading' && (
                          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full w-full animate-pulse bg-[color:var(--color-accent)]/60" />
                          </div>
                        )}

                        <div className="rounded-lg border bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-foreground">
                          {section.actionLabel}
                        </div>
                      </article>
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {activeView === 'table' && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {entries.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Your shelf is waiting. Search for a book to start building it." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[color:var(--color-bg)]/40">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="px-4 py-4 font-semibold">Book</th>
                    <th className="px-4 py-4 font-semibold">Shelf</th>
                    <th className="px-4 py-4 font-semibold">Started</th>
                    <th className="px-4 py-4 font-semibold">Finished</th>
                    <th className="px-4 py-4 font-semibold">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-black/[0.02]">
                      <td className="px-4 py-4">
                        <Link
                          href={entry.book ? `/book/${entry.book.id}` : '/search'}
                          className="flex items-center gap-3"
                        >
                          <div className="h-16 w-12 overflow-hidden rounded-md border border-black/5 bg-gray-100">
                            <BookCover book={entry.book} />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {entry.book?.title ?? 'Unknown Title'}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {entry.book?.author ?? 'Unknown Author'}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]">
                          {getShelfIcon(entry.shelf)}
                          {getShelfLabel(entry.shelf)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatShortDate(entry.started_at)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatShortDate(entry.finished_at)}
                      </td>
                      <td className="px-4 py-4">{renderStars(entry.rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeView === 'timeline' && (
        <div className="space-y-4 pb-8">
          {timelineEntries.length === 0 ? (
            <EmptyState message="Timeline moments appear once you start adding, starting, or finishing books." />
          ) : (
            timelineEntries.map((entry) => (
              <article
                key={entry.id}
                className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[170px,1fr]"
              >
                <div className="border-b pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {getTimelineLabel(entry)}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[color:var(--color-primary)]">
                    {formatShortDate(getPrimaryDate(entry).toISOString())}
                  </div>
                </div>

                <Link
                  href={entry.book ? `/book/${entry.book.id}` : '/search'}
                  className="flex items-start gap-4"
                >
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md border border-black/5 bg-gray-100">
                    <BookCover book={entry.book} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-primary)]">
                        {getShelfIcon(entry.shelf)}
                        {getShelfLabel(entry.shelf)}
                      </span>
                      {entry.rating ? (
                        <span className="text-xs text-muted-foreground">
                          Rated {entry.rating}/5
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold leading-tight">
                      {entry.book?.title ?? 'Unknown Title'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.book?.author ?? 'Unknown Author'}
                    </p>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      )}

      {activeView === 'calendar' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr),minmax(320px,0.9fr)]">
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Reading Calendar</h2>
                <p className="text-sm text-muted-foreground">
                  Dates light up when books were added, started, or finished.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (currentMonth) =>
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                    )
                  }
                  className="rounded-full border p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[150px] text-center text-sm font-semibold">
                  {formatMonthLabel(visibleMonth)}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (currentMonth) =>
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                    )
                  }
                  className="rounded-full border p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayKey = getDateKey(day);
                const dayEvents = eventMap[dayKey] ?? [];
                const isInMonth = day.getMonth() === visibleMonth.getMonth();

                return (
                  <div
                    key={dayKey}
                    className={`min-h-[110px] rounded-2xl border p-2 ${
                      isInMonth
                        ? 'bg-[color:var(--color-bg)]/30'
                        : 'bg-gray-50/60 text-muted-foreground'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{day.getDate()}</span>
                      {dayEvents.length > 0 ? (
                        <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          {dayEvents.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className="truncate rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-foreground shadow-sm"
                          title={entry.book?.title ?? 'Unknown Title'}
                        >
                          {entry.book?.title ?? 'Unknown Title'}
                        </div>
                      ))}
                      {dayEvents.length > 2 ? (
                        <div className="text-[11px] font-medium text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Month Activity</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              A compact log of reading moments for {formatMonthLabel(visibleMonth)}.
            </p>

            {monthEvents.length === 0 ? (
              <EmptyState message="No shelf activity recorded for this month yet." />
            ) : (
              <div className="space-y-3">
                {monthEvents.map((entry) => (
                  <Link
                    href={entry.book ? `/book/${entry.book.id}` : '/search'}
                    key={entry.id}
                    className="flex items-start gap-3 rounded-xl border bg-[color:var(--color-bg)]/25 p-3 transition-colors hover:bg-[color:var(--color-bg)]/45"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-black/5 bg-gray-100">
                      <BookCover book={entry.book} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold">
                          {entry.book?.title ?? 'Unknown Title'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatShortDate(getPrimaryDate(entry).toISOString())}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.book?.author ?? 'Unknown Author'}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)]/10 px-2 py-1 text-[11px] font-semibold text-[color:var(--color-primary)]">
                        {getShelfIcon(entry.shelf)}
                        {getTimelineLabel(entry)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {(loading || isFetchingMore) && (
        <div className="flex w-full justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[color:var(--color-primary)]" />
        </div>
      )}

      {hasMore && <div ref={loaderRef} className="h-8 w-full opacity-0" />}
    </div>
  );
}
