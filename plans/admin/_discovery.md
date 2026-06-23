# Admin — Phase 1 Discovery

Date: 2026-06-23
Repo: `nehroai-portfolio` @ `main`
Goal of phase: read AGENTS.md + current Next 16 docs + repo state; surface decisions for the master plan.

---

## 1. Repo at a glance

- **Next.js portfolio (App Router)** at the root: `app/(root)/` is the canonical English entry, `app/(localized)/[lang]/` serves `/en` and `/he`. Both share `app/components/*` and `lib/*`.
- Separate **Astro/Workers landing project** under `landing/` (excluded from TS/ESLint) — unrelated to admin work.
- Server work today is one Server Action (`app/lib/actions/contact.ts`, Resend) — **no DB, no auth library, no route handlers, no proxy/middleware**.
- Design system is mature: Tailwind v4 with tokens in `app/globals.css` via `@theme inline`; components like `.card`, `.btn-primary`, `.btn-secondary`, `.chip`, `.status-badge`, `.scrollbar-slim`, focus rings, RTL-aware headings, theme toggle (`data-theme="light"`), reduced-motion kill-switch.
- Custom **i18n** in `lib/i18n/`: `en` + `he` dictionaries, `I18nProvider` (client context), `localeDirections` + `getLocaleDirection` for `dir="rtl"`. **`next-intl` is NOT installed.**

## 2. Versions (from `package.json` + `pnpm-lock.yaml`)

| Package | Version | Notes |
|---|---|---|
| `next` | **16.2.1** | Big breaking change: `middleware.ts` → `proxy.ts` (see §4). |
| `react` / `react-dom` | **19.2.4** | Async `cookies()`, `headers()`, async `params` in layouts/pages. |
| `eslint-config-next` | 16.2.1 | Flat config (`eslint.config.mjs`). |
| `eslint` | 9.x | Flat config only. |
| `typescript` | 5.x | strict; `paths: { "@/*": ["./*"] }`. |
| `tailwindcss` / `@tailwindcss/postcss` | v4 | Tokens in CSS `@theme inline`, not in `tailwind.config.ts`. |
| `motion` | 12.23.x | (Framer Motion successor — already in app.) |
| `lucide-react` | 0.546.0 | Icons. |
| `resend` | 6.x | Already wired for contact form. |
| `@xyflow/react` | 12.x | Showcase only. |
| **Auth library** | _none_ | To be added: Auth.js v5 (NextAuth) with Google. |

Lockfile policy (per memory): **pnpm** is canonical; `pnpm-lock.yaml` is what Vercel uses with `--frozen-lockfile`. `package-lock.json` is also tracked. Add deps with `pnpm add`, then commit both lockfiles.

## 3. AGENTS.md rules (binding)

`AGENTS.md` (verbatim): *"This is NOT the Next.js you know — this version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices."*

Implication: **before every Next-coupled decision (proxy/middleware/auth/routing/route-handlers/cookies/params/deployment), open the matching doc in `node_modules/next/dist/docs/`.** Anything I "remember" from Next ≤15 must be re-verified.

## 4. Next.js 16 — what's different from what I'd otherwise assume

Read directly from `node_modules/next/dist/docs/`:

