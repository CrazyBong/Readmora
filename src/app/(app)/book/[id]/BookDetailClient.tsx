'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book, ShelfEntry } from '@/types/database';
import { SHELF_LABELS } from '@/types/api';
import AISummaryModal from '@/components/AISummaryModal';
import PaywallModal from '@/components/PaywallModal';
import { Sparkles, ArrowLeft, Star } from 'lucide-react';

interface BookDetailClientProps {
  book: Book;
  shelfEntry: Pick<ShelfEntry, 'shelf' | 'rating'> | null;
  cachedSummary: { summary_markdown: string; generated_at: string } | null;
  isPremium: boolean;
}

export default function BookDetailClient({
  book,
  shelfEntry,
  cachedSummary,
  isPremium,
}: BookDetailClientProps) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [paywallDetails, setPaywallDetails] = useState<{ resets_at: string } | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 mb-6 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </Link>

      {/* Book Header */}
      <div className="flex gap-6 mb-8">
        <div className="w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-[color:var(--color-primary)]">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              width={112}
              height={168}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <p className="text-white font-bold text-center text-xs leading-tight">{book.title}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-extrabold text-[color:var(--foreground)] leading-tight mb-1">
            {book.title}
          </h1>
          <p className="text-base opacity-70 mb-3">{book.author}</p>
          {book.published_year && (
            <p className="text-sm opacity-50 mb-2">Published {book.published_year}</p>
          )}
          {shelfEntry && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-[color:var(--color-primary)] text-white px-3 py-1 rounded-full font-semibold">
                {SHELF_LABELS[shelfEntry.shelf]}
              </span>
              {shelfEntry.rating && (
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < (shelfEntry.rating ?? 0) ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-2">
            About This Book
          </h2>
          <p className="text-[color:var(--foreground)] opacity-80 leading-relaxed text-sm">
            {book.description}
          </p>
        </div>
      )}

      {/* AI Summary Section */}
      <div className="bg-white/40 backdrop-blur border border-white/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-4 h-4 text-[color:var(--color-primary)]" />
              <span className="text-sm font-bold text-[color:var(--foreground)]">
                AI Book Summary
              </span>
              {!isPremium && (
                <span className="text-xs bg-[color:var(--color-accent)] text-white px-2 py-0.5 rounded-full">
                  Free: 3/week
                </span>
              )}
            </div>
            <p className="text-xs opacity-50">Powered by Gemini AI</p>
          </div>
          <button
            onClick={() => setShowSummaryModal(true)}
            className="login-btn login-btn--primary !py-2 !px-4 text-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {cachedSummary ? 'View Summary' : 'Get Summary'}
          </button>
        </div>

        {cachedSummary && (
          <p className="text-xs opacity-40">
            Summary available · Generated{' '}
            {new Date(cachedSummary.generated_at).toLocaleDateString('en-IN')}
          </p>
        )}
      </div>

      {/* Modals */}
      {showSummaryModal && (
        <AISummaryModal
          bookId={book.id}
          bookTitle={book.title}
          bookAuthor={book.author}
          onClose={() => setShowSummaryModal(false)}
          onRateLimit={(details) => {
            setShowSummaryModal(false);
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
