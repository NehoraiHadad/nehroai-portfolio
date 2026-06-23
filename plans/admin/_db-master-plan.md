# Admin — Persistence migration: localStorage → Neon Postgres + Drizzle

**Status:** Phase 2 (Master Plan). Awaiting Gate approval. No code until approved.
**Goal:** Move quote/brand persistence from per-browser `localStorage` to a real
server database (Neon Postgres via Drizzle ORM), so quotes survive across devices
and browsers and become the foundation for the future features (email, approval
links, client management).

---

## Why Neon + Drizzle (recap of the decision)
- Data is relational (owner → quotes → line items) and low-volume → **Postgres**.
- **Neon** integrates natively with Vercel (Marketplace), serverless-friendly,
  generous free tier. Compute runs on Vercel, so a Vercel-native Postgres beats
  Cloudflare D1 (which shines only when compute is on Workers).
- **Drizzle** ORM: type-safe, lightweight, clean migrations, ideal for Next 16 /
  serverless. Preferred over Prisma for a small/medium app.
- Driver: `@neondatabase/serverless` + `drizzle-orm/neon-http` (HTTP, no pool).

---

## Current state (Discovery — verified by reading the code)
Persistence today is **100% client-side localStorage**, keyed by logged-in email:
- `lib/admin/quotes-store.ts` — quotes CRUD + `useQuotes()` reactive hook (client).
- `lib/admin/brand.ts` — brand profile load/save (client).
- `lib/admin/quote-number.ts` — per-user running counter (client).

UI components are `'use client'` and read storage synchronously:
- `QuoteBuilder.tsx` — `useEffect` loads via `getQuote`/`createBlankQuote`/`nextQuoteNumber`;
  saves via `upsertQuote` on button click; routes to preview.
- `QuotesListContent.tsx` — `useQuotes(email)` reactive list.
- `QuotePreviewClient.tsx` — `useEffect` loads quote + brand.
- `SettingsForm.tsx` — loads/saves brand.

Server pages already `await requireAdmin()` and pass `email` as a prop, so the
auth + owner identity is already available server-side. **Pure** helpers
(`computeTotals`, `formatMoney`, `formatQuoteNumber`) stay unchanged and shared.

---

