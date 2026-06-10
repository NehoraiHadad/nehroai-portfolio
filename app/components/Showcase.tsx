'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, Cpu, Settings2, Play, Code2 } from 'lucide-react';
import { CaseStudy } from '@/lib/types';
import { useReveal } from '@/lib/useReveal';
import { useDictionary, useDirection } from '@/lib/i18n/provider';
import { caseStudyIcons } from '@/lib/case-study-icons';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type OrchestratorNodeData = Record<string, unknown> & {
  isMobile: boolean;
  label: string;
  shippingLabel: string;
};

type ProjectNodeData = Record<string, unknown> & CaseStudy & {
  isMobile: boolean;
  isRtl: boolean;
};

type ShowcaseNode = Node<OrchestratorNodeData | ProjectNodeData>;
type ShowcaseEdge = Edge;

const OrchestratorNode = ({ data }: { data: OrchestratorNodeData }) => (
  <div className="bg-page/90 backdrop-blur-xl border border-accent/30 rounded-2xl p-5 w-56 flex flex-col items-center text-center relative overflow-hidden group" style={{ boxShadow: '0 0 30px color-mix(in oklab, var(--accent) 15%, transparent)' }}>
    <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 relative">
      <div className="absolute inset-0 rounded-xl bg-accent/20 animate-ping opacity-20" />
      <Network className="w-6 h-6" />
    </div>
    <div className="text-sm font-bold text-fg-0 tracking-wide">{data.label}</div>
    <div className="text-[10px] text-accent font-mono mt-2 flex items-center gap-1.5 bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      {data.shippingLabel}
    </div>
    <Handle
      type="source"
      position={data.isMobile ? Position.Bottom : Position.Right}
      className="w-3 h-3 bg-accent border-2 border-page"
    />
  </div>
);

