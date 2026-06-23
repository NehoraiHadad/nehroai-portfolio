import type { LineItem, QuoteTotals } from './types';

// Pure totals calculation, shared by the builder (live recompute) and the
// preview (render). No rounding surprises: each line's net is computed, VAT is
// summed only over VAT-eligible lines, and the grand total is the taxable base
// plus VAT plus any non-VAT lines.

function lineNet(item: LineItem): number {
  const gross = (item.quantity || 0) * (item.unitPrice || 0);
  const discount = gross * ((item.discountPct || 0) / 100);
  return gross - discount;
}

export function computeTotals(items: LineItem[], vatRate: number): QuoteTotals {
  let subtotal = 0; // gross, before discounts
  let discountTotal = 0;
  let taxableBase = 0; // net of VAT-eligible lines
  let nonTaxableNet = 0; // net of lines without VAT

  for (const item of items) {
    const gross = (item.quantity || 0) * (item.unitPrice || 0);
    const net = lineNet(item);
    subtotal += gross;
    discountTotal += gross - net;
    if (item.vatApplies) {
      taxableBase += net;
    } else {
      nonTaxableNet += net;
    }
  }

  const vatTotal = taxableBase * ((vatRate || 0) / 100);
  const total = taxableBase + nonTaxableNet + vatTotal;

  return {
    subtotal: round2(subtotal),
    discountTotal: round2(discountTotal),
    taxableBase: round2(taxableBase + nonTaxableNet),
    vatTotal: round2(vatTotal),
    total: round2(total),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Currency formatting — ILS (₪) for this phase. Locale drives digit grouping
// and symbol placement (RTL-aware for Hebrew quotes).
export function formatMoney(amount: number, language: 'he' | 'en'): string {
  const locale = language === 'he' ? 'he-IL' : 'en-IL';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
