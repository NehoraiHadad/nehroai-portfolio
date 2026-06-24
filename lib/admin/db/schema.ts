// Drizzle schema for the admin persistence layer (Neon Postgres). Replaces the
// per-browser localStorage stores. Owner isolation is enforced everywhere by
// filtering on `owner_email` (the logged-in session email) — the same partition
// the old localStorage keys used, now authoritative on the server.
//
// Design note (hybrid document model): scalar quote fields are real columns so
// they're queryable, while `client` and `items` are JSONB snapshots. A quote is
// a self-contained document — the client's details and line items are frozen at
// issue time and must not retroactively change — so embedding them as JSONB
// keeps the `QuoteDoc` shape identical end-to-end. The `clients` table is a
// separate address-book directory; `quotes.client_id` is a nullable FK back to
// that directory, but the snapshot in `client` jsonb remains authoritative.

import {
  pgTable,
  text,
  jsonb,
  integer,
  doublePrecision,
  timestamp,
  uuid,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import type {
  Client,
  LineItem,
  QuoteStatus,
  QuoteLanguage,
  Currency,
} from '../types';

export const quotes = pgTable(
  'quotes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerEmail: text('owner_email').notNull(),
    number: text('number').notNull(),
    status: text('status').$type<QuoteStatus>().notNull(),
    language: text('language').$type<QuoteLanguage>().notNull(),
    currency: text('currency').$type<Currency>().notNull(),
    projectTitle: text('project_title').notNull().default(''),
    projectDescription: text('project_desc').notNull().default(''),
    validUntil: text('valid_until').notNull().default(''),
    terms: text('terms').notNull().default(''),
    vatRate: doublePrecision('vat_rate').notNull(),
    client: jsonb('client').$type<Client>().notNull(),
    items: jsonb('items').$type<LineItem[]>().notNull(),
    // Nullable link to the source client directory entry; snapshot in `client`
    // jsonb stays authoritative. ON DELETE SET NULL auto-unlinks when a directory
    // client is deleted — it never cascades to delete the quote itself.
    clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('quotes_owner_updated_idx').on(t.ownerEmail, t.updatedAt)],
);

export const brandProfiles = pgTable('brand_profiles', {
  ownerEmail: text('owner_email').primaryKey(),
  name: text('name').notNull().default(''),
  tagline: text('tagline').notNull().default(''),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Per-owner, per-year running counter for NH-YYYY-NNNN allocation. Incremented
// atomically via INSERT ... ON CONFLICT DO UPDATE (see queries.allocateQuoteNumber).
export const quoteCounters = pgTable(
  'quote_counters',
  {
    ownerEmail: text('owner_email').notNull(),
    year: integer('year').notNull(),
    seq: integer('seq').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ownerEmail, t.year] })],
);

// Client directory — the address-book source used to pre-populate new quotes and
// anchor "all quotes for this client" queries. Distinct from the frozen per-quote
// `client` JSONB snapshot; editing a directory entry never mutates issued quotes.
export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerEmail: text('owner_email').notNull(),
    name: text('name').notNull(),
    company: text('company').notNull().default(''),
    email: text('email').notNull().default(''),
    phone: text('phone').notNull().default(''),
    taxId: text('tax_id').notNull().default(''),
    address: text('address').notNull().default(''),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('clients_owner_updated_idx').on(t.ownerEmail, t.updatedAt)],
);

// Hashed agent API tokens for non-interactive (machine/agent) auth. Owner-scoped
// like everything else — one admin can never see or revoke another's tokens. The
// plaintext token is generated once, returned once, and never stored. Only the
// SHA-256 hex digest (`token_hash`) lives here; `prefix` is the first ~11 chars
// kept for display ("nh_AbCd1234") so the UI can identify tokens without ever
// holding the secret.
export const apiTokens = pgTable(
  'api_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerEmail: text('owner_email').notNull(),
    label: text('label').notNull().default(''),
    tokenHash: text('token_hash').notNull(),
    prefix: text('prefix').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (t) => [
    index('api_tokens_hash_idx').on(t.tokenHash),
    index('api_tokens_owner_idx').on(t.ownerEmail),
  ],
);