## Target architecture (verified vs Next 16 docs)
Docs read: `07-mutating-data.md` (Server Actions must call `auth()` themselves —
they're reachable by direct POST; `revalidatePath`/`redirect` after mutation),
`environment-variables.md` (`@next/env` to load `DATABASE_URL` in the Drizzle
config — the documented ORM pattern), plus the existing `'server-only'` DAL in
`lib/admin/auth.ts`.

- **Server DAL** (`lib/admin/db/`, all `'server-only'`, all async, owner-scoped).
- **Server Actions** for every mutation, each calling `requireAdmin()` **first**
  (auth inside each action — per the docs' security warning), then writing, then
  `revalidatePath`.
- **Server Components fetch, client islands render**: pages read from the DB and
  pass initial data as props. Client forms keep local edit state but (a) seed from
  props instead of `useEffect`+localStorage, and (b) persist via a Server Action
  instead of `upsertQuote`.
- Reactivity: drop `useSyncExternalStore`; rely on server fetch + `revalidatePath`
  / `router.refresh()` after a save/delete.

`QuoteDoc` (the shape in `lib/admin/types.ts`) stays **identical** end-to-end, so
the builder, totals, list, and preview keep working on the same object. A thin
row↔doc mapper bridges DB rows and `QuoteDoc`.

---

## Schema (3 tables, owner-scoped by session email)
Deliberate **hybrid**: scalar columns for the queryable fields, JSONB for the
embedded snapshots (`client`, `items`). Rationale: a quote is a self-contained
document — the client's details and line items are a *snapshot at issue time*
that must not retroactively change, and the UI already serializes them as one
object. A normalized `clients` table is a **future** feature (client management),
not this migration.

```
quotes
  id              uuid  pk
  owner_email     text  not null            -- session email; every query filters on this
  number          text  not null            -- NH-YYYY-NNNN (editable)
  status          text  not null            -- QuoteStatus
  language        text  not null            -- 'he' | 'en'
  currency        text  not null            -- 'ILS'
  project_title   text  not null default ''
  project_desc    text  not null default ''
  valid_until     text  not null default '' -- yyyy-mm-dd (kept as text, matches QuoteDoc)
  terms           text  not null default ''
  vat_rate        numeric not null          -- e.g. 18
  client          jsonb not null            -- Client snapshot
  items           jsonb not null            -- LineItem[]
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()
  index (owner_email, updated_at desc)

brand_profiles
  owner_email     text  pk                  -- one profile per owner
  name, tagline, email, phone, address, logo_url   text not null default ''
  updated_at      timestamptz not null default now()

quote_counters
  owner_email     text  not null
  year            integer not null
  seq             integer not null default 0
  pk (owner_email, year)                    -- atomic NH-YYYY-NNNN allocation
```

Owner isolation: every query is `where owner_email = <session email>`. Same
guarantee as today's per-email localStorage key, now enforced server-side.

---

## Env / prerequisites (one manual step — your gate, like the Google client was)
1. **You create the Neon project** via Vercel → Storage → Neon (Marketplace),
   attached to the `nehorai-portfolio` project. Vercel injects `DATABASE_URL`
   (and friends) into the project env automatically.
2. For local dev, copy the Neon `DATABASE_URL` into `.env.local`.
3. I run `drizzle-kit push` (or generate + migrate) to create the 3 tables in
   Neon. `drizzle.config.ts` loads env via `@next/env` (documented pattern).
4. `.env.example` updated (names only): `DATABASE_URL`.

> Until `DATABASE_URL` exists I cannot push the schema or smoke-test against the
> DB. That's the single blocking handoff — everything else I build and verify.

---

## Dependencies (pnpm — dual lockfiles, commit both, per project rule)
- runtime: `drizzle-orm`, `@neondatabase/serverless`
- dev: `drizzle-kit`, `@next/env`

---

## Existing local drafts
Current quotes live only in your browser's localStorage (test data). Default:
**start fresh** on the DB. Optional nicety (low priority): a one-time "import my
local drafts" button that reads localStorage and calls a seed action. Will
include only if you want it — otherwise dropped to keep the migration tight.

---

## Implementation chips (parallel Sonnet sub-agents where independent)

### Chip A — DB foundation (lands first; blocks B & C)
`drizzle.config.ts` + `lib/admin/db/env.ts` (`@next/env`); `lib/admin/db/client.ts`
(neon-http + drizzle); `lib/admin/db/schema.ts` (3 tables); `lib/admin/db/queries.ts`
(`'server-only'` DAL: `listQuotes`, `getQuote`, `upsertQuote`, `deleteQuote`,
`getBrand`, `saveBrand`, `allocateQuoteNumber` — all owner-scoped, async); row↔doc
mappers; deps installed; schema pushed to Neon; `.env.example`. **I run/verify this.**

### Chip B — Quotes wired to DB (after A)
`app/(admin)/_components/quote-actions.ts` (`'use server'`: `saveQuoteAction`,
`deleteQuoteAction`, each `requireAdmin()` + `revalidatePath`); refactor
`quotes/new` + `quotes/[id]` pages to fetch server-side (initial doc + next number)
and pass as props; refactor `QuoteBuilder` to take `initialQuote`/`isNew` props and
save via the action (remove localStorage import + `useEffect` hydration); make
`QuotesListContent` presentational (quotes from server prop, drop `useQuotes`);
`quotes/[id]/preview` server-fetches the quote.

### Chip C — Brand + settings wired to DB (after A, parallel with B)
`brand-actions.ts` (`'use server'`: `saveBrandAction` + `requireAdmin`); settings
page server-fetches the brand and passes to `SettingsForm` (seed from prop, save
via action); preview fetches brand server-side. Remove `lib/admin/brand.ts` client
storage funcs (keep `defaultBrandProfile` pure helper).

B and C depend only on A and touch disjoint files (quotes vs brand/settings) → run
in parallel after A lands.

### Cleanup (final)
Delete the now-dead client storage modules (`quotes-store.ts`, the localStorage
parts of `brand.ts`, `quote-number.ts`'s counter). Keep pure helpers
(`formatQuoteNumber`, `defaultBrandProfile`, `createBlankQuote`).

---

## Gates per chip
`pnpm lint` + `pnpm build` (typegen + typecheck) pass; dev smoke against the real
Neon DB: create a quote → reload → it persists; edit → persists; delete → gone;
list reflects DB; brand saved server-side shows on preview; RTL Hebrew + LTR;
owner isolation (a second allowlisted email sees its own quotes only). Results
appended to `plans/admin/_status.md`. A failing gate → not merged, reason logged.

---

## Risks & mitigations
- **`DATABASE_URL` is a hard prerequisite** → documented as your one manual step;
  I stage all code and push the schema the moment it's available.
- **Every save is now a network round-trip** (no offline/instant write) →
  acceptable for an admin tool; add pending state via `useActionState`/`useTransition`.
- **Drizzle config needs env at CLI time** → `@next/env` in `drizzle.config.ts`
  (documented). 
- **Removing reactive localStorage** (`useSyncExternalStore`) → replaced by server
  fetch + `revalidatePath`; verified by the persistence smoke.
- **Dual lockfiles / pnpm store quirks** (hit before) → `pnpm add`, commit both
  lockfiles, sync `package-lock.json`.
- Implementation agents must first read Next 16 `05-server-and-client-components.md`,
  `06-fetching-data.md`, `02-guides/data-security.md` (per AGENTS.md).
