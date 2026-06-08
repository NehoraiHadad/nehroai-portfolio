# nehoraihadad.com — Welcome landing page

A standalone landing page for the apex domain **nehoraihadad.com**. It lives in
this `landing/` subdirectory but is a **completely separate project** from the
Next.js portfolio at the repo root (which deploys to Vercel on
`ai.nehoraihadad.com` and ignores this folder). This page deploys on its own to
**Cloudflare Pages**.

The concept: a **character** (built from a realistic photo) greets visitors and
"presents" link cards — not a static menu, but a host showing you around.

## Phase 1 vs Phase 2 (read this before changing things)

- **Phase 1 (now):** the character is a looping **video** in the centre. At a few
  timestamps it triggers card reveals (loose sync — not frame-perfect).
- **Phase 2 (later):** the video is replaced by an interactive **react-three-fiber**
  3D rig; the Phase-1 video becomes the mobile / slow-connection fallback.

**Guiding rule:** Phase 1 is built so **most of it survives Phase 2**. Only the
"heart" changes. The swap point is one file: `src/components/CharacterVideo.tsx`.
Everything else — layout, tokens, cards, the beat/sync mechanism, the Cloudflare
deploy — carries over untouched.

## Stack

- **Astro** (static output) + a single **React island** (the character).
- Self-hosted variable fonts via `@fontsource-variable` (Geist, Geist Mono, Rubik).
- Design tokens copied from the portfolio (`src/styles/tokens.css`) for a
  consistent look across both sites.

## Architecture

```
src/
  layouts/Base.astro          # <html>, meta/OG, global styles
  pages/index.astro           # composition + wires beats -> card reveals
  components/
    CharacterStage.astro      # the stage box (layout; survives Phase 2)
    CharacterVideo.tsx         # >>> THE HEART / Phase 2 swap point <<<
    LinkCard.astro / LinkCards.astro
  lib/
    beats.ts                  # beat abstraction (see below)
    links.ts                  # data-driven link targets
public/
  brand/                      # monogram, wordmark, cover (share image)
  video/                      # character clip + poster (see its README)
```

### The sync mechanism (`src/lib/beats.ts`)

The **source** of beats is decoupled from the **reaction** to beats:

- Reactions listen on a DOM event: `onBeat("portfolio", () => reveal())`.
- In Phase 1, the `<video>` drives beats via `requestVideoFrameCallback`
  (`attachVideoBeats`), matching playhead time against `BEAT_MAP`.
- In Phase 2, an R3F timeline just calls `emitBeat("portfolio")` — the cards and
  every `onBeat` subscriber stay identical.

Tune the timing by editing `BEAT_MAP` timestamps in `beats.ts`.

### Adding a link target

1. Add an entry to `LINKS` in `src/lib/links.ts` (give it a unique `beat`).
2. Add a matching row to `BEAT_MAP` in `src/lib/beats.ts` with its timestamp.

The card renders and wires up its reveal automatically.

## Swapping in the real video

See `public/video/README.md`. Short version: drop `character.mp4` (and/or the
transparent `character.webm` + `character.mov`) and a `character.poster.png`
into `public/video/`. Pick `framed` (rectangular, universal) or `alpha`
(transparent, floats) via `VIDEO.mode` in `index.astro`. Videos over ~5 MB
should go to **Cloudflare R2** and be referenced by URL instead of committed.

## Local development

```bash
cd landing
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # -> dist/
pnpm preview
```

(The page works without a real video: it shows the poster and reveals all cards.)

## Deploying to Cloudflare Pages

Create a Pages project connected to this repo with:

- **Root directory:** `landing`
- **Build command:** `pnpm build`
- **Build output directory:** `dist`
- **Build watch paths → Include:** `landing/**`
  (so portfolio-only changes outside `landing/` don't trigger a rebuild)

Then, under the Pages project's **Custom domains**:

- Add `nehoraihadad.com` (apex). Cloudflare handles CNAME flattening since DNS
  is already on Cloudflare.
- Add a **www → apex** redirect (Bulk Redirect / Redirect Rule):
  `www.nehoraihadad.com` → `https://nehoraihadad.com` (301).

This does **not** interfere with the Vercel deploy: Vercel builds the Next.js app
at the repo root and ignores `landing/` (also listed in `.vercelignore`).

> ⚠️ Don't deploy or change DNS without confirming first.
