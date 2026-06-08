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
const DEFAULT_TOLERANCE = 0.12;

/**
 * Beat map — the single source of truth for "when does the character gesture
 * toward which target". Tune these timestamps to the real video. Order doesn't
 * matter. Add a row per new link card and give the card a matching data-beat.
 */
export const BEAT_MAP: Beat[] = [
  { id: "portfolio", time: 1.6 },
  // { id: "github",  time: 3.4 },   // <- future targets: add here + a card
  // { id: "contact", time: 5.1 },
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

  const check = (mediaTime: number) => {
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
    };
  }

  return () => {
    detached = true;
    if (rvfcHandle) video.cancelVideoFrameCallback?.(rvfcHandle);
    video.removeEventListener("seeking", onTimeReset);
    video.removeEventListener("play", onTimeReset);
  };
}

/**
 * Escape hatch for reduced-motion / autoplay-blocked / no-video: just reveal
 * everything at once so the page never sits in its hidden initial state.
 */
export function emitAllBeats(beats: Beat[] = BEAT_MAP): void {
  for (const beat of beats) emitBeat(beat.id);
}
