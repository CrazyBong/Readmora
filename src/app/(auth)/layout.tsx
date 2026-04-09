import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In — Readmora',
  description: 'Sign in to your Readmora account to track your reading life.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
