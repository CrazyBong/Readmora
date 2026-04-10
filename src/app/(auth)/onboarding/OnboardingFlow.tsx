'use client';

import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import { checkUsername, submitOnboarding } from '@/app/actions/onboarding.actions';
import { importGoodreads } from '@/app/actions/shelf.actions';
import type { VibeId } from '@/types/database';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { OnboardingForm } from '@/components/ui/onboarding-form';

const ONBOARDING_STORAGE_KEY = 'readmora:onboarding:draft';

const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Dystopian',
  'Action & Adventure',
  'Mystery',
  'Horror',
  'Thriller & Suspense',
  'Historical Fiction',
  'Romance',
  "Women's Fiction",
  'Contemporary Fiction',
  'Literary Fiction',
  'Magical Realism',
  'Graphic Novel',
  'Short Story',
  'Young Adult',
  'New Adult',
  "Children's",
  'Memoir & Autobiography',
  'Biography',
  'Food & Drink',
  'Art & Photography',
  'Self-help',
  'History',
  'Travel',
  'True Crime',
  'Humor',
  'Essays',
  'Guide / How-to',
  'Religion & Spirituality',
  'Humanities & Social Sciences',
  'Parenting & Families',
  'Science & Technology',
];

const VIBES: { id: VibeId; name: string }[] = [
  { id: 'wildflower', name: 'Wildflower (Light, soothing)' },
  { id: 'winter_frost', name: 'Winter Frost (Cool, dawn)' },
  { id: 'sakura', name: 'Sakura (Warm, floral)' },
  { id: 'botanical', name: 'Botanical (Earthy, green, focus)' },
  { id: 'harvest', name: 'Harvest (Warm, autumnal)' },
];

type GoodreadsCsvRow = {
  Author?: string;
  'Date Read'?: string;
  'Exclusive Shelf'?: string;
  ISBN?: string;
  ISBN13?: string;
  'My Rating'?: string;
  Title?: string;
};

type GoodreadsImportEntry = {
  author: string;
  finished_at?: string;
  isbn?: string;
  rating?: number;
  shelf: 'want_to_read' | 'currently_reading' | 'finished' | 'dnf';
  title: string;
};

type OnboardingDraft = {
  avatarUrl: string;
  genres: string[];
  step: number;
  username: string;
  vibe: VibeId;
};

