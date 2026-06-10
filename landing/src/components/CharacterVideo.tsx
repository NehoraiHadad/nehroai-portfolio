import { useEffect, useRef, useState } from "react";
import { attachVideoBeats, emitAllBeats } from "../lib/beats";

/* ============================================================
   CharacterVideo — THE HEART of the page (Phase 1).

   >>> PHASE 2 SWAP POINT <<<
   In Phase 2 the *body* of this component is replaced by a
   react-three-fiber <Canvas> driving a 3D rig. Keep the contract:
     1. It is the only client island in the layout.
     2. It owns the "stage" box and emits beats (attachVideoBeats here;
        a timeline.on('beat') -> emitBeat(id) there).
   Everything outside this file (layout, cards, styles, deploy) is untouched
   by that swap. Do NOT leak video specifics into siblings.

   The video supports two visual modes from one component:
     • transparent (WebM/HEVC alpha) — character floats, no box. `mode="alpha"`
     • rectangular blended into the page — `mode="framed"` adds a radial
       edge-mask + glow so a normal H.264 clip melts into the navy background.
   Decide per the real clip; default is "framed" (always safe, universal).
   ============================================================ */

export type StageMode = "alpha" | "framed";

interface Sources {
  /** VP9/AV1 alpha WebM — Chrome/Firefox/Edge. */
  webm?: string;
  /** HEVC-with-alpha MOV/MP4 — Safari. */
  hevc?: string;
  /** Universal H.264 MP4 — fallback + the "framed" rectangular clip. */
  mp4?: string;
}

interface Props {
  poster: string;
  sources: Sources;
  mode?: StageMode;
  /** Accessible description of the looping character. */
  label?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function CharacterVideo({
  poster,
  sources,
  mode = "framed",
  label = "Animated portrait of Nehorai welcoming you",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [staticOnly, setStaticOnly] = useState(false);

  useEffect(() => {
    // Mount effect runs strictly AFTER hydration → signal sibling scripts (the
    // A/B vote) that it's now safe to mutate the <video> sources without
    // tripping a hydration mismatch against the SSR default. Flag covers late
    // listeners; the event covers listeners already attached.
    (window as unknown as { __characterHydrated?: boolean }).__characterHydrated =
      true;
    document.dispatchEvent(new CustomEvent("character:hydrated"));

    const video = videoRef.current;
    if (!video) return;

    // No motion wanted / no real clip yet -> show poster, reveal all cards now.
    if (prefersReducedMotion()) {
      setStaticOnly(true);
      emitAllBeats();
      return;
    }

    const detach = attachVideoBeats(video);

    // If no source can play (missing/placeholder clip, 404), fall back to the
    // poster and reveal the cards so the page never sits half-built.
    const onFail = () => {
      setStaticOnly(true);
      emitAllBeats();
    };
    video.addEventListener("error", onFail);

    // Autoplay can be blocked; if so, also fall back to poster + reveal cards.
    const tryPlay = async () => {
      try {
        await video.play();
        setReady(true);
      } catch {
        onFail();
      }
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });

    return () => {
      detach();
      video.removeEventListener("error", onFail);
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  return (
    <div
      className="character"
      data-mode={mode}
      data-ready={ready ? "true" : "false"}
    >
      {/* Soft glow pad behind the character — survives into Phase 2 */}
      <div className="character__glow" aria-hidden="true" />

      {staticOnly ? (
        <img className="character__media" src={poster} alt={label} />
      ) : (
        <video
          ref={videoRef}
          className="character__media"
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label={label}
        >
          {sources.webm && (
            <source src={sources.webm} type="video/webm" />
          )}
          {sources.hevc && (
            <source
              src={sources.hevc}
              type='video/mp4; codecs="hvc1"'
            />
          )}
          {sources.mp4 && <source src={sources.mp4} type="video/mp4" />}
        </video>
      )}
    </div>
  );
}
