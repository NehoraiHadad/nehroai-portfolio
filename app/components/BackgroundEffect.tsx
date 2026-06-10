'use client';

import React from 'react';
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

// Brand base: a flat navy page with a faint blueprint grid that fades out
// toward the bottom, plus a single faint diagonal electric-blue trace.
// Operator-terminal-on-a-blueprint — no purple/pink orbs, no glassmorphism.
export const BackgroundEffect = () => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-page">
      {/* Blueprint grid, faded at the bottom */}
      <div
        className="blueprint-grid absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        }}
      />

      {/* Faint diagonal electric-blue trace — 2.1: static at settled opacity for reduced motion */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={prefersReduced ? { opacity: 0.22 } : { opacity: [0.18, 0.32, 0.18] }}
        transition={prefersReduced ? { duration: 0 } : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1/4 -left-1/4 h-[150%] w-[60%] rotate-[18deg]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--accent) 22%, transparent) 50%, transparent 100%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Soft accent halo, top-left — 2.1: static at settled opacity for reduced motion */}
      <motion.div
        aria-hidden
        animate={prefersReduced ? { scale: 1, opacity: 0.10 } : { scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={prefersReduced ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-12%] left-[-8%] h-[45%] w-[45%] rounded-full"
        style={{ background: 'var(--accent)', filter: 'blur(140px)' }}
      />
    </div>
  );
};
