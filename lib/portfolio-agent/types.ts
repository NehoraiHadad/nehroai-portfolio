// Shared types for the public portfolio chat agent. The agent is a bounded
// Q&A assistant over approved public knowledge only — no tools, no browsing,
// no private data. See AI_PORTFOLIO_AGENT_PLAN.md for the product contract.

import type { AppLocale } from '@/lib/i18n/config';

export type AgentLocale = AppLocale;

/** Response-shape hints baked into a single system prompt (no server-side
 * classification step in v1 — see plan §User Modes). */
export type PortfolioAgentMode = 'general' | 'recruiter' | 'client';

export interface PortfolioChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PortfolioChatRequest {
  messages: PortfolioChatMessage[];
  locale: AgentLocale;
}

export type KnowledgeCategory =
  | 'profile'
  | 'stack'
  | 'projects'
  | 'contact'
  | 'boundaries';

export interface KnowledgeChunk {
  id: string;
  title: string;
  lang: AgentLocale;
  category: KnowledgeCategory;
  tags: string[];
  content: string;
  url?: string;
  /** Every chunk in this file is public by construction; the flag exists so a
   * future admin-managed source can be filtered the same way. */
  public: true;
}

export interface RetrievedContext {
  chunks: KnowledgeChunk[];
  sourceIds: string[];
  confidence: 'low' | 'medium' | 'high';
  /** Heuristic: very long user message ⇒ probably a pasted job description. */
  likelyJobDescription: boolean;
}
