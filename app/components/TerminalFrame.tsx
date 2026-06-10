'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/**
 * TerminalFrame — shared terminal panel chrome.
 *
 * Renders: rounded panel (--r-3), hairline border, header bar with macOS-style
 * traffic lights + title slot, optional scanline veil, children body.
 *
 * Props
 *   title         — string shown in the header title slot
 *   statusSlot    — optional ReactNode rendered on the right side of the header
 *   headerSlot    — replaces the default chrome header entirely (for custom headers
 *                   like InteractiveAgent's matrix mode variant)
 *   className     — outer panel className override
 *   bodyClassName — body div className override
 *   withScanlines — render the panel-level scanline overlay (absolute, z-10)
 *   inkTrail      — animate a border-draw on first scroll-into-view (Dossier only)
 */
export interface TerminalFrameProps {
  title?: React.ReactNode;
  statusSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  withScanlines?: boolean;
  inkTrail?: boolean;
  children: React.ReactNode;
  /** HTML dir attribute forwarded to the outer panel element */
  dir?: 'ltr' | 'rtl' | 'auto';
}

type InkState = 'idle' | 'drawing' | 'done';

export const TerminalFrame = ({
  title,
  statusSlot,
  headerSlot,
  className = '',
  bodyClassName = '',
  withScanlines = false,
  inkTrail = false,
  children,
  dir,
}: TerminalFrameProps) => {
  const prefersReduced = usePrefersReducedMotion();
  // motion's useReducedMotion is used by MotionConfig reducedMotion="user" —
  // we also check the hook directly so the component works standalone.
  const motionPrefersReduced = useReducedMotion();
  const skipAnimation = prefersReduced || motionPrefersReduced;

  const [inkState, setInkState] = useState<InkState>(inkTrail && !skipAnimation ? 'idle' : 'done');
  const [contentVisible, setContentVisible] = useState(inkTrail && !skipAnimation ? false : true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Trigger ink-trail once when the panel first scrolls into view.
  // Uses the same rootMargin/threshold conventions as lib/useReveal.ts.
  useEffect(() => {
    if (!inkTrail || skipAnimation) return;

    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            setInkState('drawing');
            // Content fades in after the draw completes (~2.1s + 0.2s buffer)
            const revealTimer = setTimeout(() => {
              setContentVisible(true);
            }, 2300);
            const doneTimer = setTimeout(() => {
              setInkState('done');
            }, 2600); // SVG fades out 0.3s after content appears
            return () => {
              clearTimeout(revealTimer);
              clearTimeout(doneTimer);
            };
          }
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, [inkTrail, skipAnimation]);

  // Panel rx matches --r-3 (16px)
  const PANEL_RX = 16;

  const showSvg = inkTrail && !skipAnimation && inkState !== 'done';

  return (
    <div
      ref={panelRef}
      className={`terminal-frame${className ? ` ${className}` : ''}`}
      style={showSvg ? { borderColor: 'transparent' } : undefined}
      dir={dir}
    >
      {/* Ink-trail SVG border draw — only for inkTrail=true, skipped under reduced motion.
          Stroke is white (#eaf4ff), deliberately matching the landing's light-trail
          aesthetic — a hot-white leading edge that feels like laser-etching the border
          into existence. The drop-shadow filter mixes off var(--accent) for colour. */}
      {showSvg && (
        <InkTrailSvg
          rx={PANEL_RX}
          drawing={inkState === 'drawing'}
        />
      )}

      {/* Header chrome — use headerSlot to replace entirely (InteractiveAgent),
          or title/statusSlot for the default traffic-lights layout (Dossier). */}
      {headerSlot ?? (
        <div className="terminal-frame__chrome">
          <div className="terminal-frame__lights">
            <div className="terminal-frame__light" />
            <div className="terminal-frame__light" />
            <div className="terminal-frame__light" />
            {title && (
              <span
                className="font-mono text-[10px] text-fg-2 select-none bidi-ltr"
                style={{ marginInlineStart: '0.75rem' }}
              >
                {title}
              </span>
            )}
          </div>
          {statusSlot && (
            <div className="flex items-center gap-1.5">
              {statusSlot}
            </div>
          )}
        </div>
      )}

      {/* Panel scanline — absolute overlay, panel-level (not fixed like .scanline-veil) */}
      {withScanlines && <div className="panel-scanline" aria-hidden />}

      {/* Body */}
      <div
        className={`terminal-frame__body${bodyClassName ? ` ${bodyClassName}` : ''}`}
        style={
          inkTrail && !skipAnimation
            ? {
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)',
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
};

/* ── InkTrailSvg ──────────────────────────────────────────────────────── */
/* Absolutely-positioned SVG overlay that draws the panel border.
   Uses motion.rect with pathLength animated 0→1 (~2.1s linear) and a
   leading-dot rect (strokeDasharray '0.006 0.994', animated via pathLength offset).
   Stroke: #eaf4ff (deliberate white — like the landing's light-trail, the hot
   leading edge that feels like the border being laser-etched into existence).
   Drop-shadow mixes off var(--accent) for brand colour. */
const InkTrailSvg = ({ rx, drawing }: { rx: number; drawing: boolean }) => {
  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
        overflow: 'visible',
        opacity: drawing ? 1 : 0,
        transition: drawing ? undefined : 'opacity 0.3s var(--ease-out)',
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="ink-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="3"
            floodColor="color-mix(in oklab, var(--accent) 80%, transparent)"
            floodOpacity="0.9"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="8"
            floodColor="color-mix(in oklab, var(--accent) 40%, transparent)"
            floodOpacity="0.6"
          />
        </filter>
      </defs>

      {/* Border trace — full perimeter draw */}
      <motion.rect
        x="0.5"
        y="0.5"
        width="calc(100% - 1px)"
        height="calc(100% - 1px)"
        rx={rx}
        ry={rx}
        fill="none"
        stroke="#eaf4ff"
        strokeWidth="1.5"
        filter="url(#ink-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={drawing ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 2.1, ease: 'linear' }}
      />

      {/* Leading dot — a tiny bright head that runs ahead of the trace.
          strokeDasharray '0.006 0.994' means 0.6% filled, 99.4% gap,
          creating a single bright point. It runs at the same speed as the
          trace so it always sits at the leading edge. */}
      <motion.rect
        x="0.5"
        y="0.5"
        width="calc(100% - 1px)"
        height="calc(100% - 1px)"
        rx={rx}
        ry={rx}
        fill="none"
        stroke="#eaf4ff"
        strokeWidth="3"
        strokeDasharray="0.006 0.994"
        pathLength={1}
        filter="url(#ink-glow)"
        initial={{ strokeDashoffset: 0, opacity: 0 }}
        animate={drawing ? { strokeDashoffset: -1, opacity: 1 } : { strokeDashoffset: 0, opacity: 0 }}
        transition={{ duration: 2.1, ease: 'linear' }}
      />
    </svg>
  );
};
