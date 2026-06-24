// Factory for a blank QuoteDoc. Isomorphic-safe: only touches Date and crypto.
// The caller passes in a freshly allocated quote number (server-side via
// allocateQuoteNumber), so this file stays free of any persistence concerns.

import type { QuoteDoc } from './types';

export function createBlankQuote({ number }: { number: string }): QuoteDoc {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    number,
    status: 'draft',
    language: 'en',
    currency: 'ILS',
    clientId: null,
    projectTitle: '',
    projectDescription: '',
    validUntil: '',
    terms: '',
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      taxId: '',
      address: '',
    },
    items: [
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPct: 0,
        vatApplies: true,
      },
    ],
    vatRate: 18,
    createdAt: now,
    updatedAt: now,
  };
}
