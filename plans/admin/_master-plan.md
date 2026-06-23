# Admin — Master Plan (mirror)

Canonical, in-repo copy of the approved implementation plan. Full rationale,
risks, DNS/OAuth steps, and the Next-16 docs-verification log live in the
session plan; this is the durable reference for the team and the sub-agent chips.

## Scope (this phase — implement now)
1. Admin subdomain routing (`admin.nehoraihadad.com`) — **done** (Foundation)
2. Google login + `ADMIN_EMAILS` allowlist — **done** (Foundation)
3. Protected admin shell (sidebar, topbar, dashboard/clients/quotes/settings) — **done** (Foundation)
4. Quote creation UI — **Chip #2** (Quote Builder, Sonnet sub-agent)
5. Branded quote preview UI — **Chip #3** (Quote Preview, Sonnet sub-agent)
6. Future markers — seeded (Settings "Coming soon" + `lib/admin/FUTURE.md`)

Everything else (DB, PDF-via-library, email, public approval link, SUMIT,
client portal, audit log, file storage) → Future.

## Architecture (as built in Foundation)
- **Routing**: `proxy.ts` (Next 16's renamed middleware) host-routes. On
  `admin.*` the admin app is self-contained (bare `/` → dashboard, optimistic
  cookie gate → `/admin/login`). On the prod main host `/admin/*` bounces to `/`.
  On `localhost` the admin app is reachable at `/admin/*` for dev, same gate.
- **Auth**: Auth.js v5 (`next-auth@beta`) Google provider in `auth.ts`.
  Allowlist enforced in the `signIn` callback **and** in `requireAdmin()`
  (`lib/admin/auth.ts`, the authoritative per-request DAL). Handler at
  `app/api/auth/[...nextauth]/route.ts`.
- **i18n**: admin locale = cookie `admin_lang` (not a URL segment), read in
  `app/(admin)/layout.tsx`, flipped by `AdminLangToggle` via a server action.
  New `admin` namespace in the dictionaries (en + he).
- **Theme**: reuses `ThemeScript` + `ThemeToggle` verbatim.
- **Structure**: route group `app/(admin)/`; protected pages under
  `app/(admin)/admin/(shell)/`; public login at `app/(admin)/admin/login/`.
- **Shared contract** (consumed by chips 2 & 3): `lib/admin/types.ts`
  (`QuoteDoc` etc.), `lib/admin/totals.ts` (`computeTotals`, `formatMoney`),
  `lib/admin/quotes-store.ts` (per-user localStorage + `useQuotes`),
  `lib/admin/brand.ts`, `lib/admin/quote-number.ts`. Admin form CSS in
  `app/globals.css` (`.admin-input/-label/-field/-select/-table`, `@media print`).

## Chips
- **#1 Foundation** — me, on `main`. Status: see `_status.md`.
- **#2 Quote Builder UI** — Sonnet sub-agent. Replaces the placeholder
  `app/(admin)/admin/(shell)/quotes/new/page.tsx` (+ `quotes/[id]`) with the
  real builder. Depends only on the Foundation contract.
- **#3 Branded Quote Preview** — Sonnet sub-agent. `QuotePreview` + print route.
  Parallel with #2 (both depend only on the contract).

## Env vars (see `.env.example`)
`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`,
`AUTH_URL`, `AUTH_TRUST_HOST`.

## DNS / Vercel / Google (for Nehorai)
1. Vercel → Project → Settings → Domains → add `admin.nehoraihadad.com` (same project).
2. Registrar: add the CNAME Vercel shows (`admin` → `cname.vercel-dns.com`).
3. GCP → Credentials → OAuth client (Web). Redirect URIs:
   `https://admin.nehoraihadad.com/api/auth/callback/google` and
   `http://localhost:3000/api/auth/callback/google`.
4. Vercel env: `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID/SECRET`,
   `ADMIN_EMAILS`, `AUTH_URL`, `AUTH_TRUST_HOST=true`.
