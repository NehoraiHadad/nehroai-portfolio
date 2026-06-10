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

---

# 8. Video **v2** — the AGENCY storyboard (shot-by-shot)

> **Status:** storyboard locked, NOT yet rendered. This section supersedes the
> v1 storyboard (§4) and video brief (§6) *for the v2 render only* — §4/§6 stay
> as the record of the shipped v1 loop (`public/video/character.*`). v1 is the
> **fallback**: do not touch v1 assets until v2 is verified in-browser.

## 8.1 What changes from v1 (and what doesn't)

The **spine is untouched**: one looping clip, realistic → 16-bit pixel → anime,
one style per world (Portfolio / GitHub / Contact), color escalating, the page
theming + beats driven by `BEAT_MAP`/`WORLD_MAP`. That coupling *is* the wow.

v1's flaws being fixed:
- **Passive face / fixed smile** → continuous **micro-life** (blink, breath,
  gaze drift, a real shift of expression) across every shot.
- **Visible seams** between the 3 clips → the **morph itself becomes the action**
  (a long, motivated transformation), not a fixed-time alpha dissolve at a cut.

The new creative layer = **AGENCY**. Throughline: *"a builder who rewrites his
own reality."* The character doesn't passively morph — **his act of authoring a
card triggers the morph into the next world.** Each world he authors its card in
its own medium; finishing that act is what transforms him.

## 8.2 The two rules that govern every shot

1. **Causation is TEMPORAL, not spatial** (decided). The page layout puts the
   card in *different* places (desktop: a row beside the figure; mobile: a deck
   *below* it), but the video is one fixed asset — so the character can NOT point
   at "where the card is." Instead his authoring action is aimed **generally
   forward/down**, and the **DOM typewriter reveal firing on the beat** supplies
   the "he made it" reading. Loose temporal sync = causation; no spatial pointing.
2. **Bake the device, DOM the content.** The physical prop the hand touches
   (terminal, phone, the air-stroke) is **baked into the video** — its screen is
   a **glowing, illegible** surface, never readable text. The **real, readable,
   clickable** content (card copy, code, chat) is **page-side DOM**, revealed by
   the per-world typewriter. The two must never both show legible text or they
   compete for "source of truth."

## 8.3 The loop — shot by shot (~15s)

Three cycles of **dwell → authoring action → long morph**, bookended by a
realistic HOOK that is also the seamless loop seam. The action that authors each
world is the **same gesture that triggers the morph into the next** world.

| # | Time | Style | Character action (baked) | Morph trigger | DOM reaction (page-side) |
|---|------|-------|--------------------------|---------------|--------------------------|
| **HOOK** | 0.0–1.2 | Realistic | Eye contact, raises a hand, a **spark of light at the fingertips** (foreshadows the light-trail), a **blink + breath**. Neutral stance (= loop-seam pose). | — | Intro copy on screen. |
| **P – author** | 1.2–4.3 | Realistic | **Writes/sketches in the air** — fingertips trail a line of light, then an open-palm present. | — | **beat `portfolio` ≈ 2.6** → Portfolio card reveals as **handwriting/sketch** (DOM, to build). |
| **Morph #1** | 4.3–5.3 | Real → Pixel | A **clap** sends a **pixel-wave from the hand across the body** — 16-bit blocks sweep over him. The clap is the trigger. | the clap | — (cut lands on the pixel **dwell** frame; see morph-length note below). |
| **G – author** | 5.3–8.8 | Pixel | Pixel-Nehorai types on a **retro terminal** (baked prop), energetic, **pixels flying**, screen glows green (illegible). | — | **beat `github` ≈ 6.8** → Terminal card **types in** as green code w/ caret (**DOM — already built**). |
| **Morph #2** | 8.8–9.8 | Pixel → Anime | He hits **Enter → "compile"**; the pixels **melt into clean anime line-art**. The keystroke triggers it. | the Enter / compile | — (cut on the anime dwell frame). |
| **C – author** | 9.8–13.3 | Anime | Anime-Nehorai thumbs a **phone** (baked prop), other hand **to the heart**, a **sparkle**. | — | **beat `contact` ≈ 11.4** → Contact card fills like a **chat bubble** (DOM, to build). |
| **Morph #3 / return** | 13.3–15.0 | Anime → Real | The message sends; he **relaxes his hands** and the cel shading **melts back into real skin & fabric**, settling into the neutral seam pose with a breath. | the send / relax | — (closes onto the HOOK pose). |

