'use client';

/**
 * useScene — scene-theming driver (3.6)
 *
 * Sets document.body.dataset.scene based on which page section is dominant
 * in the viewport, with an optional hover/focus "summon" override on Showcase
 * ProjectNodes.
 *
 * Scene mapping (motivated, not noisy):
 *   "default"  — Hero / ThePractice / Showcase → professional blueprint blue
 *   "terminal" — Dossier (#dossier)           → green CRT; the contact terminal
 *                is literally a terminal (traffic lights + scanlines), so the
 *                whole page going green-CRT as you arrive is thematically exact.
 *   "showcase" — optional hover-summon on a ProjectNode → subtly denser grid.
 *                Gated by SHOWCASE_HOVER_SUMMON (default ON); easy to flip.
 *
 * Mechanics:
 *  - IntersectionObserver on the key section roots with a root margin that
 *    keeps "default" sections dominant unless #dossier occupies most of the vp.
 *  - Single rAF to coalesce multiple simultaneous observations.
 *  - De-dupe against current dataset.scene before writing (avoids spurious
 *    style invalidations on every scroll tick).
 *  - ~140ms debounced release on hover-out (prevents jitter from the rotor
 *    swing briefly moving elements out from under the pointer).
 *  - Under prefers-reduced-motion: section-observer still fires (colour change
 *    is fine; the 960ms CSS transition is auto-collapsed by the kill-switch),
 *    but hover-summon flips are disabled (no rapid toggling).
 *  - SSR-safe: no window/document at module scope; all DOM access inside
 *    useEffect (runs only in the browser).
 */

import { useEffect } from 'react';

/** Set to false to disable showcase hover-summon if it ever feels gimmicky. */
const SHOWCASE_HOVER_SUMMON = true;

type Scene = 'default' | 'terminal' | 'showcase';

function setScene(scene: Scene) {
  if (document.body.dataset.scene === scene) return; // de-dupe
  document.body.dataset.scene = scene;
}

export function useScene() {
  useEffect(() => {
    // Bail out if the API isn't available (very old browsers).
    if (typeof IntersectionObserver === 'undefined') return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // ── Section observer ──────────────────────────────────────────────────────
    // We observe #dossier with a generous threshold: once it occupies ≥ 30% of
    // the viewport it's "dominant" → terminal scene. The other sections don't
    // need individual observers — non-intersection of dossier means default.
    // We also observe the sections above it so we can snap back to "default"
    // immediately when the user scrolls back up (the dossier exits first).
    let sectionRaf = 0;
    let dossierVisible = false;

    const coalesceSection = () => {
      cancelAnimationFrame(sectionRaf);
      sectionRaf = requestAnimationFrame(() => {
        // Hover/focus summon takes priority — don't override it.
        if (currentSummon !== null) return;
        setScene(dossierVisible ? 'terminal' : 'default');
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id === 'dossier') {
            dossierVisible = entry.isIntersecting;
          }
        }
        coalesceSection();
      },
      {
        // threshold 0.25: dossier is "dominant" when ≥25% visible.
        threshold: 0.25,
      }
    );

    // Observe #dossier.  Hero has no id, so we observe the other named sections
    // to revert to default when #dossier is no longer the primary section.
    const dossierEl = document.getElementById('dossier');
    const showcaseEl = document.getElementById('showcase');
    const practiceEl = document.getElementById('practice');

    if (dossierEl) sectionObserver.observe(dossierEl);
    if (showcaseEl) sectionObserver.observe(showcaseEl);
    if (practiceEl) sectionObserver.observe(practiceEl);

    // Set an initial scene (no flash) based on current scroll position.
    // If none of the sections is in view yet (page just loaded), we want
    // "default" — which is the CSS @property initial-value, so no write needed.
    // But we still set it explicitly so the attribute is present for debugging.
    setScene('default');

    // ── Showcase hover/focus summon ───────────────────────────────────────────
    // Attaches on the showcase canvas container; bubbles up from .project-node
    // divs (they are role=button descendants).
    let currentSummon: string | null = null;
    let summonRaf = 0;
    let releaseTimer = 0;

    const summonedTarget = (nav: HTMLElement): HTMLElement | null => {
      const hovered = nav.querySelector<HTMLElement>('.project-node:hover');
      if (hovered) return hovered;
      const focused = document.activeElement as HTMLElement | null;
      if (focused && focused.closest('.project-node') && nav.contains(focused)) {
        return focused.closest('.project-node') as HTMLElement;
      }
      return null;
    };

    const evaluateSummon = (nav: HTMLElement) => {
      cancelAnimationFrame(summonRaf);
      summonRaf = requestAnimationFrame(() => {
        const target = summonedTarget(nav);
        const want = target ? 'showcase' : null;
        if (want === currentSummon) return; // de-dupe
        if (want === null) {
          // Debounce release: the swing animation can briefly move the node away
          // from the pointer. Wait ~140ms; if still no target, snap back.
          window.clearTimeout(releaseTimer);
          releaseTimer = window.setTimeout(() => {
            if (summonedTarget(nav)) return; // pointer came back
            currentSummon = null;
            // Hand back to the section-observer state.
            setScene(dossierVisible ? 'terminal' : 'default');
          }, 140);
          return;
        }
        window.clearTimeout(releaseTimer);
        currentSummon = want;
        setScene(want);
      });
    };

    let showcaseListeners: (() => void) | null = null;

    if (SHOWCASE_HOVER_SUMMON && !reduced && showcaseEl) {
      const handleSummon = () => evaluateSummon(showcaseEl);
      (['pointerenter', 'pointerleave', 'focusin', 'focusout'] as const).forEach((ev) =>
        showcaseEl.addEventListener(ev, handleSummon, true)
      );
      showcaseListeners = () => {
        (['pointerenter', 'pointerleave', 'focusin', 'focusout'] as const).forEach((ev) =>
          showcaseEl.removeEventListener(ev, handleSummon, true)
        );
      };
    }

    return () => {
      sectionObserver.disconnect();
      cancelAnimationFrame(sectionRaf);
      cancelAnimationFrame(summonRaf);
      window.clearTimeout(releaseTimer);
      showcaseListeners?.();
    };
  }, []);
}
