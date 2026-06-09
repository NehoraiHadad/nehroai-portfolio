# Narrative & storyboard — nehoraihadad.com Welcome page

The content/story bible for the landing page. Read this before touching the
video, `src/lib/beats.ts`, or `src/lib/links.ts` — those files are the
*implementation* of the decisions recorded here.

---

## 1. The one-line concept

> A realistic Nehorai greets you, then **shifts through styles** —
> realistic → pixel-art → anime — and each incarnation hands you a different
> "world" to explore.

The metamorphosis is the engine of the **"wow, who is this guy"** first
impression we're going for. It's not a gimmick bolted on top: each style
*means* something (see §4), and the realistic self is always the anchor it
returns to.

## 2. Guiding principles (decided)

| Decision | Value | Why it matters downstream |
|----------|-------|---------------------------|
| Emotional arc | **"Wow, who is this guy"** | We're allowed to make people pause. The wow comes first. |
| The wow comes from | **Metamorphosis — a style per world** | Realistic is the anchor; each presentation is a new incarnation. |
| Language | **English only** | All copy, OG, microcopy in English. No RTL handling needed. |
| Scope | **3 worlds, no individual projects** | The lobby sells *who he is*; the portfolio sells *what he built*. |

**The iron rule:** the wow is the *default*, never a *cage*. Every link is
reachable even by someone who won't wait for the clip. We design for the
experience; we never block the exit. (Practically: the 4s safety-net in
`index.astro` reveals all cards if no beat fires, and cards link out directly.)

**Information architecture — why no projects on the landing page:**

- `nehoraihadad.com` (this page) = the **lobby**. Front door. Job: create the
  wow and route you to the right world.
- `ai.nehoraihadad.com` (portfolio) = the **gallery**. Where Story Creator,
  Podcasto, Maklikim, DorGames, etc. live in depth.

Putting individual projects on the lobby would (1) turn it back into a menu and
kill the wow, (2) compete with the Portfolio card and drain its reason to
exist, and (3) add a card+beat+video burden per project. The lobby stays
stable; the portfolio is the thing that grows.

## 3. The worlds (in presentation order)

| # | World | Style that presents it | Why this style | Link |
|---|-------|------------------------|----------------|------|
| 1 | **Portfolio** | Realistic (the anchor) | The serious work — the real Nehorai hands it over. | `https://ai.nehoraihadad.com` |
| 2 | **GitHub** | Pixel-art / 8-bit | Code, retro, "under the hood." | `https://github.com/NehoraiHadad` |
| 3 | **Let's talk** (Contact) | Anime | Warm, expressive, personal — closes on an invitation. | `mailto:nehorai.hadad@gmail.com` *(swap to LinkedIn if preferred)* |

Order is deliberate: anchor → the proof (code) → the human invitation. We open
serious, show the engine, and end warm.

## 4. The storyboard (the loop)

A single **looping clip** (~11s). The realistic self both opens and closes the
loop so it cuts seamlessly. Beats fire as the playhead crosses the timestamps
in `BEAT_MAP`; each beat flies its card in.

| Time | Style | Character action | DOM reaction |
|------|-------|------------------|--------------|
| 0.0–1.5s | Realistic | Settles into frame, eye contact, a small nod/smile — "I see you." | Intro copy on screen; stage "arrives." |
| 1.5–2.5s | Realistic | Turns slightly, opens a hand toward the card area — *presents Portfolio.* | **beat `portfolio` ≈ 2.3s** → card flies in. |
| 2.5–4.0s | → morph | **Metamorphosis #1:** realistic dissolves/glitches into pixel-art. | — |
| 4.0–5.0s | Pixel | Pixel-Nehorai gestures toward GitHub — playful, blocky. | **beat `github` ≈ 4.6s** → card flies in. |
| 5.0–6.5s | → morph | **Metamorphosis #2:** pixel → anime (ink-bloom / line-draw). | — |
| 6.5–7.5s | Anime | Anime-Nehorai, hand to chest then outward — *invites you to reach out.* | **beat `contact` ≈ 7.0s** → card flies in. |
| 7.5–9.5s | → morph | Friendly hold, then morphs back toward realistic. | All three cards present. |
| 9.5–11.0s | Realistic | Settles back into the opening pose → **seamless loop point.** | Loop. |

