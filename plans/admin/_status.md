# Admin — Chip Status / Audit

## Chip #1 — Foundation — ✅ DONE (on `main`)

**Built**
- `proxy.ts` — host-based routing + optimistic auth gate (Next 16 proxy).
- `auth.ts` — Auth.js v5 Google provider + `ADMIN_EMAILS` allowlist (`signIn` callback).
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler.
- `lib/admin/auth.ts` — `requireAdmin()` / `getAdminUser()` DAL (authoritative).
- `app/(admin)/layout.tsx` — HTML root: `admin_lang` cookie → dictionary, theme, fonts, i18n.
- `app/(admin)/admin/(shell)/layout.tsx` — protected shell (`requireAdmin` + sidebar/topbar).
- Pages: dashboard, clients, quotes (list), settings (+ brand form, Coming-soon), login (public).
- Placeholders: `quotes/new`, `quotes/[id]` (Chip #2/#3 replace).
- Components: `AdminShell`, `AdminNavLinks`, `AdminLangToggle`, `LogoutButton`,
  `DashboardContent`, `QuotesListContent`, `QuoteStatusBadge`, `SettingsForm`, `PageHeader`.
- Shared contract: `lib/admin/{types,totals,quotes-store,brand,quote-number}.ts` + `FUTURE.md`.
- `admin` dict namespace (en + he); admin form CSS + print scaffold in `globals.css`.
- `.env.example` updated; `next-auth@beta` added (both lockfiles).

**Gates**
- ESLint (new files): ✅ clean (`eslint` on all admin/auth/lib/admin/dict files → 0 problems).
- `next build` (typegen + typecheck + compile): ✅ pass. All `/admin/*` routes dynamic; proxy active.
- Dev smoke (localhost): ✅ `/admin` → redirects to `/admin/login`; login renders (branded,
  Google button, toggles, back link); EN↔HE lang toggle flips dictionary + `dir` (RTL "כניסת מנהל"),
  stays on the page; no console errors; main site `/en` unaffected.

**Known limitations / left for Nehorai**
- Full Google OAuth round-trip + authed shell pages are **not** runtime-smoke-tested locally
  (needs a real GCP OAuth client + `ADMIN_EMAILS`). Verified structurally via build/typecheck.
- DNS/Vercel domain + Google OAuth client + Vercel env vars — see `_master-plan.md`.

**Pre-existing (not introduced here)**
- `app/components/Hero.tsx` has a pre-existing `react-hooks/set-state-in-effect` lint error on
  `main` (confirmed by linting it in isolation). Out of scope for this work; not touched.

---

## Chip #2 — Quote Builder UI — ⏳ pending (Sonnet sub-agent, after Foundation on `main`)
## Chip #3 — Branded Quote Preview — ⏳ pending (Sonnet sub-agent, parallel with #2)
