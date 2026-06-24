// Zod schemas for the untrusted-input boundary — used by agents via HTTP and
// (later) MCP, not by typed React forms. Mirror lib/admin/types.ts exactly so
// the validated output can be assigned to the TypeScript types without casts.
// Export everything; the OpenAPI builder and the MCP layer import from here.

import { z } from 'zod';

// ---- Enums ------------------------------------------------------------------

export const zQuoteStatus = z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']);
export const zQuoteLanguage = z.enum(['he', 'en']);

// ---- Sub-objects ------------------------------------------------------------

/** Client contact block. name is required; all other fields default to ''. */
export const zClientInput = z.object({
  name: z.string().min(1),
  company: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  taxId: z.string().default(''),
  address: z.string().default(''),
});

/** One line item on a quote. id is optional — the server assigns one when absent. */
export const zLineItemInput = z.object({
  id: z.string().optional(),
  description: z.string().default(''),
  quantity: z.number().default(1),
  unitPrice: z.number().default(0),
  discountPct: z.number().min(0).max(100).default(0),
  vatApplies: z.boolean().default(true),
});

// ---- Quote inputs -----------------------------------------------------------

/**
 * Full creation payload. currency is always 'ILS' and is NOT an input field —
 * the server stamps it. vatRate defaults to Israel's standard 18%.
 */
export const zCreateQuoteInput = z.object({
  client: zClientInput,
  items: z.array(zLineItemInput).default([]),
  language: zQuoteLanguage.default('en'),
  projectTitle: z.string().default(''),
  projectDescription: z.string().default(''),
  validUntil: z.string().default(''),
  terms: z.string().default(''),
  vatRate: z.number().min(0).default(18),
  status: zQuoteStatus.default('draft'),
});

/**
 * PATCH payload — every field is optional, no defaults (callers only send what
 * they want to change). `number` may be patched too (it's the human-readable
 * NH-YYYY-NNNN string; auto-allocated on create but editable afterward).
 */
export const zPatchQuoteInput = zCreateQuoteInput
  .partial()
  .extend({ number: z.string().optional() });

// ---- Brand input ------------------------------------------------------------

/** PUT /brand — only provided fields are merged onto the stored profile. */
export const zBrandInput = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
});

// ---- Inferred TypeScript types (consumed by build-quote.ts) ----------------

export type CreateQuoteInput = z.infer<typeof zCreateQuoteInput>;
export type PatchQuoteInput = z.infer<typeof zPatchQuoteInput>;
export type BrandInput = z.infer<typeof zBrandInput>;
