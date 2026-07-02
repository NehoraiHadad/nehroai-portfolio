// Offline eval runner for the portfolio agent's deterministic retriever.
//
// Usage:
//   pnpm eval:agent
//
// Asserts that retrieve(message, locale) selects the expected source ids for
// every case in lib/portfolio-agent/eval-cases.ts. No LLM calls, no network —
// safe to run anywhere (and cheap enough for CI later).

import { retrieve } from '../lib/portfolio-agent/retrieve';
import { EVAL_CASES } from '../lib/portfolio-agent/eval-cases';

let failures = 0;

for (const evalCase of EVAL_CASES) {
  const result = retrieve(evalCase.message, evalCase.locale);
  const got = new Set(result.sourceIds);

  const missing = evalCase.expectSourceIds.filter((id) => !got.has(id));
  const forbidden = (evalCase.forbidSourceIds ?? []).filter((id) => got.has(id));

  if (missing.length === 0 && forbidden.length === 0) {
    console.log(`  ok   ${evalCase.id}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${evalCase.id} [${evalCase.kind}/${evalCase.locale}]`);
    if (missing.length) console.error(`       missing:   ${missing.join(', ')}`);
    if (forbidden.length) console.error(`       forbidden: ${forbidden.join(', ')}`);
    console.error(`       got:       ${result.sourceIds.join(', ')} (confidence: ${result.confidence})`);
  }
}

console.log(`\n${EVAL_CASES.length - failures}/${EVAL_CASES.length} retrieval eval cases passed.`);
if (failures > 0) process.exit(1);
