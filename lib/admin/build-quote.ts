import 'server-only';
// Shared create/patch workflow for quotes — reused by the HTTP routes and the
// upcoming MCP create_quote tool so the business logic never lives in two places.

import { randomUUID } from 'node:crypto';
import { allocateQuoteNumber, upsertQuote } from './db/queries';
import { createBlankQuote } from './new-quote';
import type { QuoteDoc, LineItem } from './types';
import type { CreateQuoteInput, PatchQuoteInput } from '@/app/api/admin/v1/_lib/schemas';

// ---- Internal helper --------------------------------------------------------

/** Coerce a zLineItemInput (id optional) into a full LineItem with a guaranteed id. */
function toLineItem(raw: CreateQuoteInput['items'][number]): LineItem {
  return {
    id: raw.id ?? randomUUID(),
    description: raw.description,
    quantity: raw.quantity,
    unitPrice: raw.unitPrice,
    discountPct: raw.discountPct,
    vatApplies: raw.vatApplies,
  };
}

// ---- Public API -------------------------------------------------------------

/**
 * Allocate a quote number, merge `input` onto a blank doc, and persist it.
 * Owns the create path for both the HTTP POST route and the future MCP tool.
 */
export async function buildAndCreateQuote(
  owner: string,
  input: CreateQuoteInput,
): Promise<QuoteDoc> {
  const year = new Date().getFullYear();
  const number = await allocateQuoteNumber(owner, year);
  const base = createBlankQuote({ number });

  const doc: QuoteDoc = {
    // Identity and timestamps come from the blank quote — never overridden.
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    // Auto-allocated number.
    number,
    // Currency is always ILS for this phase.
    currency: 'ILS',
    // Optional link to the source directory client; null for ad-hoc quotes.
    clientId: input.clientId ?? null,
    // Caller-supplied fields (with schema defaults already applied by Zod).
    client: {
      name: input.client.name,
      company: input.client.company,
      email: input.client.email,
      phone: input.client.phone,
      taxId: input.client.taxId,
      address: input.client.address,
    },
    items: input.items.length > 0 ? input.items.map(toLineItem) : base.items,
    language: input.language,
    projectTitle: input.projectTitle,
    projectDescription: input.projectDescription,
    validUntil: input.validUntil,
    terms: input.terms,
    vatRate: input.vatRate,
    status: input.status,
  };

  return upsertQuote(owner, doc);
}

/**
 * Overlay `patch` onto `existing` and return the updated doc. Pure function —
 * no DB access. The caller is responsible for fetching the existing doc and
 * persisting the result via upsertQuote().
 */
export function applyQuotePatch(existing: QuoteDoc, patch: PatchQuoteInput): QuoteDoc {
  const doc: QuoteDoc = { ...existing };

  // Scalar fields — only overwrite when the patch key is present.
  if (patch.clientId !== undefined) doc.clientId = patch.clientId ?? null;
  if (patch.number !== undefined) doc.number = patch.number;
  if (patch.language !== undefined) doc.language = patch.language;
  if (patch.projectTitle !== undefined) doc.projectTitle = patch.projectTitle;
  if (patch.projectDescription !== undefined) doc.projectDescription = patch.projectDescription;
  if (patch.validUntil !== undefined) doc.validUntil = patch.validUntil;
  if (patch.terms !== undefined) doc.terms = patch.terms;
  if (patch.vatRate !== undefined) doc.vatRate = patch.vatRate;
  if (patch.status !== undefined) doc.status = patch.status;

  // Client — merge at the sub-object level if provided.
  if (patch.client !== undefined) {
    doc.client = {
      name: patch.client.name ?? existing.client.name,
      company: patch.client.company ?? existing.client.company,
      email: patch.client.email ?? existing.client.email,
      phone: patch.client.phone ?? existing.client.phone,
      taxId: patch.client.taxId ?? existing.client.taxId,
      address: patch.client.address ?? existing.client.address,
    };
  }

  // Items — replace the array in full when provided; ids filled in as needed.
  if (patch.items !== undefined) {
    doc.items = patch.items.map(toLineItem);
  }

  return doc;
}
