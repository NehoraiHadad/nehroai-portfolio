# Character keyframes — manifest & resume point

State of the landing-page character work as of the session that generated these.
Read this + `landing/NARRATIVE.md` to resume from a clean context.

## The chosen set (these 4 drive the video loop)

| # | File | Role | Style | Outfit | Gesture | kie task_id (re-fetch URL via `get_task_status`) |
|---|------|------|-------|--------|---------|--------------------------------------------------|
| 1 | `01-master-neutral.png` | master / loop seam | realistic | blue shirt + beige chinos | neutral, arms down | `22759187569a79dcc90edd6fbb12cd08` |
| 2 | `02-portfolio-realistic.png` | Portfolio | realistic (muted) | blue shirt + beige chinos | open-palm present to side | `ea2f59a89215af04e2f7afcfaa89a8af` |
| 3 | `03-github-pixel.png` | GitHub | 16-bit pixel (vibrant) | electric-blue hoodie + jeans | point down + hand on hip | `30b43e3aa696aa3f17d5824b3957eed6` |
| 4 | `04-contact-anime.png` | Contact | anime cel-shaded (vibrant) | teal bomber + white tee | hand on chest + open palm invite | `1e420072cb5deb77ccd43574e8913749` |

All full-body, 3:4, on chroma-key green. Identity consistent across all four.

## Decisions locked (see NARRATIVE.md for the why)

- Emotional arc: **"wow, who is this guy"** — wow is the default, never a cage.
- Engine: **metamorphosis** — a style per world; **color escalates** realistic→pixel→anime.
- Bigger vision: **the page itself adapts per active style** (palette + elements), driven by the beat system. To build in CSS later.
- Language: **English only**. Worlds: **Portfolio / GitHub / Contact** (no individual projects on the lobby).
- Outfit **varies per world**; identity (face) is the only hard constant.

## How these were made (pipeline that works)

