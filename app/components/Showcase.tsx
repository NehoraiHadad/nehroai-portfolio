'use client';

import React, { useMemo, useState, useEffect, useRef, useId, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'motion/react';
import { X, Settings2, Play, Code2 } from 'lucide-react';
import { CaseStudy } from '@/lib/types';
import { useReveal } from '@/lib/useReveal';
import { useDictionary, useDirection } from '@/lib/i18n/provider';
import { caseStudyIcons } from '@/lib/case-study-icons';
import { useFocusTrap } from '@/lib/useFocusTrap';
import {
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { ShowcaseFlowNode, ShowcaseFlowEdge } from './ShowcaseFlow';

// 4.7: Lazy-load the heavy React Flow canvas.
// ssr:false — ReactFlow uses browser APIs (ResizeObserver, DOM measurement)
// and must not run on the server. Confirmed API in lazy-loading.md:
//   dynamic(() => import('...'), { ssr: false })
// The dynamic() call is at module top-level (not inside a component) so
// Next.js can associate it with a webpack chunk at build time.
const ShowcaseFlowCanvas = dynamic(() => import('./ShowcaseFlow'), {
  ssr: false,
  // While the chunk loads we render nothing — the canvas wrapper already
  // reserves the correct height and shows the blueprint-grid placeholder.
  loading: () => null,
});

export const Showcase = () => {
  const { showcase, a11y, caseStudies: rawCaseStudies } = useDictionary();
  const direction = useDirection();
  const isRtl = direction === 'rtl';
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<ShowcaseFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ShowcaseFlowEdge>([]);
  // 4.7: mount React Flow canvas only after the section enters near-viewport
  // (one-shot IntersectionObserver with 400px rootMargin — avoids loading
  // ~200 kB of React Flow JS for users who never scroll to the section).
  const [flowMounted, setFlowMounted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ref = useReveal<HTMLElement>();
  // 2.3: reveal-pop for drawer items. The drawer is always fully in view the
  // instant it opens, so it uses reveal-on-open (immediate) rather than a
  // viewport observer — items cascade in via their CSS transition-delays with
  // no dependency on scroll/animation timing or the 4s fallback. Keyed on
  // selectedStudy so it re-fires on open and when switching between studies.
  const drawerRef = useReveal<HTMLDivElement>([selectedStudy], { immediate: true });
  // 4.1: focus trap + restore for the drawer dialog
  const drawerTitleId = useId();
  // Tracks which element opened the drawer so we can restore focus on close.
  // Using a ref (not state) avoids re-renders and stays stable across callbacks.
  const restoreRef = useRef<HTMLElement | null>(null);
  const drawerTrapRef = useFocusTrap<HTMLDivElement>({
    active: selectedStudy !== null,
    restoreRef,
  });
  const closeDrawer = useCallback(() => {
    setSelectedStudy(null);
    // useFocusTrap will call restoreRef.current.focus() on deactivation
  }, []);
  // Called whenever a node is activated (click or keyboard) to open the drawer
  const openDrawer = useCallback((study: CaseStudy) => {
    restoreRef.current = document.activeElement as HTMLElement;
    setSelectedStudy(study);
  }, []);
  // 4.1: set inert on main content while drawer is open
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    if (selectedStudy) {
      main.setAttribute('inert', '');
    } else {
      main.removeAttribute('inert');
    }
    return () => main.removeAttribute('inert');
  }, [selectedStudy]);
  const caseStudies = useMemo<CaseStudy[]>(
    () =>
      rawCaseStudies.map((study) => ({
        ...study,
        icon: caseStudyIcons[study.icon],
      })),
    [rawCaseStudies]
  );
  const featured = useMemo<CaseStudy[]>(
    () => caseStudies.filter((s) => s.tier !== 'compact'),
    [caseStudies]
  );
  const compact = useMemo<CaseStudy[]>(
    () => caseStudies.filter((s) => s.tier === 'compact'),
    [caseStudies]
  );
  const flowHeight = useMemo(() => {
    if (isMobile) {
      return Math.max(760, 220 + featured.length * 170);
    }

    return Math.max(680, 220 + featured.length * 140);
  }, [featured.length, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 4.7: one-shot IntersectionObserver — mount React Flow only when the canvas
  // wrapper is within 400px of the viewport.  Avoids eagerly loading ~200 kB
  // of React Flow JS for users who never scroll to the section.
  useEffect(() => {
    if (flowMounted) return;
    const el = canvasRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setFlowMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [flowMounted]);

  useEffect(() => {
    const projectStartY = isMobile ? 170 : 30;
    const projectGap = isMobile ? 180 : 150;
    const orchestratorY = isMobile
      ? 0
      : projectStartY + ((featured.length - 1) * projectGap) / 2 - 40;
    const newNodes = [
      {
        id: 'orchestrator',
        type: 'orchestrator',
        position: isMobile ? { x: 0, y: 0 } : { x: 0, y: orchestratorY },
        data: { isMobile, label: showcase.orchestratorLabel, shippingLabel: showcase.shippingLabel },
      },
      ...featured.map((study, idx) => ({
        id: study.id,
        type: 'project',
        position: isMobile
          ? { x: 0, y: projectStartY + idx * projectGap }
          // Two columns spaced so the 320px-wide cards never overlap horizontally
          // (left col [360,680], right col [720,1040] → 40px gutter). Vertical gap
          // is 2×projectGap within a column (300 > 192px card height) so the
          // staggered fan-out reads as a clean diagonal with no collisions.
          : { x: idx % 2 === 0 ? 360 : 720, y: projectStartY + idx * projectGap },
        // 4.1: pass onOpen so keyboard activation (Enter/Space) works from ProjectNode.
        // isSpotlit is intentionally NOT driven by selectedStudy: rebuilding nodes on
        // open would detach the focused node element and break focus restore (4.1) —
        // and the drawer + backdrop cover the canvas anyway, so a selected-node
        // spotlight would be invisible.
        data: { ...study, isMobile, isRtl, isSpotlit: false, onOpen: openDrawer },
      }))
    ];

    const newEdges = featured.map((study) => ({
      id: `e-orch-${study.id}`,
      source: 'orchestrator',
      target: study.id,
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 2, opacity: 0.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--accent)',
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [featured, isMobile, isRtl, openDrawer, setNodes, setEdges, showcase.orchestratorLabel, showcase.shippingLabel]);

  return (
    <section id="showcase" ref={ref} className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
      <div className="reveal mb-12" style={{ textAlign: 'start' }}>
        <span className="section-marker mb-4" dir="ltr">{showcase.sectionMarker}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-fg-0 mt-4 mb-4 tracking-tight">{showcase.title}</h2>
        <p className="text-fg-1 text-lg max-w-2xl">
          {showcase.description}
        </p>
      </div>

      {/* 4.7: canvas wrapper — height reserved to avoid CLS while the chunk loads */}
      <div
        ref={canvasRef}
        className="reveal w-full bg-page border border-line/80 rounded-2xl overflow-hidden relative shadow-2xl"
        style={{ '--reveal-delay': '200ms', height: `${flowHeight}px` } as React.CSSProperties}
      >
        {/* Blueprint-grid placeholder shown until React Flow chunk is loaded */}
        {!flowMounted && (
          <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
        )}

        {/* 4.7: lazy-loaded canvas — only mounted after section nears viewport */}
        {flowMounted && (
          <ShowcaseFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(event, node) => {
              if (node.type === 'project') {
                // 4.1: capture the clicked element for focus restore when drawer closes
                restoreRef.current = event.target as HTMLElement;
                setSelectedStudy(node.data as CaseStudy);
              }
            }}
            isMobile={isMobile}
          />
        )}

        {/* Overlay hint */}
        <div
          className="absolute top-4 bg-surface/90 backdrop-blur-md border border-line/80 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-mono text-fg-1 flex items-center gap-2 pointer-events-none z-10 shadow-lg"
          style={{ insetInlineStart: '1rem' }}
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {showcase.hint}
        </div>
      </div>

      {/* Compact "Also shipped" strip */}
      {compact.length > 0 && (
        <div className="reveal mt-12" style={{ '--reveal-delay': '300ms' } as React.CSSProperties}>
          <div className="mb-6" style={{ textAlign: 'start' }}>
            <h3 className="text-xl font-bold text-fg-0 mb-1">{showcase.compactTitle}</h3>
            <p className="text-fg-2 text-sm">{showcase.compactDescription}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {compact.map((study) => {
              const Icon = study.icon;
              return (
                <div
                  key={study.id}
                  role="button"
                  tabIndex={0}
                  aria-label={study.title}
                  dir={direction}
                  style={{ textAlign: 'start' }}
                  className="bg-surface/90 border border-line rounded-xl p-4 flex items-start gap-3 hover:border-accent/40 transition-[border-color] cursor-pointer focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none"
                  onClick={() => openDrawer(study)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDrawer(study);
                    }
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-raised/50 border border-line-strong/50 flex items-center justify-center text-fg-1 shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-fg-0 mb-1 leading-tight">{study.title}</div>
                    <div className="text-xs text-fg-2 leading-relaxed line-clamp-2">{study.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4.1: sr-only project list — SEO + screen-reader fallback for the canvas */}
      <ul className="sr-only">
        {caseStudies.map((study) => (
          <li key={study.id}>
            <a
              href={study.details?.liveUrl ?? study.details?.githubUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              {study.title}
            </a>
          </li>
        ))}
      </ul>

      {/* Node Configuration Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedStudy && (
            <>
              {/* Backdrop */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeDrawer}
                className="fixed inset-0 bg-page/60 backdrop-blur-sm z-[100]"
              />

              {/* Drawer — 4.1: dialog role, focus trap, Escape, focus restore */}
              <m.div
                ref={drawerTrapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={drawerTitleId}
                initial={{ x: isRtl ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 h-full w-full sm:w-[480px] bg-page border-line shadow-2xl z-[101] flex flex-col"
                dir={direction}
                style={{ insetInlineEnd: 0, borderInlineStartWidth: '1px' }}
                onKeyDown={(e) => { if (e.key === 'Escape') closeDrawer(); }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-line/80 bg-surface/50 shrink-0">
                  <div className="flex items-center gap-3 text-fg-0 font-mono text-sm">
                    <Settings2 className="w-5 h-5 text-accent" aria-hidden="true" />
                    {/* 4.1: title element labelled by drawerTitleId */}
                    <span id={drawerTitleId}>{selectedStudy?.title ?? showcase.drawerTitle}</span>
                  </div>
                  {/* 4.2+4.6: localized aria-label, 44×44 touch target */}
                  <button
                    onClick={closeDrawer}
                    aria-label={a11y.closeDialog}
                    className="inline-flex h-11 w-11 items-center justify-center text-fg-2 hover:text-fg-1 transition-colors rounded-[var(--r-1)] focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Drawer Content (Form-like) */}
                {/* 2.3: drawerRef enables reveal-pop on items; key resets observer on study change */}
                <div
                  key={selectedStudy.id}
                  ref={drawerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-slim"
                  style={{ textAlign: 'start' }}
                >

                  {/* Field: ID & Status */}
                  <div className="reveal-pop flex gap-4" style={{ '--reveal-delay': '40ms' } as React.CSSProperties}>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.nodeId}</label>
                      <div className="bg-surface/50 border border-line/50 rounded-lg px-3 py-2 text-xs font-mono text-fg-1 bidi-ltr">
                        {selectedStudy.id}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.status}</label>
                      <div className="bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 text-xs font-mono text-accent flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        {showcase.fields.deployed}
                      </div>
                    </div>
                  </div>

                  {/* Field: Name */}
                  <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
                    <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.projectName}</label>
                    <div className="bg-surface/80 border border-line rounded-lg px-4 py-3 text-sm font-medium text-fg-0 flex items-center gap-3">
                      {selectedStudy.icon && <selectedStudy.icon className="w-4 h-4 text-accent" />}
                      {selectedStudy.title}
                    </div>
                  </div>

                  {/* Field: Description */}
                  <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
                    <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.description}</label>
                    <div className="bg-surface/50 border border-line/50 rounded-lg px-4 py-3 text-sm text-fg-1 leading-relaxed">
                      {selectedStudy.description}
                    </div>
                  </div>

                  {/* Field: Challenge */}
                  {selectedStudy.details?.challenge && (
                    <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '220ms' } as React.CSSProperties}>
                      <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.challenge}</label>
                      <div className="bg-surface/50 border border-line/50 rounded-lg px-4 py-3 text-sm text-fg-1 leading-relaxed">
                        {selectedStudy.details.challenge}
                      </div>
                    </div>
                  )}

                  {/* Field: Solution */}
                  {selectedStudy.details?.solution && (
                    <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '280ms' } as React.CSSProperties}>
                      <label className="text-[10px] font-mono text-accent-text uppercase">{showcase.fields.solution}</label>
                      <div className="bg-accent-dim/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-fg-0 leading-relaxed">
                        {selectedStudy.details.solution}
                      </div>
                    </div>
                  )}

                  {/* Field: Impact — accent-tinted stat block */}
                  {selectedStudy.impact && (
                    <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '320ms' } as React.CSSProperties}>
                      <label className="text-[10px] font-mono text-ok uppercase tracking-wider">{showcase.fields.impact}</label>
                      <div className="bg-ok/5 border border-ok/25 rounded-lg px-4 py-3 flex items-start gap-3">
                        <span className="text-ok shrink-0 mt-0.5 font-mono text-sm" aria-hidden="true">✓</span>
                        <p className="font-mono text-xs text-fg-0 leading-relaxed">{selectedStudy.impact}</p>
                      </div>
                    </div>
                  )}

                  {/* Field: Tech Stack */}
                  {selectedStudy.details?.architecture && (
                    <div className="reveal-pop space-y-2" style={{ '--reveal-delay': '340ms' } as React.CSSProperties}>
                      <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.dependencies}</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedStudy.details.architecture.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-surface border border-line text-fg-1 text-[11px] font-mono rounded-md bidi-ltr">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Footer (Actions) */}
                <div className="p-6 border-t border-line/80 bg-surface/30 shrink-0 flex gap-3">
                  {selectedStudy.details?.liveUrl && (
                    <a
                      href={selectedStudy.details.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent text-[var(--fg-on-accent)] text-sm font-bold rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4 fill-[var(--fg-on-accent)]" />
                      {showcase.actions.liveSite}
                    </a>
                  )}
                  {selectedStudy.details?.githubUrl && (
                    <a
                      href={selectedStudy.details.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-raised hover:bg-line-strong text-fg-0 text-sm font-medium rounded-lg transition-colors border border-line-strong bidi-ltr"
                    >
                      <Code2 className="w-4 h-4" />
                      {showcase.actions.github}
                    </a>
                  )}
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};
