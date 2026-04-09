'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key =
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (key && host && key !== 'phc_your-posthog-key') {
        posthog.init(key, {
          api_host: host,
          person_profiles: 'identified_only', // or 'always' if you want to track unknown users
          capture_pageview: false, // We'll handle this manually for Next.js App Router
          capture_pageleave: true,
        });
      }
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
