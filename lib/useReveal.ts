'use client';

import { useRef, useEffect, type DependencyList } from 'react';

interface RevealOptions {
  /**
   * Reveal-on-open instead of reveal-on-scroll. For content that is guaranteed
   * to be visible the moment it mounts — drawers, modals — a viewport
   * IntersectionObserver is the wrong tool: it couples the reveal to scroll/
   * animation timing and leans on the 4s CSS fallback when it doesn't fire.
   * With `immediate`, the items flip to `.in-view` as soon as they mount; the
   * CSS `transition-delay` on each `.reveal-pop` still produces the stagger.
   */
  immediate?: boolean;
}

/**
 * Reveal-on-scroll (default): attaches a native IntersectionObserver to the
 * `.reveal` / `.reveal-pop` elements within the container ref and adds
 * `.in-view` as they enter the viewport. Replaces motion's `whileInView`,
 * which has hydration timing bugs on mobile Chrome with Next.js streaming/SSR.
 *
 * Reveal-on-open (`{ immediate: true }`): for always-visible-on-mount content.
 *
 * Usage:
 *   const revealRef = useReveal();                          // scroll sections
 *   const drawerRef = useReveal([open], { immediate: true }); // drawers/modals
 *   <div ref={revealRef}> ... <div className="reveal-pop">…</div> ... </div>
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  // Re-run the setup when these change. Required for content that mounts AFTER
  // the host component (e.g. the showcase drawer): with a static `[]` the
  // one-shot effect runs while the container is still null and never attaches.
  deps: DependencyList = [],
  { immediate = false }: RevealOptions = {}
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.reveal, .reveal-pop');
    if (elements.length === 0) return;

    if (immediate) {
      // Double rAF: the items mount at opacity:0 (not yet painted). Flipping the
      // class in the same tick would skip the transition (no painted "from"
      // frame). Let the 0-state paint once, then flip on the next frame so the
      // staggered transition actually animates instead of snapping in.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          for (const el of elements) el.classList.add('in-view');
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
