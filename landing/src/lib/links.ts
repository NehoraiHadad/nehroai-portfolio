/* ============================================================
   Link targets the character "presents". Data-driven so adding a world
   later is one entry here + one row in BEAT_MAP (src/lib/beats.ts).
   ============================================================ */

import type { BeatId } from "./beats";

export interface LinkTarget {
  /** Must match a Beat id in BEAT_MAP for the reveal to fire. */
  beat: BeatId;
  label: string;
  /** Short mono eyebrow / kicker above the label. */
  kicker: string;
  description: string;
  href: string;
  /** Inline SVG path data (24x24 viewBox) for a lightweight icon. */
  icon: string;
  /** External link opens in a new tab. */
  external?: boolean;
}

export const LINKS: LinkTarget[] = [
  {
    beat: "portfolio",
    kicker: "AI · Engineering",
    label: "Portfolio",
    description: "Projects, experiments, and the things I build with AI.",
    href: "https://ai.nehoraihadad.com",
    external: true,
    // arrow-up-right
    icon: "M7 17 17 7M7 7h10v10",
  },
  // Add more worlds here — give each a unique `beat`, add a matching row to
  // BEAT_MAP, and the card reveal wires up automatically.
];