**Why each action triggers the next style:** authoring Portfolio (the clap that ends
the air-sketch) pixelates him into the GitHub world; authoring GitHub (Enter →
compile) blooms him into the anime Contact world; authoring Contact (send, then
relax) returns him to his realistic self. Creation *is* transformation — the
throughline made literal.

**Morph-length note (the one seam risk).** Morphs #1/#2 are short (~1.0s). That is
safe **only if the morph is baked continuous** (Seedance renders the body actually
transforming inside the segment) — then there is NO post-dissolve and the hard cut
lands on a stable same-style dwell frame, so no seam can exist. **If** identity won't
hold across a baked jump and we're forced back to a post crossfade (the v1 failure
mode), **lengthen the morph to ~1.5s** so the blend has room — never re-introduce a
fast fixed-time dissolve at a cut. The seam is killed by *baking* the morph, not by
its duration.

**Rejected (recorded so it doesn't creep back):** "orient the character toward where
the card sits." Spatial pointing can't work — the card is beside the figure on
desktop but below it in the mobile deck, and the video is one fixed asset. Causation
stays **temporal** (§8.2 rule 1).

## 8.4 Proposed beat timings (to calibrate in `BEAT_MAP`/`WORLD_MAP` after render)

These are storyboard targets; the real values get tuned to the rendered file
(same as v1 was). Listed here so Stage 6 has a starting point.

**These match the SHIPPED v1 values** (chosen deliberately) — so Stage 6 rewiring
is near-zero: `BEAT_MAP` is unchanged, and `WORLD_MAP` moves only the portfolio
`seek` (2.2 → 2.6).

```
BEAT_MAP   portfolio = 2.6   github = 6.8   contact = 11.4   (= v1, unchanged)
WORLD_MAP  portfolio until 4.7 (morph#1),  seek 2.6   (v1 seek was 2.2)
           github    until 9.3 (morph#2),  seek 6.8   (= v1)
           contact   until 13.6 (return),  seek 11.4  (= v1)
```

Each beat fires mid-authoring-action (before its morph), so the DOM card is
"being written" while the hand is mid-gesture. Each `until` sits at the morph so
the page re-themes as the new style takes over the body. `seek` = the dwell frame
to scrub to when the user *summons* a world (hover/focus), so they see it fully
incarnated mid-action, not mid-morph.

## 8.5 What this implies for later stages (not part of Stage 1)

- **New keyframes needed** (Stage 2) — v1's 4 are neutral/pointing, no props.
  v2 needs: realistic **air-writing** pose, pixel **terminal-typing** pose
  (+ terminal prop), anime **phone-texting** pose (+ phone prop). Loop-seam frame
  reuses `01-master-neutral`. Hub-and-spoke (face + master as the 2 identity
  refs) still holds; props are added refs, not chained.
- **Render shape** (Stage 4) — try one continuous 15s first; if 3 style jumps
  drift, fall back to the v1 segmentation (seg1 HOOK+P+morph1 · seg2 G+morph2 ·
  seg3 C+morph3+return), each first=action-keyframe / last=next-dwell-keyframe.
- **Page-side build** (Stage 6) — `present()` in `Welcome.astro` already routes
  `github`→typewriter; v2 adds `portfolio`→handwriting reveal and
  `contact`→chat-bubble reveal so all three worlds author their card in-medium.
- **Output contract is frozen:** 834×1112, VP9-alpha webm + navy-baked mp4
  fallback + transparent poster, so the matte + page CSS don't move.
