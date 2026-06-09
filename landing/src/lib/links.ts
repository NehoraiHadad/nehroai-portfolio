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
  // World 1 — the anchor. Presented by the realistic Nehorai. See NARRATIVE.md.
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
  // World 2 — the engine. Presented by the pixel-art incarnation.
  {
    beat: "github",
    kicker: "Code · Open source",
    label: "GitHub",
    description: "The source behind the work — repos, experiments, commits.",
    href: "https://github.com/NehoraiHadad",
    external: true,
    // git-branch
    icon: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M15 6a9 9 0 0 1-9 9",
  },
  // World 3 — the invitation. Presented by the anime incarnation. Swap the
  // mailto for a LinkedIn URL if you'd rather route contact there.
  {
    beat: "contact",
    kicker: "Say hello",
    label: "Let's talk",
    description: "Got an idea or a role in mind? Reach me directly.",
    href: "mailto:nehorai.hadad@gmail.com",
    // mail
    icon: "M2 4h20v16H2zM2 6l10 7 10-7",
  },
  // Add more worlds here — give each a unique `beat`, add a matching row to
  // BEAT_MAP, and the card reveal wires up automatically.
];
