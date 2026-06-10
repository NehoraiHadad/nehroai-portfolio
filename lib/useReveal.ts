'use client';

import { useRef, useEffect } from 'react';

/**
 * Attaches a native IntersectionObserver to elements with the `.reveal` class
 * within the given container ref. Adds `.in-view` when they scroll into view.
 *
 * Usage:
 *   const revealRef = useReveal();
 *   <div ref={revealRef}> ... <div className="reveal">content</div> ... </div>
 *
 * This replaces motion's `whileInView` which has hydration timing bugs on
 * mobile Chrome with Next.js streaming/SSR.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.reveal, .reveal-pop');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
