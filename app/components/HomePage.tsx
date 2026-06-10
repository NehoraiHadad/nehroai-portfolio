'use client';

import { useState } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import { TopNav } from './TopNav';
import { Hero } from './Hero';
import { ThePractice } from './ThePractice';
import { Showcase } from './Showcase';
import { Dossier } from './Dossier';
import { Footer } from './Footer';
import { BackgroundEffect } from './BackgroundEffect';
import { MobileAgent } from './MobileAgent';
import { useDictionary } from '@/lib/i18n/provider';
import { useScene } from '@/lib/useScene';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { a11y } = useDictionary();

  // 3.6: mount scene driver — sets body[data-scene] from scroll position and
  // hover/focus summons. One instance only; lives for the page lifetime.
  useScene();

  return (
    // 2.1: MotionConfig with reducedMotion="user" gates all motion-library
    // animations site-wide — respects the OS prefers-reduced-motion setting.
    // Hand-rolled loops (setInterval/setTimeout/rAF) are gated separately
    // via usePrefersReducedMotion in each component.
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-page text-fg-0 font-sans selection:bg-accent/30 relative">
        {/* 4.3: Skip-to-content — first focusable element on the page.
            Visually hidden until focused; jumps to id=main-content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-[var(--fg-on-accent)] focus:font-semibold focus:text-sm focus:shadow-lg"
        >
          {a11y.skipToContent}
        </a>
        <BackgroundEffect />
        <TopNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        {/* 4.3: id=main-content is the skip-link target; 4.1: inert set by MobileAgent when chat opens */}
        <main id="main-content" className="relative z-10">
          <Hero />
          <ThePractice />
          <Showcase />
          <Dossier />
        </main>
        <Footer />
        <MobileAgent />
      </div>
    </MotionConfig>
    </LazyMotion>
  );
}
