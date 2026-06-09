/* ============================================================
   Beat orchestration — the sync layer between the "character" and the DOM.

   Design goal (Phase 1 -> Phase 2): the *source* of beats is decoupled from
   the *reaction* to beats. Reactions (cards flying in) listen on a DOM
   CustomEvent ("character:beat"). In Phase 1 a <video> drives those events via
   requestVideoFrameCallback. In Phase 2 a react-three-fiber timeline will call
   emitBeat(id) directly — the cards, and this whole onBeat() contract, stay
   exactly the same. Nothing downstream knows or cares where a beat came from.
   ============================================================ */

export type BeatId = string;

export interface Beat {
  /** Stable id; cards opt in via data-beat="<id>". */
  id: BeatId;
  /** Video timestamp (seconds) at which the character "presents" this target. */
  time: number;
  /** Match window (seconds). Loose sync — ±0.1s is imperceptible. */
  tolerance?: number;
}

const BEAT_EVENT = "character:beat";
const WORLD_EVENT = "character:world";
// User-driven control: "summon the character into this world" / "let go".
const GOTO_EVENT = "character:goto";
const RELEASE_EVENT = "character:release";
const DEFAULT_TOLERANCE = 0.12;

/**
 * World map — which "world" the character currently inhabits, as time RANGES
 * (a beat is a moment; a world is a span). Drives the whole-page theming +
 * active-card spotlight, switched at the morph moments so the page transforms
 * *with* the character. `until` = the world is active up to that timestamp.
 * After the last entry (the realistic return + loop wrap) we fall back to the
 * first world, so the loop re-themes to "portfolio" automatically.
 */
export const DEFAULT_WORLD: BeatId = "portfolio";
export const WORLD_MAP: { id: BeatId; until: number; seek: number }[] = [
  // `until` = auto-cycle boundary; `seek` = the dwell frame to jump to when the
  // USER summons this world (hover/focus a card) so the character is shown fully
  // incarnated in that style, not mid-morph.
  { id: "portfolio", until: 4.7, seek: 2.2 }, // realistic dwell
  { id: "github", until: 9.3, seek: 6.8 },    // pixel/code dwell
  { id: "contact", until: 13.6, seek: 11.4 }, // anime dwell
];

function worldAt(t: number): BeatId {
  for (const w of WORLD_MAP) if (t < w.until) return w.id;
  return DEFAULT_WORLD; // realistic return (13.6–14) + wrap -> back to first
}

/** Fire a world change. Phase 2 (R3F timeline) can call this directly too. */
export function emitWorld(id: BeatId): void {
  document.dispatchEvent(new CustomEvent(WORLD_EVENT, { detail: { id } }));
}

/** Subscribe to world changes. Returns an unsubscribe fn. */
export function onWorld(cb: (id: BeatId) => void): () => void {
  const handler = (e: Event) =>
    cb((e as CustomEvent<{ id: BeatId }>).detail.id);
  document.addEventListener(WORLD_EVENT, handler);
  return () => document.removeEventListener(WORLD_EVENT, handler);
}

/* ------------------------------------------------------------
   USER-DRIVEN CONTROL — the page is no longer a passive loop.
   gotoWorld(id): the user summoned this world (hovered/focused its card).
   We theme + present it IMMEDIATELY (works with or without a live video),
   and also signal the video island to scrub to that world's dwell and pause
   the auto-cycle. releaseWorld(): the user let go — resume the auto loop.
   ------------------------------------------------------------ */

/** Summon a world: theme + present now, and (if present) scrub the video to it. */
export function gotoWorld(id: BeatId): void {
  emitWorld(id);
  emitBeat(id);
  document.dispatchEvent(new CustomEvent(GOTO_EVENT, { detail: { id } }));
}

/** Stop summoning: hand control back to the auto-cycle. */
export function releaseWorld(): void {
  document.dispatchEvent(new CustomEvent(RELEASE_EVENT));
}

/**
 * Beat map — the single source of truth for "when does the character gesture
 * toward which target". Tune these timestamps to the real video. Order doesn't
 * matter. Add a row per new link card and give the card a matching data-beat.
 */
export const BEAT_MAP: Beat[] = [
  // Tuned to the real ~14s metamorphosis loop (character.webm). Each beat is
  // the moment that style's incarnation "presents" its card, mid-dwell:
  //   realistic dwell ~0–4.5s · pixel dwell ~5–9s · anime dwell ~9.5–13.5s.
  { id: "portfolio", time: 2.2 },  // realistic Nehorai presents the portfolio
  { id: "github", time: 6.8 },     // pixel-art incarnation presents GitHub
  { id: "contact", time: 11.4 },   // anime incarnation invites contact
];

/** Fire a beat. Phase 2 (R3F timeline) calls this directly. */
export function emitBeat(id: BeatId): void {
  document.dispatchEvent(
    new CustomEvent(BEAT_EVENT, { detail: { id } })
  );
}

/** Subscribe to a specific beat id. Returns an unsubscribe fn. */
export function onBeat(id: BeatId, cb: () => void): () => void {
  const handler = (e: Event) => {
    if ((e as CustomEvent<{ id: BeatId }>).detail?.id === id) cb();
  };
  document.addEventListener(BEAT_EVENT, handler);
  return () => document.removeEventListener(BEAT_EVENT, handler);
}

