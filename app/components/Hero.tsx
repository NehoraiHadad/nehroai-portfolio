'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Terminal, Brain, Network, Database, Cpu, Sparkles } from 'lucide-react';
import { OpenAILogo, AnthropicLogo, GeminiLogo, N8nLogo, MetaLogo, PythonLogo, VercelLogo, DockerLogo, HuggingFaceLogo } from './TechLogos';
import { InteractiveAgent } from './InteractiveAgent';
import { useDictionary, useDirection } from '@/lib/i18n/provider';

const LATIN_SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}cxz=+*^?#';
const HEBREW_SCRAMBLE_CHARS = 'אבגדהוזחטיכלמנסעפצקרשת0123456789!?@#$%';
const HEBREW_CHAR_PATTERN = /[\u0590-\u05FF]/;

const getScrambleChars = (word: string) =>
  HEBREW_CHAR_PATTERN.test(word) ? HEBREW_SCRAMBLE_CHARS : LATIN_SCRAMBLE_CHARS;

const ScrambleText = ({ words, isRtl }: { words: string[]; isRtl: boolean }) => {
  const initialWord = words[0] ?? '';
  const [text, setText] = useState(initialWord);
  const [targetWord, setTargetWord] = useState(initialWord);

  useEffect(() => {
    if (words.length === 0) {
      return;
    }

    let currentIndex = 0;
    let scrambleInterval: NodeJS.Timeout;

    const cycleInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      const nextWord = words[currentIndex];
      setTargetWord(nextWord);
      let iteration = 0;

      clearInterval(scrambleInterval);
      const scrambleChars = getScrambleChars(nextWord);
      
      scrambleInterval = setInterval(() => {
        setText(nextWord.split('').map((char, index) => {
          if (index < Math.floor(iteration)) {
            return nextWord[index];
          }
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join(''));

        if (iteration >= nextWord.length) {
          clearInterval(scrambleInterval);
          setText(nextWord);
        }
        
        iteration += 1 / 3;
      }, 30);

    }, 4000);

    return () => {
      clearInterval(cycleInterval);
      clearInterval(scrambleInterval);
    };
  }, [words]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Invisible target word dictates the container width, preventing layout shifts */}
      <span className="invisible">{targetWord}</span>
      {/* Absolutely positioned scrambling text doesn't affect document flow */}
      <span
        className="absolute top-0 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        style={{ insetInlineStart: 0, textAlign: isRtl ? 'right' : 'left' }}
      >
        {text}
      </span>
    </span>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, easings: [0.22, 1, 0.36, 1] } 
  }
};

const wordVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.2 }
  }
};

const charVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)', 
    transition: { duration: 0.8, easings: [0.22, 1, 0.36, 1] } 
  }
};

// ============================================================
// RECESSED SYMBOLS — carved into the dark surface
// Invisible in darkness. Beam touches them → luminescent glow.
// Beam moves on → glow fades. That's the whole event.
// ============================================================

const ILLUMINATION_RADIUS = 28;

interface StageElementDef {
  id: number;
  content: string;
  icon?: React.ComponentType<{ className?: string }>;
  left: number;   // desktop position %
  top: number;
  size: number;
  depth: number;
  // Mobile overrides — on mobile (<lg) the chat is hidden so the full viewport is open.
  // If provided, these positions replace left/top on mobile.
  // If mobileHidden is true, the element is hidden on mobile entirely.
  mobileLeft?: number;
  mobileTop?: number;
  mobileHidden?: boolean;
}

