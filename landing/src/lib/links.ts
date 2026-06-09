/* ============================================================
   Link targets the character "presents". Structural data only — the WORDS
   (kicker/label/description) live per-locale in i18n.ts (STRINGS.links),
   keyed by `beat`. Adding a world later is one entry here + one row in
   BEAT_MAP (src/lib/beats.ts) + one copy block per locale in i18n.ts.
   ============================================================ */

import type { BeatId } from "./beats";
import { STRINGS, type Locale } from "./i18n";

/** Direction-agnostic, non-translatable parts of a link. */
export interface LinkStruct {
  /** Must match a Beat id in BEAT_MAP for the reveal to fire, and a key in STRINGS.links. */
  beat: BeatId;
  href: string;
  /** Inline SVG path data (24x24 viewBox) for a lightweight icon. */
  icon: string;
  /** External link opens in a new tab. */
  external?: boolean;
}

/** A fully-resolved card: structural data merged with localized copy. */
export interface LinkTarget extends LinkStruct {
  label: string;
  /** Short mono eyebrow / kicker above the label. */
  kicker: string;
  description: string;
}

export const LINKS: LinkStruct[] = [
  // World 1 — the anchor. Presented by the realistic Nehorai. See NARRATIVE.md.
  {
    beat: "portfolio",
    href: "https://ai.nehoraihadad.com",
    external: true,
    // arrow-up-right
    icon: "M7 17 17 7M7 7h10v10",
  },
  // World 2 — the engine. Presented by the pixel-art incarnation.
  {
    beat: "github",
    href: "https://github.com/NehoraiHadad",
    external: true,
    // git-branch
    icon: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M15 6a9 9 0 0 1-9 9",
  },
  // World 3 — the invitation. Presented by the anime incarnation. One direct,
  // low-friction channel: WhatsApp (wa.me uses intl format, no +).
  {
    beat: "contact",
    href: "https://wa.me/972547401660",
    external: true,
    // message-circle — the "let's chat" world
    icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
  // Add more worlds here — give each a unique `beat`, add a matching row to
  // BEAT_MAP, and a copy block per locale in i18n.ts; the card reveal wires up
  // automatically.
];

/** Merge each structural link with its localized copy for the given locale. */
export function localizedLinks(locale: Locale): LinkTarget[] {
  const copy = STRINGS[locale].links;
  return LINKS.map((link) => ({ ...link, ...copy[link.beat] }));
}
