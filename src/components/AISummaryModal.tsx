'use client';

import { useState } from 'react';

import MarkdownContent from '@/components/MarkdownContent';
import { isUnlimitedAiUsageLimit } from '@/lib/ai-usage';
import type { AiSummaryResponse } from '@/types/api';

interface AISummaryModalProps {
  bookTitle: string;
  bookAuthor: string;
  bookId: string;
  onClose: () => void;
  onRateLimit: (details: { resets_at: string }) => void;
}

export default function AISummaryModal({
  bookTitle,
  bookAuthor,
  bookId,
  onClose,
  onRateLimit,
}: AISummaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AiSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId }),
      });

      let json;
      try {
        const textBody = await res.text();
        json = textBody ? JSON.parse(textBody) : {};
      } catch {
        json = {};
      }

      if (res.status === 429) {
        const details = json?.error?.details;
        onRateLimit({ resets_at: details?.resets_at ?? '' });
        onClose();
        return;
      }

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to load summary. Please try again.');
        return;
      }

      setSummary(json.data);
      setFetched(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="bg-[color:var(--color-bg)] border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[color:var(--color-bg)] border-b border-black/10 px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg">AI</span>
              <span className="text-xs font-semibold text-[color:var(--color-primary)] uppercase tracking-wider">
                AI Summary
              </span>
            </div>
            <h2 className="font-bold text-[color:var(--foreground)] leading-tight">{bookTitle}</h2>
            <p className="text-xs opacity-60 mt-0.5">{bookAuthor}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[color:var(--foreground)] opacity-50 hover:opacity-100 text-xl leading-none mt-0.5 shrink-0"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="px-6 py-5">
          {!fetched && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-[color:var(--foreground)] opacity-70 text-sm mb-6">
                Get an AI-powered literary analysis of this book: themes, writing style, and who
                would love it.
              </p>
              <button onClick={fetchSummary} className="login-btn login-btn--primary">
                Generate Summary
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm opacity-60">Analysing with Gemini AI...</p>
            </div>
          )}

          {error && (
            <div className="py-6 text-center">
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button onClick={fetchSummary} className="login-btn login-btn--primary">
                Try Again
              </button>
            </div>
          )}

          {summary && (
            <div>
              <MarkdownContent
                className="prose prose-sm max-w-none text-[color:var(--foreground)] leading-relaxed"
                content={summary.summary_markdown}
              />
              {summary.usage && (
                <div className="mt-6 pt-4 border-t border-black/10 flex justify-between text-xs opacity-50">
                  <span>Powered by Gemini AI{summary.cached ? ' - Cached' : ''}</span>
                  <span>
                    {summary.usage.used}/
                    {isUnlimitedAiUsageLimit(summary.usage.limit) ? 'inf' : summary.usage.limit}{' '}
                    summaries this week
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
