// Quote-number generation: NH-YYYY-NNNN (e.g. NH-2026-0001). The running
// counter is persisted per user in localStorage; the field stays editable in
// the builder, so this only provides a sensible default for new quotes.

const COUNTER_PREFIX = 'nehorai:admin:quoteseq:';

function counterKey(email: string): string {
  return `${COUNTER_PREFIX}${email.toLowerCase()}`;
}

export function formatQuoteNumber(year: number, seq: number): string {
  return `NH-${year}-${String(seq).padStart(4, '0')}`;
}

/**
 * Returns the next quote number for the given user and advances the stored
 * counter. Resets the sequence at the start of each calendar year.
 * Client-only (touches localStorage); guard for SSR by callers.
 */
export function nextQuoteNumber(email: string, now: Date = new Date()): string {
  const year = now.getFullYear();
  let seq = 1;
  try {
    const raw = window.localStorage.getItem(counterKey(email));
    if (raw) {
      const parsed = JSON.parse(raw) as { year: number; seq: number };
      seq = parsed.year === year ? parsed.seq + 1 : 1;
    }
    window.localStorage.setItem(counterKey(email), JSON.stringify({ year, seq }));
  } catch {
    // Storage unavailable — fall back to a time-based suffix so numbers stay unique.
    seq = Number(String(now.getTime()).slice(-4));
  }
  return formatQuoteNumber(year, seq);
}
