// Quote-number formatting: NH-YYYY-NNNN (e.g. NH-2026-0001). The running counter
// is now allocated server-side and atomically in the database
// (lib/admin/db/queries.ts: allocateQuoteNumber); this file only holds the pure
// format helper, shared by the DAL and any display code.

export function formatQuoteNumber(year: number, seq: number): string {
  return `NH-${year}-${String(seq).padStart(4, '0')}`;
}
