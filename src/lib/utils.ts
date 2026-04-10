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
  // 1. Determine the base URL
  let url: string;

  if (typeof window !== 'undefined') {
    // In the browser, always favor the current origin (localhost stays localhost)
    url = window.location.origin;
  } else {
    // On the server (SSR), use env vars
    url =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      'http://localhost:3000';
  }

  // 2. Clean and Normalize
  url = url.includes('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url.slice(0, -1) : url;

  // 3. Append Path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return path ? `${url}${normalizedPath}` : url;
}