// BEAM PHYSICS: The beam originates from the logo dot (top-left, ~8% left, ~4% top).
// It sweeps ~280° downward — reaching everywhere below and to the sides.
// Elements should be distributed within this natural cone.
//
// DESKTOP (lg+): 2-column grid.
//   - Left half: hero text (transparent bg — symbols show through)
//   - Right half: InteractiveAgent panel (opaque, ~52-87% left, ~18-82% top)
//   - Elements placed AROUND the panel: left half + above/below/edges of panel
//
// MOBILE (<lg): single column, no chat panel.
//   - Full width available for symbols
//   - mobileLeft/mobileTop spread elements across the viewport
//   - Some elements hidden to avoid text overlap
const STAGE_ELEMENTS: StageElementDef[] = [
  // ── Deep engravings — prominent, beam visits these often ──────────────────
  { id: 0,  content: 'LLM',  left: 30, top: 30, size: 22, depth: 0.9,
    mobileLeft: 75, mobileTop: 28 },
  { id: 1,  content: 'AI',   left: 42, top: 55, size: 28, depth: 1.0,
    mobileLeft: 60, mobileTop: 52 },
  { id: 2,  content: '',      icon: Brain, left: 65, top: 10, size: 24, depth: 0.95,
    mobileLeft: 85, mobileTop: 18 },

  // ── Medium engravings — scattered across both halves ──────────────────────
  { id: 3,  content: 'RAG',       left: 88, top: 88, size: 15, depth: 0.65,
    mobileLeft: 20, mobileTop: 85 },
  { id: 4,  content: '',  icon: OpenAILogo,    left: 48, top: 78, size: 18, depth: 0.7,
    mobileLeft: 50, mobileTop: 78 },
  { id: 5,  content: '',  icon: AnthropicLogo, left: 15, top: 60, size: 16, depth: 0.55,
    mobileLeft: 12, mobileTop: 62 },
  { id: 6,  content: 'Agents',    left: 92, top: 42, size: 14, depth: 0.6,
    mobileLeft: 82, mobileTop: 42 },
  { id: 7,  content: '',  icon: Network,       left: 22, top: 45, size: 18, depth: 0.55,
    mobileLeft: 15, mobileTop: 44 },
  { id: 8,  content: '',  icon: DockerLogo,    left: 75, top: 8,  size: 16, depth: 0.6,
    mobileLeft: 55, mobileTop: 12 },
  { id: 9,  content: '',  icon: GeminiLogo,    left: 55, top: 12, size: 16, depth: 0.5,
    mobileLeft: 35, mobileTop: 15 },

  // ── Shallow engravings — whisper-level, fill the gaps ─────────────────────
  { id: 10, content: 'GPT',       left: 50, top: 22, size: 11, depth: 0.35,
    mobileLeft: 70, mobileTop: 22 },
  { id: 11, content: '',  icon: PythonLogo,    left: 8,  top: 78, size: 14, depth: 0.4,
    mobileLeft: 8,  mobileTop: 75 },
  { id: 12, content: 'NLP',       left: 68, top: 90, size: 10, depth: 0.3,
    mobileLeft: 45, mobileTop: 88 },
  { id: 13, content: '',  icon: MetaLogo,      left: 10, top: 38, size: 14, depth: 0.35,
    mobileLeft: 90, mobileTop: 35 },
  { id: 14, content: '',  icon: VercelLogo,    left: 38, top: 38, size: 12, depth: 0.35,
    mobileLeft: 42, mobileTop: 36 },
  { id: 15, content: '',  icon: Database,      left: 92, top: 65, size: 14, depth: 0.4,
    mobileLeft: 78, mobileTop: 65 },
  { id: 16, content: '',  icon: HuggingFaceLogo, left: 30, top: 70, size: 14, depth: 0.35,
    mobileLeft: 30, mobileTop: 70 },
  { id: 17, content: 'ML',        left: 18, top: 28, size: 11, depth: 0.4,
    mobileLeft: 50, mobileTop: 30 },
  { id: 18, content: '',  icon: N8nLogo,       left: 82, top: 86, size: 14, depth: 0.35,
    mobileLeft: 70, mobileTop: 86 },
  { id: 19, content: '',  icon: Cpu,           left: 56, top: 88, size: 12, depth: 0.3,
    mobileLeft: 88, mobileTop: 82 },
  { id: 20, content: '',  icon: Sparkles,      left: 90, top: 25, size: 12, depth: 0.3,
    mobileLeft: 92, mobileTop: 55 },
  { id: 21, content: 'API',       left: 86, top: 12, size: 11, depth: 0.35,
    mobileLeft: 18, mobileTop: 92 },
  { id: 22, content: '',  icon: HuggingFaceLogo, left: 35, top: 88, size: 13, depth: 0.3,
    mobileHidden: true },
];

// Proximity — quadratic falloff from beam target
// Uses mobile positions when applicable
const computeProximity = (elIdx: number, targetIdx: number, mobile: boolean): number => {
  if (elIdx === targetIdx) return 1;
  const el = STAGE_ELEMENTS[elIdx];
  const tgt = STAGE_ELEMENTS[targetIdx];
  const elLeft = mobile && el.mobileLeft != null ? el.mobileLeft : el.left;
  const elTop = mobile && el.mobileTop != null ? el.mobileTop : el.top;
  const tgtLeft = mobile && tgt.mobileLeft != null ? tgt.mobileLeft : tgt.left;
  const tgtTop = mobile && tgt.mobileTop != null ? tgt.mobileTop : tgt.top;
  const dist = Math.sqrt((elLeft - tgtLeft) ** 2 + (elTop - tgtTop) ** 2);
  return Math.max(0, 1 - (dist / ILLUMINATION_RADIUS) ** 2);
};

