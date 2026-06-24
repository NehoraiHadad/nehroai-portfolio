import type { QuoteDoc } from '../types';
import type { quotes } from './schema';

// Bridges a `quotes` DB row and the `QuoteDoc` shape the UI works with, so the
// builder, totals, list, and preview keep operating on the unchanged document.

type QuoteRow = typeof quotes.$inferSelect;

export function rowToQuoteDoc(row: QuoteRow): QuoteDoc {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    language: row.language,
    currency: row.currency,
    clientId: row.clientId ?? null,
    shareToken: row.shareToken ?? null,
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
    rejectedAt: row.rejectedAt ? row.rejectedAt.toISOString() : null,
    projectTitle: row.projectTitle,
    projectDescription: row.projectDescription,
    validUntil: row.validUntil,
    terms: row.terms,
    client: row.client,
    items: row.items,
    vatRate: row.vatRate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * The persistable columns derived from a QuoteDoc (owner + timestamps are set by
 * the DAL, not the caller, so they're excluded here).
 */
export function quoteDocToColumns(doc: QuoteDoc) {
  return {
    number: doc.number,
    status: doc.status,
    language: doc.language,
    currency: doc.currency,
    clientId: doc.clientId ?? null,
    shareToken: doc.shareToken ?? null,
    sentAt: doc.sentAt ? new Date(doc.sentAt) : null,
    approvedAt: doc.approvedAt ? new Date(doc.approvedAt) : null,
    rejectedAt: doc.rejectedAt ? new Date(doc.rejectedAt) : null,
    projectTitle: doc.projectTitle,
    projectDescription: doc.projectDescription,
    validUntil: doc.validUntil,
    terms: doc.terms,
    client: doc.client,
    items: doc.items,
    vatRate: doc.vatRate,
  };
}
