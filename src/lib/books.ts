/**
 * Standardizes book identifiers across different sources.
 */
export function getBookOpenLibraryId(title: string, author: string, isbn?: string | null): string {
  if (isbn) {
    return `/works/isbn/${isbn}`;
  }
  // Fallback for books without ISBN: deterministic slug
  const slug = `${title}-${author}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `/works/local/${slug}`;
}

/**
 * Validates if a string is a valid Vibe ID.
 */
export const VALID_VIBES = [
  'winter_frost',
  'sakura',
  'botanical',
  'wildflower',
  'harvest',
] as const;
export type ValidVibe = (typeof VALID_VIBES)[number];

export function isValidVibe(vibe: string): vibe is ValidVibe {
  return VALID_VIBES.includes(vibe as ValidVibe);
}
