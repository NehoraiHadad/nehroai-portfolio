'use client';

/**
 * ShowcaseFlow — the React Flow canvas extracted from Showcase.tsx.
 *
 * Loaded lazily via next/dynamic({ ssr: false }) in Showcase.tsx so the
 * @xyflow/react bundle (~200 kB gzipped) is never included in the initial
 * page payload.  Showcase mounts this component only once the section is
 * near-viewport (rootMargin 400px).
 *
 * nodeTypes / edgeTypes are declared at module scope (outside any component)
 * to satisfy React Flow's requirement that they are referentially stable
 * across renders — fixes the "nodeTypes changed on every render" console
 * warning that occurs when the object is created inside a component body.
 */

import React from 'react';
import { Network, Cpu } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CaseStudy } from '@/lib/types';

// ─── Node data types ────────────────────────────────────────────────────────

export type OrchestratorNodeData = Record<string, unknown> & {
  isMobile: boolean;
  label: string;
  shippingLabel: string;
};

export type ProjectNodeData = Record<string, unknown> & CaseStudy & {
  isMobile: boolean;
  isRtl: boolean;
  isSpotlit: boolean;
  onOpen?: (study: CaseStudy) => void;
};

export type ShowcaseFlowNode = Node<OrchestratorNodeData | ProjectNodeData>;
export type ShowcaseFlowEdge = Edge;

// ─── Node components — defined outside Showcase so nodeTypes object is stable ──

const OrchestratorNode = ({ data }: { data: OrchestratorNodeData }) => (
  <div
    className="bg-page/90 backdrop-blur-xl border border-accent/30 rounded-2xl p-5 w-56 flex flex-col items-center text-center relative overflow-hidden group"
    style={{ boxShadow: '0 0 30px color-mix(in oklab, var(--accent) 15%, transparent)' }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 relative">
      <div className="absolute inset-0 rounded-xl bg-accent/20 animate-ping opacity-20" />
      <Network className="w-6 h-6" aria-hidden="true" />
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
  // 4.1: keyboard activation — Enter/Space opens the drawer via onOpen callback
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      data.onOpen?.(data as unknown as CaseStudy);
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={data.title}
      onKeyDown={handleKeyDown}
      className={`bg-surface/90 backdrop-blur-xl border border-line rounded-2xl p-4 sm:p-5 w-[280px] sm:w-80 shadow-xl hover:border-accent/40 project-node transition-all duration-300 group cursor-pointer relative overflow-hidden focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none${data.isSpotlit ? ' is-spotlit' : ''}`}
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
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-fg-0 group-hover:text-accent-pale transition-colors leading-tight mb-1">
            {data.title}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono text-accent-text uppercase tracking-wider">
            {data.tags[0]}
          </div>
        </div>
      </div>
      <div className="text-xs text-fg-1 leading-relaxed line-clamp-2 mb-3">{data.description}</div>
      {/* 5.1: impact headline chip */}
      {data.impact && (
        <div className="font-mono text-[9px] text-ok bg-ok/5 border border-ok/20 rounded px-2 py-1 line-clamp-2 leading-relaxed">
          ✓ {data.impact}
        </div>
      )}
    </div>
  );
};

// ─── nodeTypes at module scope — prevents the React Flow "recreating nodeTypes
//     on every render" console warning and avoids unnecessary re-renders. ─────
export const nodeTypes: NodeTypes = {
  orchestrator: OrchestratorNode as NodeTypes[string],
  project: ProjectNode as NodeTypes[string],
};

// ─── ShowcaseFlow props ──────────────────────────────────────────────────────

export interface ShowcaseFlowProps {
  nodes: ShowcaseFlowNode[];
  edges: ShowcaseFlowEdge[];
  onNodesChange: OnNodesChange<ShowcaseFlowNode>;
  onEdgesChange: OnEdgesChange<ShowcaseFlowEdge>;
  onNodeClick: NodeMouseHandler<ShowcaseFlowNode>;
  isMobile: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShowcaseFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  isMobile,
}: ShowcaseFlowProps) {
  return (
    <ReactFlow<ShowcaseFlowNode, ShowcaseFlowEdge>
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
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
  );
}
