'use client';

import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { TopNav } from './TopNav';
import { Hero } from './Hero';
import { ThePractice } from './ThePractice';
import { Showcase } from './Showcase';
import { Dossier } from './Dossier';
import { Footer } from './Footer';
import { BackgroundEffect } from './BackgroundEffect';
import { MobileAgent } from './MobileAgent';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // 2.1: MotionConfig with reducedMotion="user" gates all motion-library
    // animations site-wide — respects the OS prefers-reduced-motion setting.
    // Hand-rolled loops (setInterval/setTimeout/rAF) are gated separately
    // via usePrefersReducedMotion in each component.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-page text-fg-0 font-sans selection:bg-accent/30 relative">
        <BackgroundEffect />
        <TopNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="relative z-10">
          <Hero />
          <ThePractice />
          <Showcase />
          <Dossier />
        </main>
        <Footer />
        <MobileAgent />
      </div>
    </MotionConfig>
  );
}
