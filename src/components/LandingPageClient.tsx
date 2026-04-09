/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CircularTestimonials } from '@/components/ui/circular-testimonials';
import GradientBackground from '@/components/ui/paper-design-shader-background';
import Footer from '@/components/ui/footer';

export default function LandingPageClient() {
  return (
    <div className="min-h-screen text-foreground flex flex-col relative overflow-hidden">
      {/* Aesthetic Background Effect */}
      <GradientBackground />
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      {/* Top Navbar */}
      <header className="container-custom mx-auto py-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center">
          <img
            src="https://res.cloudinary.com/djozgxq9k/image/upload/v1775738087/erasebg-transformed_1_ugfelo.png"
            alt="Readmora"
            className="h-20 md:h-32 w-auto object-contain"
          />
        </Link>
        <nav className="flex gap-6 items-center">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Log In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Sign Up Free
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container-custom mx-auto flex flex-col items-center justify-center text-center z-10 space-y-8 px-4 pb-20">
        {/* Subtle Pill */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          The Modern Indie Bookshop
        </div>

        {/* Headline */}
        <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight max-w-4xl text-balance">
          Your reading life, <br />
          <span className="font-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] pr-4 drop-shadow-sm">
            with personality.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-in fade-in zoom-in-95 duration-1000 delay-500 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance mt-4 font-body leading-relaxed">
          Readmora isn&apos;t just a tracker. It&apos;s a beautifully designed companion that brings
          warm intelligence to the books you love through personalized themes and profound AI
          insights.
        </p>

        {/* CTAs */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700 flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl shadow-[0_8px_30px_rgba(var(--color-primary),0.3)] hover:shadow-[0_12px_40px_rgba(var(--color-primary),0.4)] hover:-translate-y-1 transition-all overflow-hidden"
          >
            <span className="relative z-10">Start curating for free</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </Link>
          <Link
            href="/home"
            className="px-8 py-4 bg-card text-card-foreground border border-border font-semibold rounded-2xl hover:bg-muted/50 hover:border-primary/40 transition-all text-center"
          >
            View the Demo
          </Link>
        </div>
      </main>

      {/* Bento Grid Concept for Books */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="container-custom mx-auto px-4 py-20 z-10 w-full max-w-7xl"
      >
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Discover beautifully curated worlds.
          </h2>
          <p className="text-muted-foreground font-body">
            Get insights into characters, timelines, and themes with a simple tap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
          {/* Large Main Feature */}
          <div className="md:col-span-2 md:row-span-2 bg-card border border-border rounded-3xl p-6 md:p-8 flex items-end relative overflow-hidden group shadow-sm hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Book Feature"
            />
            <div className="relative z-20 w-full">
              <div className="inline-flex px-3 py-1 rounded-full bg-[color:var(--color-primary)] text-white text-xs font-semibold uppercase mb-3">
                Staff Pick
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                The Secret History
              </h3>
              <p className="text-white/80 italic text-sm md:text-base">Donna Tartt</p>
            </div>
          </div>

          {/* Small Bento 1 */}
          <div className="md:col-span-1 md:row-span-1 bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all flex flex-col justify-end">
            <img
              src="https://res.cloudinary.com/djozgxq9k/image/upload/v1775740704/carolynnyoe-ezgif.com-gif-to-webp-converter_xzgnj3.webp"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              alt="AI Maps"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-0" />
            <div className="z-10 relative">
              <h4 className="font-display font-semibold text-lg leading-tight mb-2 text-white">
                AI Character Maps
              </h4>
              <p className="text-xs text-white/80">Trace complex relationships instantly.</p>
            </div>
          </div>

          {/* Small Bento 2 */}
          <div className="md:col-span-1 md:row-span-1 bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all">
            <img
              src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Fantasy"
            />
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/40 backdrop-blur-md p-4 rounded-2xl text-white border border-white/10 shadow-xl">
              <h4 className="font-display font-bold text-xl leading-tight mb-0.5 tracking-tight">
                Dune
              </h4>
              <p className="text-sm text-white/70 italic font-body">Frank Herbert</p>
            </div>
          </div>

          {/* Wide Bento */}
          <div className="md:col-span-2 md:row-span-1 bg-stone-900 rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-md flex items-end">
            <img
              src="https://res.cloudinary.com/djozgxq9k/image/upload/v1775740777/K7-ezgif.com-gif-to-webp-converter_remzc6.webp"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              alt="Reading Streaks"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="z-20 relative text-white max-w-[200px] md:max-w-md">
              <h4 className="font-display font-bold text-xl md:text-2xl mb-1 leading-tight">
                Reading Streaks
              </h4>
              <p className="text-sm text-indigo-50/90 leading-relaxed italic">
                Track your reading streaks. Every book you finish builds your aesthetic timeline.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full py-20 px-4 z-10 relative"
      >
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Loved by readers</h2>
        </div>
        <div className="flex justify-center max-w-7xl mx-auto">
          <CircularTestimonials
            testimonials={[
              {
                name: 'Sarah Jenkins',
                designation: 'Bookstagrammer',
                quote:
                  'Readmora transformed my chaotic reading log into a beautiful, visual library. The AI insights helped me understand character arcs I completely missed!',
                src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
              },
              {
                name: 'David Chen',
                designation: 'Sci-Fi Enthusiast',
                quote:
                  "Finally a Goodreads alternative that doesn't look like it was built in 2005. The vibes feature makes it feel like my own personal reading room.",
                src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
              },
              {
                name: 'Elena Rodriguez',
                designation: 'Casual Reader',
                quote:
                  "Importing my hundreds of old books took literally seconds. I love tracking what I'm currently reading on the beautiful Kanban board.",
                src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
              },
            ]}
            autoplay={true}
            colors={{
              name: 'var(--foreground)',
              designation: 'var(--color-primary)',
              testimony: 'var(--foreground)',
              arrowBackground: 'var(--color-muted)',
              arrowHoverBackground: 'var(--color-primary)',
            }}
          />
        </div>
      </motion.section>

      {/* Footer Section */}
      <div className="w-full bg-white/40 backdrop-blur-sm border-t border-white/60">
        <Footer
          brandName="Readmora"
          logoUrl="https://res.cloudinary.com/djozgxq9k/image/upload/v1775738087/erasebg-transformed_1_ugfelo.png"
          socialLinks={[
            {
              icon: 'twitter',
              href: 'https://twitter.com/readmora',
              label: 'Twitter',
            },
            {
              icon: 'instagram',
              href: 'https://instagram.com/readmora',
              label: 'Instagram',
            },
            {
              icon: 'linkedin',
              href: 'https://linkedin.com/company/readmora',
              label: 'LinkedIn',
            },
            {
              icon: 'facebook',
              href: 'https://facebook.com/readmora',
              label: 'Facebook',
            },
            {
              icon: 'github',
              href: 'https://github.com/readmora',
              label: 'GitHub',
            },
          ]}
          mainLinks={[
            { href: '/explore', label: 'Explore' },
            { href: '/login', label: 'Library' },
            { href: '/about', label: 'About Our AI' },
            { href: '/contact', label: 'Contact' },
          ]}
          legalLinks={[
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms of Service' },
          ]}
          copyright={{
            text: '© 2026 Readmora',
            license: 'All rights reserved',
          }}
        />
      </div>
    </div>
  );
}
