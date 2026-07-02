// Deterministic local retrieval — no embeddings by design (see plan §Retrieval
// Strategy). The knowledge base is ~10 chunks per locale, so an auditable
// keyword scorer is safer and testable against exact source ids.
//
// NOTE: intentionally NOT `import 'server-only'` — the offline eval runner
// (scripts/eval-agent-retrieval.ts) imports this under plain tsx.

import { getKnowledge } from './knowledge';
import type { AgentLocale, KnowledgeChunk, RetrievedContext } from './types';

/** Messages longer than this are probably a pasted job description. */
const JD_LENGTH_THRESHOLD = 600;

const MAX_CHUNKS = 6;

// Function words that would otherwise produce noise matches ("what is the...").
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'his', 'her', 'can', 'you', 'your', 'what',
  'who', 'how', 'does', 'did', 'are', 'was', 'were', 'have', 'has', 'about',
  'tell', 'show', 'that', 'this', 'more', 'like', 'is', 'be', 'been', 'being',
  'will', 'would', 'should', 'could', 'may', 'might', 'must', 'it', 'its',
  'of', 'to', 'in', 'on', 'at', 'by', 'as', 'or', 'so', 'do', 'we', 'he',
  'מה', 'איך', 'מי', 'של', 'עם', 'זה', 'על', 'את', 'יש', 'אין', 'הוא', 'היא',
  'אני', 'לי', 'לו', 'גם', 'או', 'אם', 'כל', 'ספר', 'עוד', 'האם', 'אותו',
]);

function tokenize(text: string): string[] {
  return text
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}.]+/u)
    // '.' is kept inside tokens for names like next.js — but strip it from the
    // edges so a sentence-final period ("...knows Docker.") still matches.
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[], query: string): number {
  let score = 0;

  const title = chunk.title.toLocaleLowerCase();
  if (title.length > 2 && query.includes(title)) score += 6;

  for (const tag of chunk.tags) {
    if (tag.length > 2 && query.includes(tag)) score += 3;
  }

  const contentTokens = new Set(tokenize(`${chunk.title} ${chunk.content}`));
  for (const token of queryTokens) {
    if (contentTokens.has(token)) score += 1;
  }

  return score;
}

/**
 * Rank approved chunks for the latest user message. Recruiter/JD-style input
 * (very long message) widens retrieval to the full profile + stack + projects
 * so the model can assess fit; otherwise the top-scored chunks win. The
 * boundaries chunk is always included — it is the policy the model cites when
 * a question is out of scope.
 */
export function retrieve(userMessage: string, locale: AgentLocale): RetrievedContext {
  const knowledge = getKnowledge(locale);
  const query = userMessage.toLocaleLowerCase();
  const queryTokens = tokenize(userMessage);
  const likelyJobDescription = userMessage.length >= JD_LENGTH_THRESHOLD;

  const boundaries = knowledge.filter((chunk) => chunk.category === 'boundaries');

  let selected: KnowledgeChunk[];
  let confidence: RetrievedContext['confidence'];

  if (likelyJobDescription) {
    // Fit assessment needs the whole public picture, not keyword matches.
    selected = knowledge.filter((chunk) => chunk.category !== 'boundaries');
    confidence = 'high';
  } else {
    const ranked = knowledge
      .filter((chunk) => chunk.category !== 'boundaries')
      .map((chunk) => ({ chunk, score: scoreChunk(chunk, queryTokens, query) }))
      .sort((a, b) => b.score - a.score);

    // Greedy pick with a per-category cap on projects — the broad 'project(s)'
    // tag matches ten chunks and would otherwise crowd every other category
    // out of the window.
    const PROJECT_CAP = 4;
    const matched: typeof ranked = [];
    let projectCount = 0;
    for (const entry of ranked) {
      if (entry.score <= 0 || matched.length >= MAX_CHUNKS) break;
      if (entry.chunk.category === 'projects') {
        if (projectCount >= PROJECT_CAP) continue;
        projectCount += 1;
      }
      matched.push(entry);
    }

    if (matched.length === 0) {
      // No signal — hand the model the profile + contact so it can redirect.
      selected = knowledge.filter(
        (chunk) => chunk.category === 'profile' || chunk.category === 'contact',
      );
      confidence = 'low';
    } else {
      selected = matched.map((entry) => entry.chunk);
      confidence = matched[0].score >= 4 ? 'high' : 'medium';
    }
  }

  const chunks = [...selected, ...boundaries];
  return {
    chunks,
    sourceIds: chunks.map((chunk) => chunk.id),
    confidence,
    likelyJobDescription,
  };
}
