/* ============================================================
   Character clip assets — shared by Welcome (renders the stage + A/B vote)
   and Base (preloads the default poster for a fast first paint).

   Two clips are kept live so visitors can A/B them: v1 = the original 3-clip
   metamorphosis loop, v2 = the newer "agency" loop (writes/types/texts to
   author each card). Both are alpha (transparent character floats over the
   grid); mp4 is the navy-baked fallback.

   Bump a version constant on every re-encode so browsers (and the CDN) fetch
   the new file instead of a stale cached copy.
   ============================================================ */

export type IntroVer = "v1" | "v2";

const V1 = "7";
const V2 = "9-v2";

export const VIDEOS = {
  v1: {
    poster: `/video/character.poster.webp?v=${V1}`,
    mp4: `/video/character.mp4?v=${V1}`,
    webm: `/video/character.webm?v=${V1}`,
  },
  v2: {
    poster: `/video/character-v2.poster.webp?v=${V2}`,
    mp4: `/video/character-v2.mp4?v=${V2}`,
    webm: `/video/character-v2.webm?v=${V2}`,
  },
} as const;

// Which clip renders on first paint (the client script may override from a
// saved preference). v2 is the newer one we want eyes on.
export const DEFAULT_VER: IntroVer = "v2";
