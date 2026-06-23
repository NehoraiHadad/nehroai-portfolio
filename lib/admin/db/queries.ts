import 'server-only';
import { and, eq, desc, sql } from 'drizzle-orm';
import type { BrandProfile, QuoteDoc, QuoteLanguage } from '../types';
import { defaultBrandProfile } from '../brand';
import { formatQuoteNumber } from '../quote-number';
import { getDb } from './client';
import { quotes, brandProfiles, quoteCounters } from './schema';
import { rowToQuoteDoc, quoteDocToColumns } from './mappers';

// Server-only Data Access Layer. Every function is scoped to `owner` (the
// logged-in session email) — callers pass the value from requireAdmin(), and
// every query filters on owner_email, so one admin can never read or mutate
// another's data. This is the authoritative persistence boundary; the Server
// Actions that call these must themselves re-check auth (see *-actions.ts).

// --- Quotes -----------------------------------------------------------------

export async function listQuotes(owner: string): Promise<QuoteDoc[]> {
  const rows = await getDb()
    .select()
    .from(quotes)
    .where(eq(quotes.ownerEmail, owner))
    .orderBy(desc(quotes.updatedAt));
  return rows.map(rowToQuoteDoc);
}

export async function getQuote(owner: string, id: string): Promise<QuoteDoc | null> {
  const rows = await getDb()
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.ownerEmail, owner)))
    .limit(1);
  return rows[0] ? rowToQuoteDoc(rows[0]) : null;
}

/**
 * Insert or update a quote for `owner`. Tries an owner-scoped update first; if
 * no row matched (new quote, or an id owned by someone else), inserts a fresh
 * row owned by `owner`. Cross-owner overwrite is impossible because the update
 * is filtered on owner_email and the insert always stamps the caller's owner.
 */
export async function upsertQuote(owner: string, doc: QuoteDoc): Promise<QuoteDoc> {
  const db = getDb();
  const cols = quoteDocToColumns(doc);

  const updated = await db
    .update(quotes)
    .set({ ...cols, updatedAt: new Date() })
    .where(and(eq(quotes.id, doc.id), eq(quotes.ownerEmail, owner)))
    .returning();
  if (updated[0]) return rowToQuoteDoc(updated[0]);

  const inserted = await db
    .insert(quotes)
    .values({ id: doc.id, ownerEmail: owner, ...cols })
    .returning();
  return rowToQuoteDoc(inserted[0]);
}

export async function deleteQuote(owner: string, id: string): Promise<void> {
  await getDb()
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.ownerEmail, owner)));
}

// --- Brand profile ----------------------------------------------------------

export async function getBrand(
  owner: string,
  language: QuoteLanguage,
): Promise<BrandProfile> {
  const rows = await getDb()
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.ownerEmail, owner))
    .limit(1);
  const row = rows[0];
  if (!row) return defaultBrandProfile(language);
  return {
    name: row.name,
    tagline: row.tagline,
    email: row.email,
    phone: row.phone,
    address: row.address,
    logoUrl: row.logoUrl,
  };
}

export async function saveBrand(owner: string, profile: BrandProfile): Promise<void> {
  await getDb()
    .insert(brandProfiles)
    .values({ ownerEmail: owner, ...profile, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: brandProfiles.ownerEmail,
      set: { ...profile, updatedAt: new Date() },
    });
}

// --- Quote number allocation ------------------------------------------------

/**
 * Atomically allocate the next NH-YYYY-NNNN number for `owner` in `year`.
 * INSERT ... ON CONFLICT DO UPDATE increments the per-owner/per-year counter in
 * a single statement, so concurrent allocations never collide.
 */
export async function allocateQuoteNumber(owner: string, year: number): Promise<string> {
  const [row] = await getDb()
    .insert(quoteCounters)
    .values({ ownerEmail: owner, year, seq: 1 })
    .onConflictDoUpdate({
      target: [quoteCounters.ownerEmail, quoteCounters.year],
      set: { seq: sql`${quoteCounters.seq} + 1` },
    })
    .returning({ seq: quoteCounters.seq });
  return formatQuoteNumber(year, row.seq);
}
