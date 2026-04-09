'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Set transition properties for smooth page navigating
  const pageVariants = {
    initial: { opacity: 0, y: 16, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    // GSAP ScrollTrigger registration etc. can be configured here
    // if required universally globally.
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants as never}
        className="flex-1 flex flex-col h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
