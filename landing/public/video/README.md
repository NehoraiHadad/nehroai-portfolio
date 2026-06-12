# Character video assets

This folder holds the central character clip referenced by
`src/pages/index.astro`. Phase 1 ships only a placeholder **poster**
(`character.poster.webp`). Drop the real files here with these names — no code
change needed:

| File                    | Purpose                                  | Browsers          |
| ----------------------- | ---------------------------------------- | ----------------- |
| `character.poster.webp`  | Still poster + reduced-motion fallback   | all               |
| `character.mp4`         | H.264 — universal clip / framed mode     | all               |
| `character.webm`        | VP9 (or AV1) **with alpha** — transparent| Chrome/FF/Edge    |
| `character.mov`         | HEVC **with alpha** — transparent        | Safari/iOS/macOS  |

Until real files exist, the page detects the failed playback, shows the poster,
and reveals all link cards immediately (graceful degradation).

## Two visual modes — pick one in `index.astro` (`VIDEO.mode`)

- **`framed`** (default, safest): a normal rectangular **H.264** clip. The page
  applies a radial edge-mask + glow so the rectangle melts into the navy
  background. Only needs `character.mp4`. Universal, light, zero cross-browser pain.
- **`alpha`** (the full vision): a **transparent** character that floats over the
  cards with no box. Needs `character.webm` (VP9/AV1+alpha) **and**
  `character.mov` (HEVC+alpha) for Safari. Set `hevc:` in `index.astro` too.

## Producing the clip

1. Generate from a realistic photo with an image-to-video tool (Kling 3.0 or
   Runway Gen-4.5). Give it clear motion "beats" — gesture / point / present —
   roughly matching the timestamps in `src/lib/beats.ts` (`BEAT_MAP`).
2. **Recommended:** render on a **green screen** so you keep both options open.
3. Encode (FFmpeg):

   ```bash
   # framed / universal H.264
   ffmpeg -i in.mov -c:v libx264 -preset slow -crf 22 -an character.mp4

   # transparent WebM (VP9 + alpha) — after keying out the green
   ffmpeg -i keyed.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -an character.webm

   # transparent HEVC + alpha for Safari
   ffmpeg -i keyed.mov -c:v hevc_videotoolbox -alpha_quality 0.9 \
     -tag:v hvc1 -allow_sw 1 -an character.mov
   ```

## When to move to R2 instead of committing here

Cloudflare Pages caps a single asset at **25 MiB**, and large binaries bloat the
git repo. **Rule of thumb: any video > ~5 MB goes to Cloudflare R2** (egress is
free, 10 GB free tier) and you point the `src/pages/index.astro` paths at the
public R2 URL instead of `/video/...`. Keep only the lightweight poster in git.
