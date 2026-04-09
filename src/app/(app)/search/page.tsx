import SearchInterface from './SearchInterface';

export const metadata = { title: 'Discover — Readmora' };

export default function SearchPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[color:var(--color-primary)] tracking-tight">
          Discover Books
        </h1>
        <p className="text-[color:var(--foreground)] opacity-70 mt-1">
          Search the Open Library directly and add books to your shelves.
        </p>
      </div>

      <SearchInterface />
    </div>
  );
}
