import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standardized URL generator for production, preview, and local environments.
 * Prevents "localhost:3000" leaks in production and handles trailing slashes strictly.
 */
export function getURL(path: string = '') {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview/prod
    'http://localhost:3000';

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Remove trailing slashes
  url = url.endsWith('/') ? url.slice(0, -1) : url;

  // Add leading slash to path if missing
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return path ? `${url}${normalizedPath}` : url;
}
