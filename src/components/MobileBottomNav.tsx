/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
}

interface MobileBottomNavProps {
  navLinks: NavLink[];
  avatarUrl: string | null;
  username: string;
}

import React from 'react';

const ICON_MAP: Record<string, React.ElementType> = {
  '/home': Home,
  '/explore': Compass,
  '/shelf': Library,
};

export default function MobileBottomNav({ navLinks, avatarUrl, username }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-full border bg-white/80 backdrop-blur-xl shadow-2xl border-black/5 p-1 w-[280px]">
      <div className="flex items-center justify-around">
        {navLinks.map(({ href }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const Icon = ICON_MAP[href];

          if (!Icon) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center p-1 rounded-full transition-all"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden',
                    isActive
                      ? 'border-[color:var(--color-primary)] scale-110 shadow-sm'
                      : 'border-transparent'
                  )}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Settings" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-[color:var(--color-primary)] text-white font-bold text-[10px] w-full h-full flex items-center justify-center">
                      {username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center p-1 transition-all"
            >
              <div
                className={cn(
                  'p-2 rounded-full transition-all duration-300',
                  isActive
                    ? 'bg-[color:var(--color-primary)] text-white shadow-lg shadow-[color:var(--color-primary)]/20 scale-110'
                    : 'text-foreground/40'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
