import type { Variants, Transition } from "framer-motion";

// ─── Shared Easing Curves ────────────────────────────────────────────────────
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_INOUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Shared Transitions ───────────────────────────────────────────────────────
export const TRANSITION_BASE: Transition = {
  duration: 0.7,
  ease: EASE_OUT_EXPO,
};

export const TRANSITION_FAST: Transition = {
  duration: 0.4,
  ease: EASE_OUT_EXPO,
};

export const TRANSITION_SLOW: Transition = {
  duration: 1.1,
  ease: EASE_OUT_EXPO,
};

// ─── Stagger Timing ───────────────────────────────────────────────────────────
export const STAGGER_WORD = 0.08;   // per-word stagger in pull-up text
export const STAGGER_CARD = 0.15;   // per-card stagger in feature grid
export const STAGGER_ITEM = 0.06;   // per-item stagger for list items

// ─── Reusable Framer Motion Variants ─────────────────────────────────────────

/** Fade and slide up — generic section reveal */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

/** Per-word pull-up — used by WordsPullUp components */
export const wordPullUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE_OUT_EXPO,
      delay: i * STAGGER_WORD,
    },
  }),
};

/** Scale + fade entrance — used by feature cards */
export const cardEntranceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: EASE_OUT_QUINT,
      delay: i * STAGGER_CARD,
    },
  }),
};

/** Float loop animate object — use directly on motion.div animate prop */
export function getFloatAnimation(offset = 0) {
  return {
    y: [0, -10, 0],
    transition: {
      duration: 5 + offset,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: offset * 0.4,
    },
  };
}

/** Staggered container for lists */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_ITEM,
      delayChildren: 0.1,
    },
  },
};

/** Per-item list variant */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITION_FAST,
  },
};
