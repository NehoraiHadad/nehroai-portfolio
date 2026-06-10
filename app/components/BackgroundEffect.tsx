'use client';

import React from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

// Brand base: a flat navy page with a faint blueprint grid that fades at all
// edges, a scene-coloured centre glow that breathes via CSS keyframes, and a
// faint static diagonal trace. No filter:blur() divs — the radial-gradient
// itself does the soft falloff so we animate ONLY opacity, which is cheap
// (compositor-only, no layout/paint).
export const BackgroundEffect = () => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-page">
      {/* Blueprint grid — radial ellipse mask so it fades at ALL edges, not
          just the bottom. Color/size read var(--scene-grid)/var(--scene-grid-size)
          so the scene-theming layer can override them later. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--scene-grid, var(--grid-color)) 1px, transparent 1px), ' +
            'linear-gradient(90deg, var(--scene-grid, var(--grid-color)) 1px, transparent 1px)',
          backgroundSize:
            'var(--scene-grid-size, var(--grid-size)) var(--scene-grid-size, var(--grid-size))',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, #000 35%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, #000 35%, transparent 100%)',
        }}
      />

      {/* Centre glow — pre-blurred via the radial-gradient shape itself; no
          filter property. Breathes via the glow-breathe keyframe (opacity only).
          Colour is var(--scene-glow) so it tracks future scene changes. The
          animation is defined in globals.css and auto-killed by the reduced-motion
          media rule there. Under reduced motion the glow renders at resting opacity
          (0.78) with no movement. */}
      <div
        aria-hidden
        className={prefersReduced ? 'bg-glow-static' : 'bg-glow-breathe'}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 50% at 50% 38%, var(--scene-glow, rgba(37,99,235,0.22)) 0%, transparent 70%)',
        }}
      />

      {/* Faint diagonal electric-blue trace — static (no JS animation, no
          filter:blur). Opacity-only, cheap. Gated: hidden entirely under reduced
          motion via the CSS kill-switch's animation-duration:0.001ms, but since
          this is static we just suppress it at the JS level too. */}
      {!prefersReduced && (
        <div
          aria-hidden
          className="absolute -top-1/4 -left-1/4 h-[150%] w-[60%] rotate-[18deg] opacity-[0.22]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--accent) 22%, transparent) 50%, transparent 100%)',
          }}
        />
      )}

      {/* Scanline veil — fixed overlay using the shared .scanline-veil class
          defined in globals.css. Opacity driven by var(--scene-scan, var(--scanline-opacity))
          so the terminal scene activates it. */}
      <div className="scanline-veil" aria-hidden />
    </div>
  );
};
