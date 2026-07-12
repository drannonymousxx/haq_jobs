"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AnimatedLettersProps {
  text: string;
  className?: string;
}

/**
 * Scroll-linked per-character opacity reveal.
 * As the user scrolls through this element, each character
 * progressively transitions from dim (0.15) to fully opaque (1).
 */
export function AnimatedLetters({ text, className = "" }: AnimatedLettersProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.2"],
  });

  const chars = text.split("");
  const total = chars.length;

  return (
    <p
      ref={ref}
      className={className}
      aria-label={text}
    >
      {chars.map((char, i) => {
        const charProgress = i / total;
        // Each character has its own opacity range based on its position
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(
          scrollYProgress,
          [charProgress - 0.1, charProgress + 0.08],
          [0.15, 1]
        );
        return (
          <motion.span
            key={i}
            style={{ opacity }}
            className="inline-block"
            aria-hidden="true"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        );
      })}
    </p>
  );
}
