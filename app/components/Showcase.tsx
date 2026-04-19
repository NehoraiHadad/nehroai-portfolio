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
  <div className="bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 w-56 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col items-center text-center relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 relative">
      <div className="absolute inset-0 rounded-xl bg-cyan-400/20 animate-ping opacity-20" />
      <Network className="w-6 h-6" />
    </div>
    <div className="text-sm font-bold text-zinc-100 tracking-wide">{data.label}</div>
    <div className="text-[10px] text-cyan-400 font-mono mt-2 flex items-center gap-1.5 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      {data.shippingLabel}
    </div>
    <Handle
      type="source"
      position={data.isMobile ? Position.Bottom : Position.Right}
      className="w-3 h-3 bg-cyan-500 border-2 border-zinc-950"
    />
  </div>
);

const ProjectNode = ({ data }: { data: ProjectNodeData }) => {
  const Icon = data.icon || Cpu;
  return (
    <div
      className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 sm:p-5 w-[280px] sm:w-80 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 group cursor-pointer relative overflow-hidden"
      dir={data.isRtl ? 'rtl' : 'ltr'}
      style={{ textAlign: 'start' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/50 group-hover:via-blue-500/50 group-hover:to-purple-500/50 transition-all duration-500" />

      <Handle
        type="target"
        position={data.isMobile ? Position.Top : Position.Left}
        className="w-3 h-3 bg-zinc-700 border-2 border-zinc-950 group-hover:bg-cyan-500 transition-colors"
      />

      <div className="flex items-start gap-3 sm:gap-4 mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300 shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors leading-tight mb-1">{data.title}</div>
          <div className="text-[9px] sm:text-[10px] font-mono text-cyan-500/70 uppercase tracking-wider">{data.tags[0]}</div>
        </div>
      </div>
      <div className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{data.description}</div>
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
    const newNodes = [
      {
        id: 'orchestrator',
        type: 'orchestrator',
        position: isMobile ? { x: 0, y: 0 } : { x: 0, y: (caseStudies.length * 180) / 2 - 80 },
        data: { isMobile, label: showcase.orchestratorLabel, shippingLabel: showcase.shippingLabel },
      },
      ...caseStudies.map((study, idx) => ({
        id: study.id,
        type: 'project',
        position: isMobile
          ? { x: idx % 2 === 0 ? -60 : 60, y: 200 + idx * 220 }
          : { x: 350 + (idx % 2 === 0 ? 0 : 250), y: idx * 180 },
        data: { ...study, isMobile, isRtl },
      }))
    ];

    const newEdges = caseStudies.map((study) => ({
      id: `e-orch-${study.id}`,
      source: 'orchestrator',
      target: study.id,
      animated: true,
      style: { stroke: '#06b6d4', strokeWidth: 2, opacity: 0.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#06b6d4',
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [caseStudies, isMobile, isRtl, setNodes, setEdges, showcase.orchestratorLabel, showcase.shippingLabel]);

  return (
    <section id="showcase" ref={ref} className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
      <div className="reveal mb-12" style={{ textAlign: 'start' }}>
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 tracking-tight">{showcase.title}</h2>
        <p className="text-zinc-400 text-lg max-w-2xl">
          {showcase.description}
        </p>
      </div>

      <div
        className="reveal w-full h-[600px] sm:h-[650px] bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden relative shadow-2xl"
        style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
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
          fitViewOptions={{ padding: isMobile ? 0.3 : 0.1 }}
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-zinc-950/50"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#27272a" gap={20} size={1.5} />
        </ReactFlow>

        {/* Overlay hint */}
        <div
          className="absolute top-4 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center gap-2 pointer-events-none z-10 shadow-lg"
          style={{ insetInlineStart: '1rem' }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
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
                className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[100]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: isRtl ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 h-full w-full sm:w-[480px] bg-zinc-950 border-zinc-800 shadow-2xl z-[101] flex flex-col"
                dir={direction}
                style={{ insetInlineEnd: 0, borderInlineStartWidth: '1px' }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50 shrink-0">
                  <div className="flex items-center gap-3 text-zinc-100 font-mono text-sm">
                    <Settings2 className="w-5 h-5 text-cyan-500" />
                    {showcase.drawerTitle}
                  </div>
                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content (Form-like) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent" style={{ textAlign: 'start' }}>

                  {/* Field: ID & Status */}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.nodeId}</label>
                      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2 text-xs font-mono text-zinc-400 bidi-ltr">
                        {selectedStudy.id}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.status}</label>
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        {showcase.fields.deployed}
                      </div>
                    </div>
                  </div>

                  {/* Field: Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.projectName}</label>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-medium text-zinc-200 flex items-center gap-3">
                      {selectedStudy.icon && <selectedStudy.icon className="w-4 h-4 text-cyan-500" />}
                      {selectedStudy.title}
                    </div>
                  </div>

                  {/* Field: Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.description}</label>
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-zinc-400 leading-relaxed">
                      {selectedStudy.description}
                    </div>
                  </div>

                  {/* Field: Challenge */}
                  {selectedStudy.details?.challenge && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.challenge}</label>
                      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-zinc-300 leading-relaxed">
                        {selectedStudy.details.challenge}
                      </div>
                    </div>
                  )}

                  {/* Field: Solution */}
                  {selectedStudy.details?.solution && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-cyan-500/70 uppercase">{showcase.fields.solution}</label>
                      <div className="bg-cyan-950/10 border border-cyan-900/30 rounded-lg px-4 py-3 text-sm text-zinc-200 leading-relaxed">
                        {selectedStudy.details.solution}
                      </div>
                    </div>
                  )}

                  {/* Field: Tech Stack */}
                  {selectedStudy.details?.architecture && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">{showcase.fields.dependencies}</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedStudy.details.architecture.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono rounded-md bidi-ltr">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Footer (Actions) */}
                <div className="p-6 border-t border-zinc-800/80 bg-zinc-900/30 shrink-0 flex gap-3">
                  {selectedStudy.details?.liveUrl && (
                    <a
                      href={selectedStudy.details.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-bold rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4 fill-zinc-950" />
                      {showcase.actions.liveSite}
                    </a>
                  )}
                  {selectedStudy.details?.githubUrl && (
                    <a
                      href={selectedStudy.details.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-colors border border-zinc-700 bidi-ltr"
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