export default function OnboardingFlow({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState(
    (userEmail.split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20)
  );
  const [avatarUrl, setAvatarUrl] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [vibe, setVibe] = useState<VibeId>('wildflower');
  const [goodreadsFile, setGoodreadsFile] = useState<File | null>(null);
  const [importCount, setImportCount] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!savedDraft) return;

      const parsedDraft = JSON.parse(savedDraft) as Partial<OnboardingDraft>;

      if (typeof parsedDraft.username === 'string') {
        setUsername(parsedDraft.username);
      }
      if (typeof parsedDraft.avatarUrl === 'string') {
        setAvatarUrl(parsedDraft.avatarUrl);
      }
      if (Array.isArray(parsedDraft.genres)) {
        setGenres(parsedDraft.genres);
      }
      if (parsedDraft.vibe && VIBES.some((entry) => entry.id === parsedDraft.vibe)) {
        setVibe(parsedDraft.vibe);
      }
      if (typeof parsedDraft.step === 'number' && parsedDraft.step >= 1 && parsedDraft.step <= 5) {
        setStep(parsedDraft.step);
      }
    } catch {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-vibe', vibe);
  }, [vibe]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const draft: OnboardingDraft = {
      avatarUrl,
      genres,
      step,
      username,
      vibe,
    };

    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
  }, [avatarUrl, genres, step, username, vibe]);

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (uploadError: unknown) {
      console.error(
        'Avatar upload failed:',
        uploadError instanceof Error ? uploadError.message : 'Unknown error'
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres((previousGenres) =>
      previousGenres.includes(genre)
        ? previousGenres.filter((currentGenre) => currentGenre !== genre)
        : [...previousGenres, genre]
    );
  };

  const setAppVibe = (nextVibe: VibeId) => {
    setVibe(nextVibe);
  };

  const handleFileChange = (file: File | null) => {
    setGoodreadsFile(file);
    setImportCount(0);

    if (!file) return;

    Papa.parse<GoodreadsCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const validBooksCount = data.filter((row) => row.Title && row.Author).length;
        setImportCount(Math.min(validBooksCount, 50));
      },
    });
  };

  const processGoodreadsFile = async (): Promise<boolean> => {
    if (!goodreadsFile) return true;

    return new Promise((resolve) => {
      Papa.parse<GoodreadsCsvRow>(goodreadsFile, {
        header: true,
        skipEmptyLines: true,
        complete: async ({ data }) => {
          try {
            const validBooks: GoodreadsImportEntry[] = data
              .map((row) => {
                const exclusiveShelf = row['Exclusive Shelf'] || 'read';
                const myRating = Number.parseInt(row['My Rating'] || '', 10);

                let shelf: GoodreadsImportEntry['shelf'] = 'finished';
                if (exclusiveShelf === 'to-read') shelf = 'want_to_read';
                else if (exclusiveShelf === 'currently-reading') shelf = 'currently_reading';
                else if (exclusiveShelf === 'did-not-finish' || exclusiveShelf === 'dnf') {
                  shelf = 'dnf';
                }

                let isbn = row.ISBN13 || row.ISBN;
                if (isbn) isbn = isbn.replace(/[^0-9X]/gi, '');

                let finishedAt: string | undefined;
                if (row['Date Read']) {
                  const dateValue = new Date(row['Date Read']);
                  if (!Number.isNaN(dateValue.getTime())) {
                    finishedAt = dateValue.toISOString().split('T')[0];
                  }
                }

                return {
                  author: row.Author || '',
                  shelf,
                  title: row.Title || '',
                  ...(finishedAt ? { finished_at: finishedAt } : {}),
                  ...(isbn ? { isbn } : {}),
                  ...(myRating > 0 && myRating <= 5 ? { rating: myRating } : {}),
                };
              })
              .filter((book) => book.title && book.author);

            const booksToImport = validBooks.slice(0, 50);

            if (booksToImport.length > 0) {
              await importGoodreads(booksToImport);
            }

            resolve(true);
          } catch (parseError) {
            console.error(parseError);
            resolve(false);
          }
        },
        error: () => resolve(false),
      });
    });
  };

  const completeOnboarding = async () => {
    setLoading(true);

    try {
      const result = await submitOnboarding({
        username,
        genre_preferences: genres,
        vibe_preference: vibe,
        avatar_url: avatarUrl || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Failed to set up profile.');
        setLoading(false);
        return;
      }

      const importSuccess = await processGoodreadsFile();
      if (!importSuccess) {
        console.warn('Goodreads import partially failed or was skipped.');
      }

      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      router.push('/home');
    } catch (submitError) {
      console.error(submitError);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setError(null);

    if (step === 2 && genres.length < 5) {
      setError('Please select at least 5 genres.');
      return;
    }

    if (step < 4) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    if (step === 4) {
      setStep(5);
      return;
    }

    if (step === 5) {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((currentStep) => Math.max(1, currentStep - 1));
  };

  return (
    <div className="login-card mx-auto">
      <div className="login-header text-left">
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[color:var(--color-primary)] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="login-title outline-none">
          Step {step} of 5
        </h1>
        {step === 1 && <p className="login-subtitle">Let&apos;s set up your profile</p>}
        {step === 2 && <p className="login-subtitle">What do you like to read?</p>}
        {step === 3 && <p className="login-subtitle">Choose your aesthetic</p>}
        {step === 4 && <p className="login-subtitle">Import your Goodreads</p>}
        {step === 5 && (
          <p className="login-subtitle">Review everything before entering your shelf</p>
        )}
      </div>

      {error && <div className="login-alert login-alert--error">{error}</div>}

      {step === 1 && (
        <OnboardingForm
          imageSrc="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop"
          {...(avatarUrl ? { avatarSrc: avatarUrl } : {})}
          avatarFallback={username?.[0]?.toUpperCase() || '?'}
          title="Welcome to Readmora"
          description="Pick a username and upload your avatar to get started."
          inputPlaceholder="bookish_scholar"
          buttonText="Continue ->"
          onCheckUsername={checkUsername}
          onAvatarFile={handleAvatarUpload}
          onSubmit={(name) => {
            setUsername(name);
            setStep(2);
          }}
          isUploading={avatarUploading}
          isSubmitting={loading}
        />
      )}

      {step === 2 && (
        <div>
          <p className="mb-4 text-sm opacity-80">
            Select at least 5 genres to help us personalize your space.
          </p>
          <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto p-1">
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  genres.includes(genre)
                    ? 'border-transparent bg-[color:var(--color-primary)] text-white shadow shadow-md'
                    : 'border-gray-300 bg-white/50 text-gray-700 hover:border-[color:var(--color-primary)]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <p className="mb-2 text-sm opacity-80">
            Toggle between styles to instantly see what fits your reading life.
          </p>
          {VIBES.map((entry) => (
            <label
              key={entry.id}
              className={`flex cursor-pointer items-center rounded-xl border p-4 transition-all ${
                vibe === entry.id
                  ? 'border-[color:var(--color-primary)] bg-white/20 ring-1 ring-[color:var(--color-primary)]'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="vibe"
                value={entry.id}
                checked={vibe === entry.id}
                onChange={() => setAppVibe(entry.id)}
                className="mr-3"
              />
              <span className="font-medium text-[color:var(--foreground)]">{entry.name}</span>
            </label>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-80">
            Skip building your library from scratch. Export your Goodreads library as a CSV and drop
            it here. We&apos;ll import your most recent 50 books for the beta.
            {importCount > 0 && (
              <span className="mt-1 block font-semibold text-green-600">
                Ready to import {importCount} books.
              </span>
            )}
          </p>
          <div className="rounded-xl border-2 border-dashed border-[color:var(--color-primary)] bg-white/40 p-8 text-center">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
            />
            <label htmlFor="csv-upload" className="flex cursor-pointer flex-col items-center">
              <span className="mb-2 font-semibold text-[color:var(--color-primary)]">
                {goodreadsFile ? goodreadsFile.name : 'Select a .csv file'}
              </span>
              <span className="text-xs opacity-70">Optional - you can skip this</span>
            </label>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[color:var(--color-primary)]/20 bg-white/60 p-5">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
              Your reading life is ready
            </h2>
            <p className="mt-2 text-sm opacity-80">
              We&apos;ll create your profile, apply your vibe, and take you straight to your
              personalized home feed.
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="rounded-xl bg-black/5 px-4 py-3">
              <span className="font-semibold">Username:</span> @{username}
            </div>
            <div className="rounded-xl bg-black/5 px-4 py-3">
              <span className="font-semibold">Genres selected:</span> {genres.length}
            </div>
            <div className="rounded-xl bg-black/5 px-4 py-3">
              <span className="font-semibold">Chosen vibe:</span>{' '}
              {VIBES.find((entry) => entry.id === vibe)?.name ?? vibe}
            </div>
            <div className="rounded-xl bg-black/5 px-4 py-3">
              <span className="font-semibold">Goodreads import:</span>{' '}
              {goodreadsFile ? `${importCount || 'Selected'} books ready` : 'Skipped for now'}
            </div>
          </div>
        </div>
      )}

      {step > 1 && step < 5 && (
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Your progress is saved on this device if you come back later.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            className="login-btn flex-1 bg-black/5 text-[#333] hover:bg-black/10"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="login-btn login-btn--primary flex-1"
          onClick={handleNext}
          disabled={loading}
        >
          {loading
            ? 'Setting up...'
            : step === 4
              ? goodreadsFile
                ? 'Review Import'
                : 'Skip To Finish'
              : step === 5
                ? goodreadsFile
                  ? 'Import & Enter Readmora'
                  : 'Enter Readmora'
                : 'Next'}
        </button>
      </div>
    </div>
  );
}
