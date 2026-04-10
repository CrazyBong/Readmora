'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ShelfEntryWithBook, ShelfType } from '@/types/database';
import { SHELF_LABELS } from '@/types/api';
import { Star, Trash2, Sparkles } from 'lucide-react';
import { removeBookFromShelf } from '@/app/actions/shelf.actions';
import AISummaryModal from '@/components/AISummaryModal';
import PaywallModal from '@/components/PaywallModal';

export default function LibraryView({ initialEntries }: { initialEntries: ShelfEntryWithBook[] }) {
  const [activeTab, setActiveTab] = useState<ShelfType>('currently_reading');
  const [summaryBook, setSummaryBook] = useState<ShelfEntryWithBook | null>(null);
  const [paywallDetails, setPaywallDetails] = useState<{ resets_at: string } | null>(null);

  const entries = initialEntries.filter((e) => e.shelf === activeTab);
  const count = entries.length;

  const handleRemove = async (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Remove this book from your shelves?')) {
      const res = await removeBookFromShelf(bookId);
      if (!res.success) alert(res.error || 'Failed to remove book.');
    }
  };

  const handleSummary = (entry: ShelfEntryWithBook, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSummaryBook(entry);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-black/10 gap-6 mb-6">
        {(Object.keys(SHELF_LABELS) as ShelfType[]).map((shelf) => (
          <button
            key={shelf}
            onClick={() => setActiveTab(shelf)}
            className={`whitespace-nowrap pb-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
              activeTab === shelf
                ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)]'
                : 'border-transparent text-[color:var(--foreground)] opacity-60 hover:opacity-100'
            }`}
          >
            {SHELF_LABELS[shelf]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {entries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[color:var(--foreground)] opacity-50 border-2 border-dashed border-black/10 rounded-2xl bg-white/20">
            <p>Nothing on this shelf yet.</p>
          </div>
        ) : (
          <div className="col-span-full mb-4 px-1">
            <p className="text-sm font-medium opacity-60">
              {count} {count === 1 ? 'book' : 'books'} on this shelf
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/book/${entry.book.id}`}
            className="group relative flex flex-col items-start text-left bg-white/60 backdrop-blur rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow border border-white"
          >
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-3 relative shadow-inner">
              {entry.book.cover_url ? (
                <Image
                  src={entry.book.cover_url}
                  alt={`Cover of ${entry.book.title}`}
                  width={150}
                  height={225}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 150px"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[color:var(--color-primary)] p-2">
                  <p className="text-white font-serif text-center font-bold text-sm leading-tight line-clamp-4">
                    {entry.book.title}
                  </p>
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-x-0 top-0 pt-2 px-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleSummary(entry, e)}
                  className="bg-[color:var(--color-primary)] text-white p-1.5 rounded-full shadow hover:opacity-80 transition-opacity"
                  title="AI Summary"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleRemove(entry.book.id, e)}
                  className="bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3
              className="font-bold text-sm text-[color:var(--foreground)] line-clamp-1 w-full"
              title={entry.book.title}
            >
              {entry.book.title}
            </h3>
            <p className="text-xs text-[color:var(--foreground)] opacity-70 truncate w-full mt-0.5">
              {entry.book.author}
            </p>

            {entry.shelf === 'finished' && entry.rating && (
              <div className="flex items-center mt-2 text-[#facc15]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < (entry.rating || 0) ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Modals */}
      {summaryBook && (
        <AISummaryModal
          bookId={summaryBook.book.id}
          bookTitle={summaryBook.book.title}
          bookAuthor={summaryBook.book.author}
          onClose={() => setSummaryBook(null)}
          onRateLimit={(details) => {
            setSummaryBook(null);
            setPaywallDetails(details);
          }}
        />
      )}
      {paywallDetails && (
        <PaywallModal resetsAt={paywallDetails.resets_at} onClose={() => setPaywallDetails(null)} />
      )}
    </div>
  );
}