/**
 * Phase-1 beat SOURCE: watch a <video> and emit beats as its playhead crosses
 * each mapped timestamp. Uses requestVideoFrameCallback when available (frame-
 * accurate, reliable) and falls back to timeupdate on older engines.
 *
 * Returns a detach() fn. Safe to call before metadata loads.
 */
export function attachVideoBeats(
  video: HTMLVideoElement,
  beats: Beat[] = BEAT_MAP
): () => void {
  const fired = new Set<BeatId>();
  let rvfcHandle = 0;
  let detached = false;
  let lastTime = 0;
  let lastWorld: BeatId | null = null;
  // While the user is hovering/focusing a card we hold the character in that
  // world and freeze the auto-cycle so playback doesn't theme away from it.
  let override: BeatId | null = null;

  const check = (mediaTime: number) => {
    // Native `loop` doesn't reliably fire seeking/play, so detect the wrap
    // ourselves: when the playhead jumps backward, the cycle restarted —
    // clear so every beat replays on the next loop.
    if (mediaTime + 0.3 < lastTime) fired.clear();
    lastTime = mediaTime;

    // User is steering: keep the character ALIVE but locked in the summoned
    // world — loop a short window around its dwell frame so we get micro-motion
    // without drifting into the next style's morph. Don't re-theme meanwhile.
    if (override) {
      const w = WORLD_MAP.find((x) => x.id === override);
      if (w) {
        const idx = WORLD_MAP.indexOf(w);
        const start = idx > 0 ? WORLD_MAP[idx - 1].until : 0;
        const lo = Math.max(start, w.seek - 1.2);
        const hi = Math.min(w.until, w.seek + 1.2);
        if (mediaTime >= hi || mediaTime < lo) {
          try {
            video.currentTime = lo;
          } catch {
            /* not seekable yet */
          }
        }
      }
      return;
    }

    // World theming: emit only when the active world changes.
    const world = worldAt(mediaTime);
    if (world !== lastWorld) {
      lastWorld = world;
      emitWorld(world);
    }

    for (const beat of beats) {
      if (fired.has(beat.id)) continue;
      const tol = beat.tolerance ?? DEFAULT_TOLERANCE;
      if (Math.abs(mediaTime - beat.time) <= tol) {
        fired.add(beat.id);
        emitBeat(beat.id);
      }
    }
  };

  // Reset on loop / seek-to-start so beats replay each cycle.
  const onTimeReset = () => {
    if (video.currentTime < 0.3) fired.clear();
  };
  video.addEventListener("seeking", onTimeReset);
  video.addEventListener("play", onTimeReset);

  // User summons a world: jump the character to that style's dwell frame and
  // freeze the auto-cycle there. Theming already fired in gotoWorld().
  const onGoto = (e: Event) => {
    const id = (e as CustomEvent<{ id: BeatId }>).detail?.id;
    if (!id) return;
    override = id;
    const w = WORLD_MAP.find((x) => x.id === id);
    if (w && Number.isFinite(w.seek)) {
      try {
        video.currentTime = w.seek;
      } catch {
        /* metadata not ready yet — harmless, theming still applied */
      }
    }
  };
  // User let go: clear the freeze and force the next frame to re-emit the
  // world the playhead is actually in, so the page rejoins the auto-cycle.
  const onRelease = () => {
    override = null;
    lastWorld = null;
  };
  document.addEventListener(GOTO_EVENT, onGoto);
  document.addEventListener(RELEASE_EVENT, onRelease);

  const hasRVFC =
    typeof (video as HTMLVideoElement & {
      requestVideoFrameCallback?: unknown;
    }).requestVideoFrameCallback === "function";

  if (hasRVFC) {
    const loop: VideoFrameRequestCallback = (_now, metadata) => {
      if (detached) return;
      check(metadata.mediaTime);
      rvfcHandle = video.requestVideoFrameCallback(loop);
    };
    rvfcHandle = video.requestVideoFrameCallback(loop);
  } else {
    const onTimeUpdate = () => check(video.currentTime);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      detached = true;
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("seeking", onTimeReset);
      video.removeEventListener("play", onTimeReset);
      document.removeEventListener(GOTO_EVENT, onGoto);
      document.removeEventListener(RELEASE_EVENT, onRelease);
    };
  }

  return () => {
    detached = true;
    if (rvfcHandle) video.cancelVideoFrameCallback?.(rvfcHandle);
    video.removeEventListener("seeking", onTimeReset);
    video.removeEventListener("play", onTimeReset);
    document.removeEventListener(GOTO_EVENT, onGoto);
    document.removeEventListener(RELEASE_EVENT, onRelease);
  };
}

/**
 * Escape hatch for reduced-motion / autoplay-blocked / no-video: just reveal
 * everything at once so the page never sits in its hidden initial state.
 */
export function emitAllBeats(beats: Beat[] = BEAT_MAP): void {
  for (const beat of beats) emitBeat(beat.id);
}
