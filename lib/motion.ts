/**
 * Shared motion constants — canonical easing arrays for the `motion` library.
 *
 * `easings:` was a dead key (ignored by motion/react); correct key is `ease:`.
 * Import these here so all components agree on the curves.
 */

/** Smooth deceleration — entrances, reveals. CSS: var(--ease-out) */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Spring overshoot — interactive feedback, hero title characters. CSS: var(--ease-spring) */
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

/** Standard transition object for entrances */
export const TRANSITION_EASE_OUT = {
  duration: 0.8,
  ease: EASE_OUT,
} as const;