**Beat count: 3.** Rhythm: roughly one presentation every ~2.3s, with a morph
between each. Tight enough that an impatient visitor has all three cards within
~7s; rich enough that a curious one watches the full transformation.

> **Polish note (code):** `attachVideoBeats` re-fires beats on each loop
> (`onTimeReset` clears `fired` near t=0), so the WAAPI flourish in
> `index.astro` re-runs every ~11s. Cards stay revealed (good), but the bounce
> repeats. If that reads as noisy, guard the flourish to run only on first
> reveal. Left as-is for now.

## 5. Copy (English)

**Header (keep — it fits the host concept):**

- Eyebrow: `Nehorai Hadad`
- H1: `Welcome.`
- Lede: `Hi — I'm Nehorai. Let me show you around.`

**Cards** (`kicker` / `label` / `description`):

| World | Kicker | Label | Description |
|-------|--------|-------|-------------|
| Portfolio | `AI · Engineering` | `Portfolio` | `Projects, experiments, and the things I build with AI.` |
| GitHub | `Code · Open source` | `GitHub` | `The source behind the work — repos, experiments, commits.` |
| Contact | `Say hello` | `Let's talk` | `Got an idea or a role in mind? Reach me directly.` |

## 6. Video brief — for Kling / Runway

**Subject:** Nehorai (from the reference photo), upper body / waist-up, centered.

**Background:** **Solid chroma green (#00b140)**, evenly lit, no shadows on the
backdrop. This lets us edge-mask (`mode="framed"`) or key to transparent
(`mode="alpha"`) later without re-shooting.

**Framing & camera:** Static or very slight push-in. Subject centered with
headroom; hands must stay in frame (the gestures *are* the content).

**Lighting/mood:** Clean, bright, friendly. Soft key. The realistic open should
feel like a real person, not a render.

**The loop is the deliverable.** First and last frame must match (realistic,
neutral open pose) so it cuts seamlessly.

**Per-beat actions** (match the storyboard in §4):

1. **Open (realistic):** materialize/settle, eye contact, small nod + smile.
2. **Present Portfolio (realistic):** open right hand outward toward lower-frame
   (where the card appears). Confident, welcoming.
3. **Morph → pixel-art:** dissolve/glitch transition into 8-bit Nehorai.
4. **Present GitHub (pixel):** blocky, playful gesture toward the card area.
5. **Morph → anime:** ink-bloom / line-draw transition into anime Nehorai.
6. **Invite contact (anime):** hand to chest, then opens outward — warm.
7. **Morph back → realistic, return to open pose** for the loop seam.

**Production reality — generate it in segments, not one continuous morph.**
Current AI video tools struggle with a single take that morphs realistic→pixel→
anime *and* loops *and* gestures on cue. Easier and more controllable:

- Generate **one segment per style** (realistic / pixel / anime), each ~2–3s,
  on the same green background, same framing, same gesture beat.
- Stitch in an editor with short **dissolve/glitch transitions** between them.
- Render the realistic open + a realistic close so the loop seam matches.
- Export H.264 `.mp4` (framed) — and, if going transparent later, key the green
  to alpha for `.webm` + `.mov` (`mode="alpha"`).

Keep the final file < ~5 MB in-repo; larger goes to Cloudflare R2 by URL.
See `public/video/README.md` for filenames and swap-in details.

**Avoid:** text/UI baked into the video (the cards are DOM, not video), heavy
camera motion, busy backgrounds, the subject leaving frame.

## 7. Roadmap notes

- **Phase 1:** this looping video drives the 3 beats (loose sync). Cards are
  DOM and fly in on cue.
- **Phase 2:** react-three-fiber rig replaces `CharacterVideo.tsx`; the morphs
  become real-time style swaps; the beat contract (`emitBeat`/`onBeat`) is
  unchanged, so cards and timing survive.
- **If/when a 4th world is wanted** (e.g. Blog/Writing → comic/ink style): add a
  segment to the clip, a `LINKS` entry, and a `BEAT_MAP` row. Keep the lobby at
  "worlds," never individual projects.