| Topic | File read | Finding that changes the plan |
|---|---|---|
| Edge/server gate (was middleware) | `01-app/01-getting-started/16-proxy.md`, `01-app/03-api-reference/03-file-conventions/proxy.md` | **`middleware.ts` is renamed `proxy.ts`** at project root. Export `proxy` (named or default) returning `NextResponse`; same `config = { matcher }` shape. Path-to-regexp matchers + `has`/`missing` predicates (header/cookie/query) supported — useful for host-based admin routing. Runs on Node.js runtime now. |
| Authentication | `01-app/02-guides/authentication.md` | Recommended path is to use an Auth Library (Auth.js / NextAuth listed first). Optimistic checks in Proxy are OK but real auth checks belong in a DAL near data. **`cookies()` is async** (`(await cookies()).get(...)`). |
| Route Handlers | `01-app/01-getting-started/15-route-handlers.md` | `route.ts` per segment, methods `GET/POST/...`; `RouteContext<'/users/[id]'>` global helper for typed `ctx.params` (also `await ctx.params`). Not cached by default. |
| Layouts/pages params | `app/(localized)/[lang]/layout.tsx` (existing) | Confirms: `params` is a `Promise` → `const { lang } = await params`. Use `LayoutProps<'/[lang]'>` / `PageProps<...>` global helpers. |
| Deploying | `01-app/01-getting-started/17-deploying.md` | Vercel listed as an adapter. Subdomain → same Vercel project is fine; proxy.ts can do host-based rewrites. |

**Plan-shaping conclusions:**
1. Host routing `admin.nehoraihadad.com` → internal `/admin/*` happens in **`proxy.ts`** at repo root (not `middleware.ts`). Use `NextResponse.rewrite()` so the URL bar keeps `admin.nehoraihadad.com/...`.
2. Auth library: **Auth.js v5 (`next-auth@beta` / `@auth/core`)** with Google provider. Compatible with Node runtime; uses async `cookies()` cleanly. Optimistic gate in `proxy.ts` (cookie presence check only — no DB). Real allowlist + role checks live in a small DAL (`lib/admin/auth.ts`).
3. Tokens are already cookie-aware (`@auth/core` uses HTTP-only secure cookies). Allowlist enforced in NextAuth `signIn` callback against `process.env.ADMIN_EMAILS` (CSV).
4. `cookies()` / `params` are async — keep all admin pages `async function Page()` and `await params`/`await cookies()`.

## 5. Current state — what's already in place vs. what's missing

| Area | Status |
|---|---|
| Routing groups | `app/(root)/`, `app/(localized)/[lang]/` exist → add `app/(admin)/` as a third group. |
| Layouts | Root layout per group; both inject `ThemeScript` + `fontVariables`. Admin will mirror this. |
| Auth | **None.** Need NextAuth v5 + Google provider + ADMIN_EMAILS allowlist + session cookie. |
| Sessions | None. NextAuth handles via signed cookies. |
| Forms | One `'use server'` Server Action (contact). Admin will use Server Actions + `useActionState`. |
| i18n | Custom dictionaries; **Hebrew + RTL already first-class** (`html dir={direction}`, RTL-aware globals). Quote-preview RTL just consumes the same `direction`. |
| Styling | Tailwind v4 + token system; `.card`, `.btn-*`, `.chip`, `.status-badge`, focus ring, scrollbar-slim, status colors, semantic ramps — admin shell can build entirely on existing primitives. |
| Icons | `lucide-react` already a dep → use for sidebar nav. |
| Env handling | `.env.example` exists (Resend, Gemini, APP_URL). Will add `NEXTAUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`, `ADMIN_BASE_URL`. |
| Tests | None (no jest/vitest/playwright). Gates will be lint + typecheck + build + manual smoke. |
| CI | Vercel build is the CI (pnpm --frozen-lockfile). |
| Deploy | Vercel; existing prod is `nehoraihadad.com`. `admin.nehoraihadad.com` will be added as a domain on the same Vercel project. |

## 6. AGENTS-pattern observations (style notes the chips must respect)

- **Route groups in parentheses** are the established pattern (`(root)`, `(localized)`). Admin gets its own: `app/(admin)/admin/...`. The `admin` segment is what proxy rewrites to.
- **Server components by default**; `'use client'` only on islands (e.g., `I18nProvider`, the agent panel).
- **Tokens > literals**: no hard-coded colors/spacing in components; use the CSS vars and Tailwind utilities mapped in `@theme inline`. Comments call this out explicitly in `globals.css`.
- **`suppressHydrationWarning`** on `<html>` and `<body>` because `ThemeScript` rewrites the class pre-hydration. The admin layout must do the same.
- **`@/*` import alias is repo-root** (not `src`), e.g. `@/lib/i18n/config`.
- **No comments unless WHY is non-obvious** — repo has lots of substantive comments explaining unusual choices (RTL composition, layered reveal classes, etc.); keep the same bar.
- **Heading rules**: `:lang(he) h1…` resets letter-spacing to normal (Rubik). Quote preview headings in Hebrew will inherit this; nothing extra needed.

