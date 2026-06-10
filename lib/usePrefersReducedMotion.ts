'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when the user has requested reduced motion via the OS/browser
 * `prefers-reduced-motion: reduce` media query.
 *
 * Safe for SSR: returns false during server rendering (no window) and updates
 * once after hydration. This means hand-rolled animation loops receive the
 * correct value after mount — the render impact is one extra client render at
 * most, which is acceptable for an accessibility feature.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