// Fisher-Yates shuffle
const shuffleArray = (arr: number[]): number[] => {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
};

// A single engraved symbol.
// The LETTERS THEMSELVES are carved into the surface — no container.
// text-shadow creates the groove illusion (dark top edge + light bottom lip).
// When beam touches: phosphorescent glow fills the groove.
const RecessedSymbol = React.memo(({ el, brightness, isMobile }: {
  el: StageElementDef;
  brightness: number;
  isMobile: boolean;
}) => {
  const Icon = el.icon;
  const eff = Math.min(el.depth, brightness * el.depth);
  const dur = eff > 0.1 ? '1s' : '2s'; // fast ignition, slow decay

  // Use mobile positions when on small screens
  const posLeft = isMobile && el.mobileLeft != null ? el.mobileLeft : el.left;
  const posTop = isMobile && el.mobileTop != null ? el.mobileTop : el.top;

  const wrapperStyle: React.CSSProperties = {
    left: `${posLeft}%`,
    top: `${posTop}%`,
    transform: 'translate(-50%, -50%)',
  };

  if (Icon) {
    // ICON: dark depression + edge highlights + glow
    // Icon color slightly darker than bg = carved depression
    const iconColor = eff > 0.03
      ? `rgba(${8 + Math.round(eff * 15)},${8 + Math.round(eff * 18)},${12 + Math.round(eff * 20)},1)`
      : 'rgba(8,8,12,1)';

    const iconFilter = [
      // Bottom edge catches light (renders behind icon shape)
      `drop-shadow(0px 2px 2px rgba(255,255,255,${(0.03 + eff * 0.04).toFixed(3)}))`,
      // Phosphorescent glow from within
      ...(eff > 0.03 ? [
        `drop-shadow(0 0 ${(eff * 3).toFixed(1)}px rgba(34,211,238,${(eff * 0.3).toFixed(3)}))`,
        `drop-shadow(0 0 ${(eff * 8).toFixed(1)}px rgba(34,211,238,${(eff * 0.1).toFixed(3)}))`,
      ] : []),
    ].join(' ');

    return (
      <div
        id={`target-${el.id}`}
        className={`absolute select-none${el.mobileHidden ? ' hidden lg:block' : ''}`}
        style={wrapperStyle}
      >
        <div
          style={{
            width: el.size,
            height: el.size,
            color: iconColor,
            filter: iconFilter,
            transition: `color ${dur} ease-out, filter ${dur} ease-out`,
          }}
        >
          <Icon className="w-full h-full" />
        </div>
      </div>
    );
  }

  // === TEXT: "Simurai Carve" technique ===
  // color: transparent → text glyph invisible
  // background-clip: text → dark bg fills letter shapes = depression in surface
  // text-shadow renders BEHIND the dark text → peeks out at edges = groove highlights
  //
  // The text IS the surface. Not a separate element on top of it.

  // Depression fill — slightly darker than page bg (#131313)
  // When lit: hint of cyan tint in the depression floor
  const bgColor = eff > 0.03
    ? `rgba(${Math.round(3 + eff * 8)},${Math.round(3 + eff * 16)},${Math.round(5 + eff * 22)},${(0.55 + eff * 0.1).toFixed(2)})`
    : 'rgba(0,0,0,0.55)';

  const textShadow = [
    // Edge highlights — peek out from behind the dark text body
    // Bottom lip of groove catches light from above
    `0px 2px 3px rgba(255,255,255,${(0.035 + eff * 0.045).toFixed(3)})`,
    // Top edge — subtler highlight
    `0px -1px 1px rgba(255,255,255,${(0.015 + eff * 0.02).toFixed(3)})`,

    // Phosphorescent glow — emanates from within the groove
    // Because text-shadow is BEHIND the dark text body,
    // the glow peeks out at the edges = light inside the carved channel
    ...(eff > 0.03 ? [
      `0 0 ${(eff * 2).toFixed(1)}px rgba(34,211,238,${(eff * 0.35).toFixed(3)})`,
      `0 0 ${(eff * 6).toFixed(1)}px rgba(34,211,238,${(eff * 0.15).toFixed(3)})`,
      `0 0 ${(eff * 14).toFixed(1)}px rgba(34,211,238,${(eff * 0.05).toFixed(3)})`,
    ] : []),
  ].join(', ');

  return (
    <div
      id={`target-${el.id}`}
      className={`absolute select-none${el.mobileHidden ? ' hidden lg:block' : ''}`}
      style={wrapperStyle}
    >
      <span
        className="font-mono font-extrabold tracking-wider whitespace-nowrap"
        style={{
          fontSize: el.size,
          lineHeight: 1,
          color: 'transparent',
          backgroundColor: bgColor,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          textShadow: textShadow,
          transition: `background-color ${dur} ease-out, text-shadow ${dur} ease-out`,
        }}
      >
        {el.content}
      </span>
    </div>
  );
});
RecessedSymbol.displayName = 'RecessedSymbol';

