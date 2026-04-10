import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { cn } from '@/lib/utils';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-accent',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Readmora',
    default: 'Readmora',
  },
  description:
    'Your companion for beautiful book tracking, AI-powered reading summaries, and personalized aesthetic reading vibes.',
  keywords: [
    'books',
    'reading tracker',
    'book summaries',
    'goodreads alternative',
    'AI book analysis',
    'readmora',
  ],
  authors: [{ name: 'Readmora' }],
  metadataBase: new URL('https://readmora.space'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Readmora',
    description: 'Track your books, get AI summaries, and vibe with your reading habits.',
    url: 'https://readmora.space',
    siteName: 'Readmora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readmora',
    description: 'Track your books, get AI summaries, and vibe with your reading habits.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: [{ url: '/favicon.ico' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#e8ecf8',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let vibe = 'wildflower';

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('vibe_preference')
        .eq('id', user.id)
        .maybeSingle();

      const profileData = data as { vibe_preference: string } | null;
      if (profileData?.vibe_preference) {
        vibe = profileData.vibe_preference;
      }
    }
  } catch {
    // Fail silently on server layout, fallback to default vibe
  }

  return (
    <html
      lang="en"
      data-vibe={vibe}
      className={cn(
        playfair.variable,
        dmSans.variable,
        instrumentSerif.variable,
        jetbrainsMono.variable,
        'font-sans'
      )}
    >
      <body className="font-body antialiased min-h-screen flex flex-col items-stretch">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
