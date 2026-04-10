/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, Plus, Quote, Sparkles, Star } from 'lucide-react';

import { addBookToShelf, type BookInsert } from '@/app/actions/shelf.actions';
import MarkdownContent from '@/components/MarkdownContent';
import SocialCardModal from '@/components/SocialCardModal';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Book } from '@/types/database';

interface BookPageData {
  book: any;
  shelfEntry: any;
  summary: any;
  isDiscovery: boolean;
}

function buildDiscoveryBookPayload(book: BookPageData['book']): BookInsert {
  return {
    title: book.title,
    author: book.author,
    isbn: null,
    cover_url: book.cover_url,
    description: book.description,
    published_year: book.published_year,
    genres: book.genres,
    openlibrary_id: book.id,
    cover_source: 'open_library',
    cover_id: null,
  };
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<BookPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSocialCard, setShowSocialCard] = useState(false);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const localBookResult = await supabase
          .from('books')
          .select('*')
          .eq('id', params.id)
          .maybeSingle();
        const localBook = localBookResult.data as Book | null;

        if (localBook) {
          const [{ data: shelfEntry }, { data: summary }] = await Promise.all([
            supabase
              .from('shelf_entries')
              .select('*')
              .eq('user_id', user?.id ?? '')
              .eq('book_id', localBook.id)
              .maybeSingle(),
            supabase.from('ai_summaries').select('*').eq('book_id', localBook.id).maybeSingle(),
          ]);

          setData({ book: localBook, shelfEntry, summary, isDiscovery: false });
          return;
        }

        if (!params.id.startsWith('OL')) {
          setData(null);
          return;
        }

        const [bookRes, ratingsRes] = await Promise.all([
          fetch(`https://openlibrary.org/works/${params.id}.json`),
          fetch(`https://openlibrary.org/works/${params.id}/ratings.json`),
        ]);

        if (!bookRes.ok) {
          throw new Error('Failed to fetch from OpenLibrary');
        }

        const olData = await bookRes.json();
        const ratingsData = ratingsRes.ok ? await ratingsRes.json() : null;

        let authorName = 'Unknown Author';
        if (olData.authors?.[0]?.author?.key) {
          const authRes = await fetch(
            `https://openlibrary.org${olData.authors[0].author.key}.json`
          );

          if (authRes.ok) {
            const authData = await authRes.json();
            authorName = authData.name || authData.personal_name || 'Unknown Author';
          }
        }

        const discoveryBook = {
          id: params.id,
          title: olData.title,
          author: authorName,
          description:
            typeof olData.description === 'string'
              ? olData.description
              : olData.description?.value || '',
          cover_url: olData.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${olData.covers[0]}-L.jpg`
            : null,
          published_year: olData.first_publish_date
            ? parseInt(olData.first_publish_date, 10)
            : null,
          genres: olData.subjects?.slice(0, 3) || ['Literature'],
          rating: ratingsData?.summary?.average || 0,
        };

        setData({ book: discoveryBook, shelfEntry: null, summary: null, isDiscovery: true });
      } catch (error) {
        console.error('Hybrid Load Error:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [params.id, supabase]);

  const fetchPersistedBook = async (bookId: string): Promise<Book | null> => {
    const { data: savedBook, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return savedBook as Book | null;
  };

  const persistDiscoveryBook = async () => {
    if (!data?.book) {
      throw new Error('Book not found');
    }

    const addResult = await addBookToShelf(buildDiscoveryBookPayload(data.book), {
      shelf: 'want_to_read',
    });

    if (!addResult.success || !('entry' in addResult) || !addResult.entry) {
      throw new Error(addResult.error || 'Please login to save books');
    }

    const savedBook = await fetchPersistedBook(addResult.entry.book_id);

    setData((previous) =>
      previous
        ? {
            ...previous,
            book: savedBook ?? previous.book,
            isDiscovery: false,
            shelfEntry: addResult.entry,
          }
        : null
    );

    return addResult.entry.book_id;
  };

  const handleGenerateAI = async () => {
    if (!data?.book || generating) return;
    setGenerating(true);

    let currentBookId = data.book.id;

    try {
      if (data.isDiscovery) {
        currentBookId = await persistDiscoveryBook();
      }

      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: currentBookId }),
      });

      let json;
      try {
        const textBody = await res.text();
        json = textBody ? JSON.parse(textBody) : {};
      } catch {
        json = {};
      }

      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || 'Failed to generate analysis');
      }

      setData((previous) =>
        previous
          ? {
              ...previous,
              summary: {
                summary_markdown: json.data.summary_markdown,
                model_version: json.data.model_version,
              },
            }
          : null
      );
    } catch (error: any) {
      alert(error.message || 'AI Analysis failed to launch');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!data?.book || !data.isDiscovery) return;
    setSaving(true);

    try {
      await persistDiscoveryBook();
    } catch (error: any) {
      alert(error.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[color:var(--color-primary)]" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Retreiving Dossier...
        </p>
      </div>
    );
  }

  if (!data?.book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <BookOpen className="w-10 h-10 text-gray-200" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3 uppercase">Archival Error</h1>
        <p className="text-muted-foreground mb-10 max-w-sm font-medium">
          This volume could not be located in our libraries or the global cloud. It may be
          restricted or out of print.
        </p>
        <Link
          href="/home"
          className="bg-[color:var(--color-primary)] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-[color:var(--color-primary)]/20 active:scale-95 transition-all"
        >
          Return to Hub
        </Link>
      </div>
    );
  }

  const { book, shelfEntry, summary, isDiscovery } = data;

  const extractQuote = (markdown: string) => {
    if (!markdown) return '';

    const quoteMatch =
      markdown.match(/5\.\s*(?:One memorable quote:?\s*)?["'](.+?)["']/i) ||
      markdown.match(/(?:Quote|Memorable Quote):?\s*["'](.+?)["']/i);

    return quoteMatch ? quoteMatch[1] || '' : '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 pb-40">
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-[color:var(--color-primary)] mb-8 md:mb-12 transition-all active:translate-x-[-4px]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 w-full">
          <div className="w-full max-w-[320px] lg:max-w-none mx-auto aspect-[2/3] bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-black/5 relative p-1.5 transition-all">
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-gray-50 flex items-center justify-center">
              {book.cover_url ? (
                <img src={book.cover_url} className="w-full h-full object-cover" alt="Cover Art" />
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                  <p className="font-display italic text-gray-400 text-sm">
                    Cover Artwork Unavailable
                  </p>
                </div>
              )}
            </div>
            {book.rating > 0 && (
              <div className="absolute top-8 right-8 bg-white/95 backdrop-blur shadow-xl rounded-2xl flex items-center gap-2 px-3 py-2 border border-black/5 animate-in slide-in-from-right-4 duration-700">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-black text-xs">{book.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-[400px] lg:max-w-none mx-auto">
            {isDiscovery ? (
              <button
                onClick={handleSaveToLibrary}
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 bg-[color:var(--color-primary)] hover:brightness-110 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-[color:var(--color-primary)]/20 active:scale-95 disabled:opacity-50 text-base"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Add to Library
              </button>
            ) : (
              <div className="bg-green-500/10 border-2 border-green-500/20 text-green-700 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                <Star className="w-4 h-4 fill-green-700" /> Library Preserved
              </div>
            )}

            <button
              onClick={handleGenerateAI}
              disabled={generating}
              className={cn(
                'w-full flex items-center justify-center gap-3 font-black py-5 rounded-[1.5rem] transition-all shadow-xl active:scale-95 group text-base',
                generating ? 'bg-yellow-500 text-black animate-pulse' : 'bg-[#121212] text-white',
                generating && 'opacity-80'
              )}
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles
                  className={cn(
                    'w-5 h-5 text-yellow-400',
                    !generating && 'group-hover:animate-bounce'
                  )}
                />
              )}
              {generating ? 'Transcribing Insights...' : 'AI Full Analysis'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              {(book.genres || ['Literature']).slice(0, 3).map((genre: string) => (
                <span
                  key={genre}
                  className="px-5 py-2 bg-white border border-black/5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-[color:var(--color-primary)]/30 transition-colors cursor-default"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.05]">
                {book.title}
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground italic font-display opacity-80 underline underline-offset-[12px] decoration-black/5 decoration-4">
                {book.author}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 md:px-0">
            <div className="bg-white/40 border border-black/5 text-center px-4 py-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[110px]">
              <p className="text-[10px] uppercase font-black text-foreground tracking-widest mb-2">
                Status
              </p>
              <p className="font-bold text-sm uppercase tracking-tight text-muted-foreground opacity-60 truncate">
                {shelfEntry?.shelf?.replace(/_/g, ' ') || 'Unlisted'}
              </p>
            </div>
            <div className="bg-white/40 border border-black/5 text-center px-4 py-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[110px]">
              <p className="text-[10px] uppercase font-black text-foreground tracking-widest mb-2">
                Rating
              </p>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Star
                    key={index}
                    className={`w-3.5 h-3.5 ${
                      book.rating > 0 && index <= Math.round(book.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-100 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest opacity-60">
                ({book.rating > 0 ? book.rating.toFixed(1) : 'No Rating'})
              </p>
            </div>
            <div className="bg-white/40 border border-black/5 text-center px-4 py-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[110px]">
              <p className="text-[10px] uppercase font-black text-foreground tracking-widest mb-2">
                Pub Region
              </p>
              <p className="font-bold text-sm uppercase tracking-tight text-muted-foreground opacity-60">
                Worldwide
              </p>
            </div>
            <div className="bg-white/40 border border-black/5 text-center px-4 py-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[110px]">
              <p className="text-[10px] uppercase font-black text-foreground tracking-widest mb-2">
                Archived
              </p>
              <p className="font-bold text-sm text-muted-foreground opacity-60">
                {book.published_year || 'Historical'}
              </p>
            </div>
          </div>

          <section className="bg-white border-2 border-black/5 rounded-[3.5rem] p-8 md:p-14 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.02] group-hover:opacity-10 transition-opacity">
              <Quote className="w-56 h-56 rotate-12" />
            </div>
            <h3 className="flex items-center gap-4 font-display text-3xl md:text-4xl font-black mb-8 tracking-tight">
              Profile Archive <Sparkles className="w-7 h-7 text-yellow-500 opacity-30" />
            </h3>
            <div className="space-y-6 max-w-4xl relative z-10">
              <MarkdownContent
                className="text-foreground/75 text-lg md:text-xl font-medium prose prose-stone max-w-none selection:bg-yellow-100 selection:text-black"
                content={
                  summary?.summary_markdown ||
                  book.description ||
                  'No narrative description available for this entry.'
                }
              />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              onClick={async () => {
                if (!summary) {
                  await handleGenerateAI();
                }
                setShowSocialCard(true);
              }}
              className="border border-black/10 flex flex-col items-center justify-center p-12 rounded-[2.8rem] bg-white text-center group cursor-pointer hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all hover:translate-y-[-6px]"
            >
              <Quote className="w-10 h-10 mb-6 text-gray-200 group-hover:text-[color:var(--color-primary)] transition-colors" />
              <h3 className="font-display font-black text-2xl mb-2 tracking-tight">
                Social Card Gen
              </h3>
              <p className="text-xs font-bold text-muted-foreground px-6 opacity-60 leading-relaxed uppercase tracking-widest">
                Aesthetic Snippets for Instagram
              </p>
            </div>
            <div
              onClick={handleGenerateAI}
              className={cn(
                'border border-black/10 flex flex-col items-center justify-center p-12 rounded-[2.8rem] text-center transition-all group cursor-pointer',
                generating
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 hover:bg-[color:var(--color-primary)]/5 hover:border-[color:var(--color-primary)]/20 hover:translate-y-[-6px]'
              )}
            >
              {generating ? (
                <Loader2 className="w-10 h-10 mb-6 text-yellow-600 animate-spin" />
              ) : (
                <Sparkles className="w-10 h-10 mb-6 text-gray-200 group-hover:text-[color:var(--color-primary)] transition-colors" />
              )}
              <h3 className="font-display font-black text-2xl mb-2 tracking-tight">
                Cerebral Context
              </h3>
              <p className="text-xs font-bold text-muted-foreground px-6 leading-relaxed uppercase tracking-widest opacity-60">
                {generating ? 'AI Deep Dive in progress' : 'Unlock Literary Analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSocialCard && (
        <SocialCardModal
          bookTitle={book.title || ''}
          bookAuthor={book.author || ''}
          quote={extractQuote(summary?.summary_markdown || '')}
          onClose={() => setShowSocialCard(false)}
        />
      )}
    </div>
  );
}