// Select a random subset of elements per page load for variety
// 23 total elements; always show all deep ones + a random selection of the rest
const VISIBLE_COUNT = 19;

const IlluminationBackground = () => {
  const [beamStage, setBeamStage] = useState(0);
  const [activeTarget, setActiveTarget] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [justSettled, setJustSettled] = useState(false);
  const [beamState, setBeamState] = useState({ x: 0, y: 0, angle: 0, ready: false });
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile (below lg breakpoint = 1024px)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Random subset per page load — always include deep elements (depth >= 0.9)
  // Uses state + useEffect to avoid hydration mismatch (Math.random differs server vs client)
  const [visibleElements, setVisibleElements] = useState(STAGE_ELEMENTS);
  const hasRandomized = useRef(false);

  useEffect(() => {
    if (hasRandomized.current) return;
    hasRandomized.current = true;
    const must = STAGE_ELEMENTS.filter(e => e.depth >= 0.9);
    const rest = shuffleArray(
      STAGE_ELEMENTS.filter(e => e.depth < 0.9).map(e => e.id)
    ).slice(0, VISIBLE_COUNT - must.length);
    const ids = new Set([...must.map(e => e.id), ...rest]);
    setVisibleElements(STAGE_ELEMENTS.filter(e => ids.has(e.id)));
  }, []);

  // Randomized visit order — only visit visible elements
  const visitOrder = useRef(shuffleArray(visibleElements.map((_, i) => i)));
  const visitIndex = useRef(0);

  const getNextTarget = useCallback(() => {
    visitIndex.current = (visitIndex.current + 1) % visitOrder.current.length;
    if (visitIndex.current === 0) {
      const last = visitOrder.current[visitOrder.current.length - 1];
      do {
        visitOrder.current = shuffleArray(visibleElements.map((_, i) => i));
      } while (visitOrder.current[0] === last);
    }
    return visitOrder.current[visitIndex.current];
  }, [visibleElements]);

  // Sequence timing
  useEffect(() => {
    // Synced with logo-dot flashlight ignition:
    // Dot ignites at 3800ms, flash settles ~4400ms, then beam extends
    const t1 = setTimeout(() => setBeamStage(1), 4400);
    const t2 = setTimeout(() => setBeamStage(2), 5900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Randomized target cycling — recursive setTimeout for varied dwell
  useEffect(() => {
    if (beamStage < 2) return;
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Longer dwell gives the glow time to fully bloom and be appreciated
      const dwell = 4500 + Math.random() * 2000;
      timeoutId = setTimeout(() => {
        setIsMoving(true);
        setJustSettled(false);
        setActiveTarget(getNextTarget());
        // Gentle, unhurried travel — the beam is searching, not rushing
        const travel = 1500 + Math.random() * 800;
        setTimeout(() => {
          setIsMoving(false);
          // Brief bloom when beam arrives — brightness overshoot then relax
          setJustSettled(true);
          setTimeout(() => setJustSettled(false), 600);
        }, travel);
        scheduleNext();
      }, dwell);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [beamStage, getNextTarget]);

  // Beam angle tracking
  useEffect(() => {
    let raf: number;
    let lx = -999, ly = -999, la = -999;

    const track = () => {
      const dot = document.getElementById('logo-dot');
      const targetEl = visibleElements[activeTarget];
      const el = targetEl ? document.getElementById(`target-${targetEl.id}`) : null;
      if (dot && el) {
        const dr = dot.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        const ox = dr.left + dr.width / 2;
        const oy = dr.top + dr.height / 2;
        const dx = (er.left + er.width / 2) - ox;
        const dy = (er.top + er.height / 2) - oy;
        const a = Math.atan2(dx, dy) * (180 / Math.PI);
        if (Math.abs(lx - ox) > 0.5 || Math.abs(ly - oy) > 0.5 || Math.abs(la - a) > 0.5) {
          lx = ox; ly = oy; la = a;
          setBeamState({ x: ox, y: oy, angle: -a, ready: true });
        }
      }
      raf = requestAnimationFrame(track);
    };

    track();
    return () => cancelAnimationFrame(raf);
  }, [activeTarget, visibleElements]);

  // Scroll fade
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const globalOpacity = Math.max(0, 1 - scrollY / 400);
  if (globalOpacity === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: globalOpacity }}>
      {/* Beam — softer, more atmospheric */}
      {beamState.ready && createPortal(
        <motion.div
          className="fixed pointer-events-none z-[60]"
          style={{
            top: beamState.y,
            left: beamState.x,
            width: '1500px',
            height: '150vh',
            x: '-50%',
            transformOrigin: 'top center',
            background: 'linear-gradient(180deg, rgba(34,211,238,0.25) 0%, rgba(34,211,238,0.12) 15%, rgba(34,211,238,0.04) 40%, rgba(34,211,238,0.01) 60%, transparent 100%)',
            filter: 'blur(8px)',
          }}
          initial={{ opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 0%, 50% 0%)', rotate: 0 }}
          animate={{
            opacity: beamStage > 0 ? globalOpacity * 0.75 : 0,
            clipPath: beamStage === 0
              ? 'polygon(50% 0%, 50% 0%, 50% 0%, 50% 0%)'
              : beamStage === 1
                ? 'polygon(50% 0%, 50% 0%, 51% 100%, 49% 100%)'
                : isMoving
                  ? 'polygon(50% 0%, 50% 0%, 55% 100%, 45% 100%)'
                  : 'polygon(50% 0%, 50% 0%, 52% 100%, 48% 100%)',
            rotate: beamState.angle,
          }}
          transition={{
            opacity: { duration: 0.5 },
            clipPath: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            rotate: { type: "spring", stiffness: 18, damping: 22 },
          }}
        />,
        document.body
      )}

      {/* Recessed symbols — carved into the dark surface */}
      {/* No max-width constraint here: right-column elements (left: 55–95%) must
          reach their viewport positions without being clipped by the content frame. */}
      <div className="absolute inset-0">
        {visibleElements.map((element) => {
          const isActive = beamStage === 2;
          // Proximity uses actual element positions (not array index) via STAGE_ELEMENTS lookup
          const targetEl = visibleElements[activeTarget];
          const raw = isActive && targetEl
            ? computeProximity(element.id, targetEl.id, isMobile)
            : 0;
          // Dim during movement, brief bloom on settle, normal otherwise
          const brightness = isMoving
            ? raw * 0.3
            : justSettled
              ? Math.min(1, raw * 1.25)
              : raw;

          return (
            <RecessedSymbol
              key={element.id}
              el={element}
              brightness={brightness}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
};

export const Hero = () => {
  const { hero } = useDictionary();
  const direction = useDirection();
  const isRtl = direction === 'rtl';
  const CtaArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 min-h-[90vh]">
      <IlluminationBackground />
      {/* Text Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-start"
        style={{ textAlign: 'start' }}
      >
        <motion.div variants={item} className="flex items-center gap-2 mb-6 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
            {hero.statusLabel}
          </span>
        </motion.div>
        
        <div className="text-5xl md:text-7xl font-bold text-zinc-100 mb-6 tracking-tight leading-tight">
          <motion.div variants={wordVariants} initial="hidden" animate="show" className="inline-block overflow-hidden pb-2">
            {hero.titlePrefix.split('').map((char, i) => (
              <motion.span key={i} variants={charVariants} className="inline-block">
                {char}
              </motion.span>
            ))}
          </motion.div>
          <br />
          <motion.div variants={item} className="inline-block overflow-hidden pb-2">
            <ScrambleText words={hero.rotatingWords} isRtl={isRtl} />
          </motion.div>
        </div>
        
        <motion.h2 variants={item} className="text-xl md:text-2xl text-zinc-400 mb-6 font-light leading-relaxed">
          {hero.subtitle}
        </motion.h2>

        <motion.p variants={item} className="text-lg text-zinc-500 max-w-xl mb-10">
          {hero.body}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#showcase"
            className="w-full sm:w-auto bg-cyan-500 text-zinc-950 px-8 py-3.5 rounded-xl font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
          >
            {hero.primaryCta} <CtaArrow className="w-4 h-4" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#dossier"
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-700 text-zinc-100 px-8 py-3.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            {hero.secondaryCta}
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Interactive Agent Visual */}
      <motion.div 
        initial={{ opacity: 0, x: isRtl ? -40 : 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden lg:block"
      >
        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
        <InteractiveAgent />
      </motion.div>
    </section>
  );
};