## 7. Open questions (Gate 1 — need Dispatch/Nehorai's call before plan)

1. **Auth library:** OK to add **Auth.js v5 (`next-auth@beta`) with the Google provider** as the auth stack? (Recommended; matches Next 16 docs.)
2. **Subdomain hosting model:** add `admin.nehoraihadad.com` to the **same Vercel project** as `nehoraihadad.com` (proxy.ts host-rewrites to `/admin/*`)? Or split into a separate Vercel project later? (Recommend single project for now.)
3. **Google OAuth credentials:** do you already have a GCP OAuth 2.0 Client ID, or will I document a fresh setup (authorized redirect URI: `https://admin.nehoraihadad.com/api/auth/callback/google` + local dev `http://localhost:3000/api/auth/callback/google`)?
4. **Spec mentions `ai.nehoraihadad.com`** (in the negative — *NOT* a redirect target). Is that an actual existing surface I need to leave alone, or just hypothetical phrasing?
5. **Currency:** ILS-only for this phase, or a switcher with ILS/USD/EUR (UI only, no FX)?
6. **Quote numbering:** auto-generate (e.g. `NH-2026-0001` from localStorage counter) for this phase, or leave numbering for the DB phase?
7. **Admin UI language:** is the admin chrome (sidebar/topbar/form labels) **English only** for now, **Hebrew only**, or mirrors the existing dictionary system (en+he)? The *quote preview* RTL/Hebrew is locked in by the quote-language field regardless.
8. **Theme on admin:** force dark, force light, or inherit the same `data-theme` toggle as the public site?
9. **Local persistence scope:** localStorage keyed per logged-in email, or a single global key? (Per-email lets you log out without losing drafts.)
10. **PDF / Send-to-client buttons:** disabled with a "Future" tooltip in-line, or grouped in a "Coming soon" footer section? (I'll default to inline `disabled` + tooltip unless told otherwise.)
11. **Brand wordmark on the quote preview header** — the spec says *"Nehorai Hadad / NehroAI"*, but given `nehroai-portfolio` is a historical typo it's plausible `NehroAI` is also a leftover. Pick one:
    - **A.** `Nehorai Hadad` only (clean personal brand)
    - **B.** `Nehorai Hadad` + `NehroAI` tagline (both, intentional dual brand)
    - **C.** `NehroAI` is the real wordmark — keep it
    - **D.** something else (e.g. Hebrew `נהוראי חדד` on Hebrew-language quotes, English on English quotes)

## 8. Chip shape (preview only — full breakdown in master plan)

- **Chip #1 — Foundation (me, this session).** `proxy.ts` host routing, Auth.js v5 + Google + allowlist, protected `app/(admin)/admin/{dashboard,clients,quotes,settings}/page.tsx`, shared types in `lib/admin/types.ts`, `.env.example` update, lint/typecheck/build, commit + push.
- **Chip #2 — Quote Builder UI (Sonnet sub-agent, after #1 lands).** Form, line items, auto totals, status pill, localStorage persistence keyed by user.
- **Chip #3 — Branded Quote Preview (Sonnet sub-agent, parallel with #2).** Printable RTL/LTR preview consuming the same `QuoteDoc` type, branded header, Save/Preview/Download(disabled)/Send(disabled) buttons.
- (Chip #2 + #3 parallelize because Foundation publishes the shared `QuoteDoc` type contract.)
