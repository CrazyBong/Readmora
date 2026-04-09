'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AppMainFrame({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  const [scrollingDown, setScrollingDown] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      const currentScrollY = mainEl.scrollTop;

      // If we scroll down more than 10px, hide sidebar. If we scroll up, show it.
      if (currentScrollY > lastScrollY.current + 10) {
        setScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY <= 50) {
        setScrollingDown(false);
      }

      lastScrollY.current = currentScrollY;
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Sidebar - slides out to the left when scrolling down on the main area */}
      <div
        className={`hidden lg:block h-full transition-transform duration-500 ease-in-out shrink-0 w-64 ${scrollingDown ? '-translate-x-full absolute left-0 top-0 bottom-0 z-10' : 'translate-x-0 relative z-10'}`}
      >
        {aside}
      </div>

      {/* Main Content Area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto w-full relative z-20 bg-[color:var(--color-bg)] transition-all duration-300"
      >
        {children}
      </main>
    </div>
  );
}
