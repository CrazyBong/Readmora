import { useState, useEffect } from 'react';

/**
 * useScrollDirection
 * Tracks scroll direction and amount, supporting both window and element-level scrolling.
 * @param selector Optional CSS selector for a scrollable container (e.g., 'main')
 */
export function useScrollDirection(selector?: string) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrolledAmount, setScrolledAmount] = useState(0);

  useEffect(() => {
    // Attempt to find the target element if selector provided, fallback to window
    const target = selector ? document.querySelector(selector) : window;
    if (!target) return;

    const getScrollY = () => {
      if (selector && target instanceof HTMLElement) {
        return target.scrollTop;
      }
      return window.pageYOffset;
    };

    let lastScrollY = getScrollY();

    const updateScrollDirection = () => {
      const scrollY = getScrollY();
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      // Use a small threshold (10px) to prevent flickering on micro-scrolls
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      setScrolledAmount(scrollY);
    };

    target.addEventListener('scroll', updateScrollDirection);
    return () => target.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection, selector]);

  return { scrollDirection, scrolledAmount };
}
