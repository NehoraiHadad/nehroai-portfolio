/**
 * Shared choreography timeline constants.
 *
 * These values are synced across TopNav (dot ignition) and Hero (beam stages)
 * so the logo flash → beam extension sequence always fires in the right order.
 *
 * Timeline:
 *   0ms         — page load
 *   ~3500ms     — neon "ai" ignition CSS animation completes
 *   3800ms      — dotIgnite: logo dot flashes on (flashlight-active CSS animation starts)
 *   4400ms      — beamStage1: beam becomes a thin needle (clipPath narrows)
 *   5900ms      — beamStage2: beam opens to full width and starts sweeping targets
 */
export const TIMELINE = {
  /** Logo dot ignition — synced to end of neon CSS animation + 300ms buffer */
  dotIgnite: 3800,
  /** Beam stage 1 — thin needle appears from dot (~600ms after dot ignites) */
  beamStage1: 4400,
  /** Beam stage 2 — beam fans open and target cycling begins */
  beamStage2: 5900,
} as const;
