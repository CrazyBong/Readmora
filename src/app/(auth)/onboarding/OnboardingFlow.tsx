'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import { checkUsername, submitOnboarding } from '@/app/actions/onboarding.actions';
import { importGoodreads } from '@/app/actions/shelf.actions';
import { VibeId } from '@/types/database';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { OnboardingForm } from '@/components/ui/onboarding-form';

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
  'Women’s Fiction',
  'Contemporary Fiction',
  'Literary Fiction',
  'Magical Realism',
  'Graphic Novel',
  'Short Story',
  'Young Adult',
  'New Adult',
  'Children’s',
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

export default function OnboardingFlow({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
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

  // Upload a real image file to Supabase Storage
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
    } catch (err: unknown) {
      console.error('Avatar upload failed:', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const setAppVibe = (newVibe: VibeId) => {
    setVibe(newVibe);
    document.documentElement.setAttribute('data-vibe', newVibe);
  };

  const handleFileChange = (file: File | null) => {
    setGoodreadsFile(file);
    setImportCount(0);
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (results: { data: any[] }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validBooksCount = results.data.filter((row: any) => row.Title && row.Author).length;
        setImportCount(Math.min(validBooksCount, 50));
      },
    });
  };

  const processGoodreadsFile = async (): Promise<boolean> => {
    if (!goodreadsFile) return true; // Skip

    return new Promise((resolve) => {
      Papa.parse(goodreadsFile, {
        header: true,
        skipEmptyLines: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        complete: async (results: any) => {
          try {
            // Map rows and filter valid ones (must have title) BEFORE slicing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const validBooks = results.data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((row: any) => {
                const exclusiveShelf = row['Exclusive Shelf'] || 'read';
                const myRating = parseInt(row['My Rating'], 10);

                let shelf: 'want_to_read' | 'currently_reading' | 'finished' | 'dnf' = 'finished';
                if (exclusiveShelf === 'to-read') shelf = 'want_to_read';
                else if (exclusiveShelf === 'currently-reading') shelf = 'currently_reading';
                else if (exclusiveShelf === 'did-not-finish' || exclusiveShelf === 'dnf')
                  shelf = 'dnf';

                let isbn = row['ISBN13'] || row['ISBN'];
                if (isbn) isbn = isbn.replace(/[^0-9X]/gi, '');

                let finished_at: string | undefined;
                if (row['Date Read']) {
                  const d = new Date(row['Date Read']);
                  if (!isNaN(d.getTime())) finished_at = d.toISOString().split('T')[0];
                }

                return {
                  title: row['Title'],
                  author: row['Author'],
                  isbn: isbn || undefined,
                  shelf,
                  rating: myRating > 0 && myRating <= 5 ? myRating : undefined,
                  finished_at,
                };
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((b: any) => b.title && b.author);

            const booksToImport = validBooks.slice(0, 50);

            if (booksToImport.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await importGoodreads(booksToImport as any);
            }
            resolve(true);
          } catch (err) {
            console.error(err);
            resolve(false);
          }
        },
        error: () => resolve(false),
      });
    });
  };

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      // Username availability is gated inside <OnboardingForm> itself — step proceeds only on valid submit
      return;
    }
    if (step === 2 && genres.length < 5) {
      setError('Please select at least 5 genres.');
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }

    if (step === 4) {
      setLoading(true);

      try {
        const res = await submitOnboarding({
          username,
          genre_preferences: genres,
          vibe_preference: vibe,
          avatar_url: avatarUrl || undefined,
        });

        if (!res.success) {
          setError(res.error || 'Failed to set up profile.');
          setLoading(false);
          return;
        }

        const importSuccess = await processGoodreadsFile();
        if (!importSuccess) {
          console.warn('Goodreads import partially failed or was skipped.');
        }

        // Send user to the new dynamic home dashboard where they can see books
        router.push('/home');
      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred.');
        setLoading(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="login-card mx-auto">
      <div className="login-header text-left">
        <h1 className="login-title">Step {step} of 4</h1>
        {step === 1 && <p className="login-subtitle">Let&apos;s set up your profile</p>}
        {step === 2 && <p className="login-subtitle">What do you like to read?</p>}
        {step === 3 && <p className="login-subtitle">Choose your aesthetic</p>}
        {step === 4 && <p className="login-subtitle">Import your Goodreads</p>}
      </div>

      {error && <div className="login-alert login-alert--error">{error}</div>}

      {/* STEP 1 – use the OnboardingForm card component */}
      {step === 1 && (
        <OnboardingForm
          imageSrc="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop"
          {...(avatarUrl ? { avatarSrc: avatarUrl } : {})}
          avatarFallback={username?.[0]?.toUpperCase() || '?'}
          title="Welcome to Readmora"
          description="Pick a username and upload your avatar to get started."
          inputPlaceholder="bookish_scholar"
          buttonText="Continue →"
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

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <p className="text-sm opacity-80 mb-4">
            Select at least 5 to help us personalize your space.
          </p>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  genres.includes(g)
                    ? 'bg-[color:var(--color-primary)] text-white border-transparent shadow shadow-md'
                    : 'bg-white/50 border-gray-300 text-gray-700 hover:border-[color:var(--color-primary)]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-80 mb-2">
            Toggle between styles to instantly see what fits your reading life.
          </p>
          {VIBES.map((v) => (
            <label
              key={v.id}
              className={`p-4 border rounded-xl flex items-center cursor-pointer transition-all ${vibe === v.id ? 'border-[color:var(--color-primary)] ring-1 ring-[color:var(--color-primary)] bg-white/20' : 'border-gray-200'}`}
            >
              <input
                type="radio"
                name="vibe"
                value={v.id}
                checked={vibe === v.id}
                onChange={() => setAppVibe(v.id)}
                className="mr-3"
              />
              <span className="font-medium text-[color:var(--foreground)]">{v.name}</span>
            </label>
          ))}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-80">
            Skip building your library from scratch. Export your Goodreads library as a CSV and drop
            it here. We&apos;ll import your most recent 50 books for the beta.
            {importCount > 0 && (
              <span className="block mt-1 text-green-600 font-semibold">
                Ready to import {importCount} books!
              </span>
            )}
          </p>
          <div className="border-2 border-dashed border-[color:var(--color-primary)] rounded-xl p-8 text-center bg-white/40">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <span className="text-[color:var(--color-primary)] font-semibold mb-2">
                {goodreadsFile ? goodreadsFile.name : 'Select a .csv file'}
              </span>
              <span className="text-xs opacity-70">Optional — you can skip this</span>
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            className="login-btn bg-black/5 text-[#333] hover:bg-black/10 flex-1"
            onClick={() => setStep((s) => s - 1)}
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
                ? 'Import & Finish'
                : 'Skip & Finish'
              : 'Next'}
        </button>
      </div>
    </div>
  );
}
