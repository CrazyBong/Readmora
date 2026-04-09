import { Metadata } from 'next';
import LandingPageClient from '@/components/LandingPageClient';

export const metadata: Metadata = {
  title: 'Readmora | The Modern Indie Bookshop & Reading Companion',
  description:
    'Readmora is a beautifully designed reading companion that brings warm intelligence to the books you love through personalized themes and profound AI insights.',
  openGraph: {
    title: 'Readmora | The Modern Indie Bookshop',
    description: 'Elevate your reading life with personalized themes and AI-powered book insights.',
    images: [
      'https://res.cloudinary.com/djozgxq9k/image/upload/v1775738087/erasebg-transformed_1_ugfelo.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readmora | The Modern Indie Bookshop',
    description: 'Elevate your reading life with personalized themes and AI-powered book insights.',
    images: [
      'https://res.cloudinary.com/djozgxq9k/image/upload/v1775738087/erasebg-transformed_1_ugfelo.png',
    ],
  },
};

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/home');
  }

  return <LandingPageClient />;
}
