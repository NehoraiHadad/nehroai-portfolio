import 'server-only';
import { randomBytes, createHash } from 'node:crypto';
import { and, eq, desc, sql, isNull, or, gt } from 'drizzle-orm';
import type { BrandProfile, ClientRecord, QuoteDoc, QuoteLanguage } from '../types';
import type { ClientRecordInput, ClientRecordPatch } from '@/app/api/admin/v1/_lib/schemas';
import { defaultBrandProfile } from '../brand';
import { formatQuoteNumber } from '../quote-number';
import { getDb } from './client';
import { quotes, brandProfiles, quoteCounters, apiTokens, clients } from './schema';
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

// --- API tokens (agent auth) ------------------------------------------------

// Exported for agent-auth.ts (hashes an incoming bearer token for DB lookup).
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Internal helper — never exported.
function generateToken(): { token: string; tokenHash: string; prefix: string } {
  const token = 'nh_' + randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const prefix = token.slice(0, 11);
  return { token, tokenHash, prefix };
}

/** Public shape returned by listApiTokens. tokenHash is intentionally omitted. */
export interface ApiTokenRow {
  id: string;
  label: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
}

/**
 * Create a new API token for `owner`. The plaintext token is returned exactly
 * once here — callers must surface it to the user immediately; it cannot be
 * recovered later (only the hash is stored).
 */
export async function createApiToken(
  owner: string,
  opts: { label?: string; expiresAt?: Date | null },
): Promise<{ id: string; token: string; prefix: string }> {
  const { token, tokenHash, prefix } = generateToken();
  const [row] = await getDb()
    .insert(apiTokens)
    .values({
      ownerEmail: owner,
      label: opts.label ?? '',
      tokenHash,
      prefix,
      expiresAt: opts.expiresAt ?? null,
    })
    .returning({ id: apiTokens.id });
  return { id: row.id, token, prefix };
}

/** List all tokens owned by `owner`, newest first. Never exposes tokenHash. */
export async function listApiTokens(owner: string): Promise<ApiTokenRow[]> {
  return getDb()
    .select({
      id: apiTokens.id,
      label: apiTokens.label,
      prefix: apiTokens.prefix,
      createdAt: apiTokens.createdAt,
      lastUsedAt: apiTokens.lastUsedAt,
      revokedAt: apiTokens.revokedAt,
      expiresAt: apiTokens.expiresAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.ownerEmail, owner))
    .orderBy(desc(apiTokens.createdAt));
}

/**
 * Owner-scoped revoke — one owner can never revoke another's token because
 * the UPDATE is filtered on both id AND ownerEmail.
 */
export async function revokeApiToken(owner: string, id: string): Promise<void> {
  await getDb()
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiTokens.id, id), eq(apiTokens.ownerEmail, owner)));
}

/**
 * Look up an active (non-revoked, non-expired) token by its SHA-256 hash.
 * Used by the bearer-token auth path; returns only the fields needed for
 * owner resolution and last-used tracking.
 */
export async function findActiveTokenByHash(
  hash: string,
): Promise<{ id: string; ownerEmail: string } | null> {
  const rows = await getDb()
    .select({ id: apiTokens.id, ownerEmail: apiTokens.ownerEmail })
    .from(apiTokens)
    .where(
      and(
        eq(apiTokens.tokenHash, hash),
        isNull(apiTokens.revokedAt),
        or(isNull(apiTokens.expiresAt), gt(apiTokens.expiresAt, new Date())),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Fire-and-forget last-used timestamp update; called after successful auth. */
export async function touchTokenLastUsed(id: string): Promise<void> {
  await getDb()
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, id));
}

// --- Clients (directory) ----------------------------------------------------
//
// The clients table is an address-book directory — the source for pre-populating
// quotes and for "all quotes by client" views. Every function is owner-scoped:
// callers pass the session email and all queries filter on owner_email, so one
// admin can never read or mutate another's directory entries.

/** Map a `clients` DB row to the `ClientRecord` shape the application works with. */
function rowToClient(row: typeof clients.$inferSelect): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    taxId: row.taxId,
    address: row.address,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** All directory clients for `owner`, ordered newest-updated first. */
export async function listClients(owner: string): Promise<ClientRecord[]> {
  const rows = await getDb()
    .select()
    .from(clients)
    .where(eq(clients.ownerEmail, owner))
    .orderBy(desc(clients.updatedAt));
  return rows.map(rowToClient);
}

/** Fetch a single directory client by id; null when not found or not owned. */
export async function getClient(owner: string, id: string): Promise<ClientRecord | null> {
  const rows = await getDb()
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerEmail, owner)))
    .limit(1);
  return rows[0] ? rowToClient(rows[0]) : null;
}

/**
 * Create a new directory client for `owner`. The DB generates the uuid and
 * both timestamps; the returned record reflects what was actually stored.
 */
export async function createClient(
  owner: string,
  input: ClientRecordInput,
): Promise<ClientRecord> {
  const [row] = await getDb()
    .insert(clients)
    .values({
      ownerEmail: owner,
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      taxId: input.taxId,
      address: input.address,
      notes: input.notes,
    })
    .returning();
  return rowToClient(row);
}

/**
 * Owner-scoped update — only provided patch fields are overwritten. Stamps
 * updatedAt unconditionally. Returns the updated record, or null if no row
 * matched (id not found, or owned by someone else).
 */
export async function updateClient(
  owner: string,
  id: string,
  patch: ClientRecordPatch,
): Promise<ClientRecord | null> {
  const updated = await getDb()
    .update(clients)
    .set({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.company !== undefined && { company: patch.company }),
      ...(patch.email !== undefined && { email: patch.email }),
      ...(patch.phone !== undefined && { phone: patch.phone }),
      ...(patch.taxId !== undefined && { taxId: patch.taxId }),
      ...(patch.address !== undefined && { address: patch.address }),
      ...(patch.notes !== undefined && { notes: patch.notes }),
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, id), eq(clients.ownerEmail, owner)))
    .returning();
  return updated[0] ? rowToClient(updated[0]) : null;
}

/**
 * Owner-scoped delete. The FK ON DELETE SET NULL on `quotes.client_id`
 * automatically unlinks any quotes that reference this client; no quotes are
 * deleted.
 */
export async function deleteClient(owner: string, id: string): Promise<void> {
  await getDb()
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerEmail, owner)));
}

/**
 * All quotes for `owner` that are linked to `clientId`, newest first.
 * Uses the `client_id` FK column — not the snapshot — so this returns only
 * quotes explicitly connected to the directory entry.
 */
export async function listQuotesByClient(
  owner: string,
  clientId: string,
): Promise<QuoteDoc[]> {
  const rows = await getDb()
    .select()
    .from(quotes)
    .where(and(eq(quotes.ownerEmail, owner), eq(quotes.clientId, clientId)))
    .orderBy(desc(quotes.updatedAt));
  return rows.map(rowToQuoteDoc);
}