- Tool: **kie-cli** (Kie.ai). Load key each shell: `$env:KIE_AI_API_KEY = [Environment]::GetEnvironmentVariable("KIE_AI_API_KEY","User")`.
- Reference images must be **public URLs** (no upload cmd). Original face ref (public): `https://nehoraihadad.com/video/character.poster.png`.
- **Hub-and-spoke consistency:** generate ONE clean neutral full-body realistic master, then derive every other keyframe as **[master URL + face headshot URL]** = 2 refs. Prompt wording alone does NOT lock outfit (proven — clothes drifted); a visual reference does. Do NOT chain (compounds drift).
- Image model used: **GPT Image 2** (`gpt_image_2`, 2K, user's pick). Reliable runner-up / often better identity + pixel: **Nano Banana 2** (`nano_banana_image`). GPT Image 2 was slow/flaky here (frequent 180s wait timeouts + occasional hard fail — resubmit and re-fetch via `get_task_status`).
- Keyframes for video → **2K is plenty** (video downscales to ~1080p); 4K is wasteful.

## ✅ VIDEO STAGE — DONE (loop built, keyed, wired in, verified in browser)

The looping metamorphosis video is live in the page. Final web assets (committed):
`landing/public/video/character.{mp4,webm,poster.png}` — framed mode, navy-baked, ~13.6s loop.

**Display mode: `alpha` (transparent webm), NOT framed/navy.** The page background is a GRID, so an opaque navy rectangle (framed mode) showed as a visible box. Switched to true transparency: VP9-alpha webm (`character.webm`, `pix_fmt yuva420p`, has `alpha_mode=1` tag — browsers honor it even though ffmpeg's own overlay can't decode VP9 side-alpha, so verify in a browser, not via ffmpeg). `character.mp4` is an opaque navy fallback for engines without VP9 alpha (Safari → shows a box; true Safari transparency needs an HEVC-alpha .mov, not producible on Windows). Poster is a transparent PNG. `index.astro` mode is `alpha`.

**Transitions: alpha crossfade DISSOLVE, NOT `xfade=pixelize`.** pixelize explodes the whole frame into giant blocks at the midpoint (looked "stuck/broken"). Real recipe: key each segment to alpha, `fade=alpha=1` in/out at the boundaries, `setpts` to position (seg1 @0, seg2 @4.5, seg3 @9.0), `overlay` onto a transparent base → ~14s loop. Loop wrap (seg3→seg1) is a hard cut (realistic→realistic, seamless).

**⚠️ Chroma key was ABANDONED — use AI matting (rembg) instead.** The GPT-generated green screen is NON-UNIFORM: a two-tone green (bright wall `#0CE31B` + muted floor `#369342`) with a **white/grey studio seam line** (`#D4D7DE`) that **MOVES vertically** during the realistic→pixel morph (the morph interpolates the seam position between the two keyframes). No chroma key (even green-dominance via geq + vertical alpha erosion) can cleanly remove a moving neutral seam line without thinning the horizontally-extended arm. **UPDATE: pixelation REMOVED + despill added (user request).** (a) The post-pixelation (110px) was dropped — user found it too chunky and it bled into the anime during the dissolve; seg2 now uses Seedance's own (smoothed) render. NOTE: this means the "pixel world" is no longer crisp pixel-art — it's a stylized blue-hoodie incarnation. To get a true clean pixel world back, regenerate seg2 with an image/video model that preserves pixel-art in motion. (b) rembg's soft matte still kept green-tinted antialiased edge pixels from the original green screen → added a **green-clamp despill** (geq: `g = min(g, max(r,b))`) per segment, which removes the green fringe while preserving the teal jacket. Verified over white.

**Solution that worked: `rembg` (model `u2net_human_seg`, `post_process_mask=True`) per frame** — segments the person, ignores the background entirely, clean on ALL three styles (realistic/pixel/anime). Pipeline: ffmpeg extract frames → rembg each (Python, ~7min for 363 frames, one reused session) → ffmpeg reassemble from the RGBA PNG sequences (`-framerate 24 -i segN_cut/%04d.png`) with the pixelate(seg2)+alpha-fade-dissolve+overlay graph (NO chromakey, NO erosion needed). Frames live in `landing/media/video/frames/segN_cut/`. rembg installed via `pip install rembg onnxruntime`.

(Superseded chroma-key notes, kept for reference:) **chain ALL THREE green shades as tight keys on EVERY segment** — `chromakey=0x3E9941:0.12:0.03,chromakey=0x16D722:0.12:0.03,chromakey=0x2FB835:0.12:0.03` (the realistic/pixel/anime bg greens). Why: (a) each Seedance segment's bg green DRIFTS toward the next style's green during its morph tail, so a single per-segment key leaks green exactly at the transitions; (b) a single WIDE key (sim≥0.20) eats the realistic segment's pale-blue shirt + beige chinos (low-chroma, close to green in YUV). Three TIGHT keys catch the whole green range without touching clothing. Verified over magenta. (seg2 is pixelated after keying: `scale=110:-1:flags=neighbor,scale=834:1112:flags=neighbor` on the RGBA.)
  - **Despill / green fringe:** use **blend 0 (hard key)** + a **1px alpha erosion** per segment (`split → alphaextract → erosion → alphamerge`). The soft-blend versions left a green halo around the silhouette (read as "too pixelated/rough", visible on the smooth anime too); hard key + erosion removes it cleanly.

**What worked (the actual recipe used — supersedes the Kling plan below):**
- **Engine: Seedance 2.0 `standard` mode** (NOT Kling — Kling's API returned `multi_shots cannot be empty` on every call this session; NOT seedance `fast` — fast drifted identity + jittered).
- **3 segments, not 4** (the master-neutral 01 is unused; loop closes anime→realistic→realistic):
  - seg1 realistic-dwell→pixel = `landing/media/video/poc4-natural-std-seg2.mp4` (first=02,last=03)
  - seg2 pixel-dwell→anime = `landing/media/video/seg2-pixel-to-anime.mp4` (first=03,last=04)
  - seg3 anime-dwell→realistic = `landing/media/video/seg3-anime-to-realistic.mp4` (first=04,last=02, closes loop)
- **Motion prompt = calibrated natural** ("gently alive, soft breathing, one weight shift, one smooth unhurried gesture; NOT fast/jittery/exaggerated" + explicit "keep his exact face/identity").
- **Pixel style is applied in POST, not generated** — video models smooth pixel-art away. seg2 was pixelated with ffmpeg `scale=110:-1:flags=neighbor,scale=834:1112:flags=neighbor` → `seg2-pix.mp4`. 110px = approved chunk size.
- **Assembly:** see the alpha-dissolve + triple-key recipe at the top of this section (the earlier pixelize/navy attempt was replaced after browser testing). One ffmpeg pipeline: 3 inputs → triple-key each → pixelate seg2 → alpha fades + setpts → overlay on transparent base → VP9-alpha webm (+ a navy-base variant for the mp4 fallback). Poster = keyed frame 0.
- **Wiring:** `index.astro` mode = `alpha`. `BEAT_MAP` tuned to the 14s loop (portfolio 2.2 / github 6.8 / contact 11.4) and `attachVideoBeats` re-fires on loop wrap (backward-jump detection). Verified in `pnpm -C landing dev`: transparent over the grid, soft dissolves, all 3 cards reveal, no console errors.

**Optional polish later:** a few stray green specks survive keying in the pixel phase (read as pixel sparkle — minor); could add a despeckle/tighter key. Per-style PAGE theming (palette swaps driven by beats) is still the bigger future ambition. Could add a neutral "rest" beat (master 01) for a calmer intro.

ffmpeg lives at `C:\Users\nehor\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\...\bin\ffmpeg.exe` (installed via winget this session; PATH not refreshed in tool shells — call by full path).

---
### (Original pre-video plan — superseded, kept for reference)
Turn the 4 keyframes into a looping clip = **4 morph segments** via **Kling 3.0** (`kling_video`, `mode pro`, `image_urls`=[startFrame,endFrame], no audio). Seedance 2.0 (`bytedance_seedance_video`, has `--first_frame_url`/`--last_frame_url`) is the fallback.

| seg | frames | beat | draft prompt (motion+camera only) | dur |
|-----|--------|------|-----------------------------------|-----|
| 1 | 01→02 | portfolio | "Stays photorealistic, identity/outfit unchanged. Smoothly raises and extends right arm into an open-palmed welcoming presenting gesture, weight shifting naturally. Camera static, stable. Smooth natural motion. Green screen unchanged." | 4s |
| 2 | 02→03 | github | "Smooth seamless transformation: photorealistic man gradually morphs into a vibrant 16-bit pixel-art version of himself, pixels forming across his body, as he shifts his arm down to point energetically toward the lower frame. Identity/pose continuous. Camera static. Even gradual transition. Green screen unchanged." | 5s |
| 3 | 03→04 | contact | "Smooth seamless transformation: pixel-art man gradually morphs into a vibrant cel-shaded anime version, pixels dissolving into clean anime line art, as he brings one hand to his chest and extends the other forward inviting. Identity continuous. Camera static. Fluid gradual transition. Green screen unchanged." | 5s |
| 4 | 04→01 | (loop close) | "Smooth seamless transformation: anime man gradually morphs back into his photorealistic self, shading resolving into real skin and fabric, as he relaxes both arms into a calm neutral standing pose. Identity continuous. Camera static. Gradual transition. Green screen unchanged." | 4s |

### ⚠️ Key risk + plan B
First/last-frame works best when frames are *similar*; our style jumps are extreme, so the morph may "cut" instead of blending. **Do a POC on segment 2 (realistic→pixel) first.** If it morphs cleanly → run all 4. If it cuts/flickers → **Plan B:** generate a short motion clip per style (image-to-video) and do the style transitions in post (ffmpeg dissolve/glitch/pixelate).

### After video
1. Stitch 4 clips into one loop (ffmpeg concat). 2. Chroma-key green → alpha, or composite (note: teal anime jacket is close to green — watch keying). 3. Wire into `landing/src/components/CharacterVideo.tsx`; tune `BEAT_MAP` timings in `landing/src/lib/beats.ts`. 4. Build the per-style page theming.

### Reminder: keyframes need public URLs for the video step
The kie `result_urls` (tempfile.aiquickdraw.com) are ephemeral. Before running Kling, re-fetch fresh URLs via `get_task_status` using the task_ids above, or commit the 4 PNGs to `landing/public/keyframes/` and use the deployed URLs.

## Folder note
`landing/media/keyframes/` (parent) holds all experiments + A/B comparisons (Seedream vs Nano vs GPT, muted vs vibrant, 8-bit vs 16-bit). Only the 4 in `final/` are canonical. Safe to clean the parent later.