const ProjectNode = ({ data }: { data: ProjectNodeData }) => {
  const Icon = data.icon || Cpu;
  return (
    <div
      className="bg-surface/90 backdrop-blur-xl border border-line rounded-2xl p-4 sm:p-5 w-[280px] sm:w-80 shadow-xl hover:border-accent/40 project-node transition-all duration-300 group cursor-pointer relative overflow-hidden"
      dir={data.isRtl ? 'rtl' : 'ltr'}
      style={{ textAlign: 'start' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/50 group-hover:via-accent-pale/50 group-hover:to-accent-ice/50 transition-all duration-500" />

      <Handle
        type="target"
        position={data.isMobile ? Position.Top : Position.Left}
        className="w-3 h-3 bg-line-strong border-2 border-page group-hover:bg-accent transition-colors"
      />

      <div className="flex items-start gap-3 sm:gap-4 mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-raised/50 border border-line-strong/50 flex items-center justify-center text-fg-1 group-hover:text-accent group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300 shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-fg-0 group-hover:text-accent-pale transition-colors leading-tight mb-1">{data.title}</div>
          <div className="text-[9px] sm:text-[10px] font-mono text-accent-text uppercase tracking-wider">{data.tags[0]}</div>
        </div>
      </div>
      <div className="text-xs text-fg-1 leading-relaxed line-clamp-2">{data.description}</div>
    </div>
  );
};

const nodeTypes = {
  orchestrator: OrchestratorNode,
  project: ProjectNode,
};

export const Showcase = () => {
  const { showcase, caseStudies: rawCaseStudies } = useDictionary();
  const direction = useDirection();
  const isRtl = direction === 'rtl';
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<ShowcaseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ShowcaseEdge>([]);
  const ref = useReveal<HTMLElement>();
  const caseStudies = useMemo<CaseStudy[]>(
    () =>
      rawCaseStudies.map((study) => ({
        ...study,
        icon: caseStudyIcons[study.icon],
      })),
    [rawCaseStudies]
  );
  const flowHeight = useMemo(() => {
    if (isMobile) {
      return Math.max(760, 220 + caseStudies.length * 170);
    }

    return Math.max(680, 220 + caseStudies.length * 140);
  }, [caseStudies.length, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const projectStartY = isMobile ? 170 : 30;
    const projectGap = isMobile ? 180 : 150;
    const orchestratorY = isMobile
      ? 0
      : projectStartY + ((caseStudies.length - 1) * projectGap) / 2 - 40;
    const newNodes = [
      {
        id: 'orchestrator',
        type: 'orchestrator',
        position: isMobile ? { x: 0, y: 0 } : { x: 0, y: orchestratorY },
        data: { isMobile, label: showcase.orchestratorLabel, shippingLabel: showcase.shippingLabel },
      },
      ...caseStudies.map((study, idx) => ({
        id: study.id,
        type: 'project',
        position: isMobile
          ? { x: 0, y: projectStartY + idx * projectGap }
          : { x: idx % 2 === 0 ? 360 : 610, y: projectStartY + idx * projectGap },
        data: { ...study, isMobile, isRtl },
      }))
    ];

    const newEdges = caseStudies.map((study) => ({
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
  }, [caseStudies, isMobile, isRtl, setNodes, setEdges, showcase.orchestratorLabel, showcase.shippingLabel]);

  return (
    <section id="showcase" ref={ref} className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
      <div className="reveal mb-12" style={{ textAlign: 'start' }}>
        <span className="section-marker mb-4" dir="ltr">02 — SHOWCASE</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-fg-0 mt-4 mb-4 tracking-tight">{showcase.title}</h2>
        <p className="text-fg-1 text-lg max-w-2xl">
          {showcase.description}
        </p>
      </div>

      <div
        className="reveal w-full bg-page border border-line/80 rounded-2xl overflow-hidden relative shadow-2xl"
        style={{ '--reveal-delay': '200ms', height: `${flowHeight}px` } as React.CSSProperties}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(event, node) => {
            if (node.type === 'project') {
              setSelectedStudy(node.data as CaseStudy);
            }
          }}
          fitView
          fitViewOptions={{ padding: isMobile ? 0.18 : 0.12 }}
          minZoom={0.2}
          maxZoom={1.5}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          panOnDrag={false}
          nodesDraggable={false}
          elementsSelectable={false}
          className="bg-page/50"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--line-strong)" gap={20} size={1.5} />
        </ReactFlow>

        {/* Overlay hint */}
        <div
          className="absolute top-4 bg-surface/90 backdrop-blur-md border border-line/80 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-mono text-fg-1 flex items-center gap-2 pointer-events-none z-10 shadow-lg"
          style={{ insetInlineStart: '1rem' }}
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {showcase.hint}
        </div>
      </div>

      {/* Node Configuration Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedStudy && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedStudy(null)}
                className="fixed inset-0 bg-page/60 backdrop-blur-sm z-[100]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: isRtl ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 h-full w-full sm:w-[480px] bg-page border-line shadow-2xl z-[101] flex flex-col"
                dir={direction}
                style={{ insetInlineEnd: 0, borderInlineStartWidth: '1px' }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-line/80 bg-surface/50 shrink-0">
                  <div className="flex items-center gap-3 text-fg-0 font-mono text-sm">
                    <Settings2 className="w-5 h-5 text-accent" />
                    {showcase.drawerTitle}
                  </div>
                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="text-fg-2 hover:text-fg-1 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content (Form-like) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[color:var(--line-strong)] scrollbar-track-transparent" style={{ textAlign: 'start' }}>

                  {/* Field: ID & Status */}
                  <div className="flex gap-4">
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.projectName}</label>
                    <div className="bg-surface/80 border border-line rounded-lg px-4 py-3 text-sm font-medium text-fg-0 flex items-center gap-3">
                      {selectedStudy.icon && <selectedStudy.icon className="w-4 h-4 text-accent" />}
                      {selectedStudy.title}
                    </div>
                  </div>

                  {/* Field: Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.description}</label>
                    <div className="bg-surface/50 border border-line/50 rounded-lg px-4 py-3 text-sm text-fg-1 leading-relaxed">
                      {selectedStudy.description}
                    </div>
                  </div>

                  {/* Field: Challenge */}
                  {selectedStudy.details?.challenge && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-fg-2 uppercase">{showcase.fields.challenge}</label>
                      <div className="bg-surface/50 border border-line/50 rounded-lg px-4 py-3 text-sm text-fg-1 leading-relaxed">
                        {selectedStudy.details.challenge}
                      </div>
                    </div>
                  )}

                  {/* Field: Solution */}
                  {selectedStudy.details?.solution && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-accent-text uppercase">{showcase.fields.solution}</label>
                      <div className="bg-accent-dim/10 border border-accent/30 rounded-lg px-4 py-3 text-sm text-fg-0 leading-relaxed">
                        {selectedStudy.details.solution}
                      </div>
                    </div>
                  )}

                  {/* Field: Tech Stack */}
                  {selectedStudy.details?.architecture && (
                    <div className="space-y-2">
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
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};
