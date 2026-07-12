"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { wordPullUpVariants, EASE_OUT_EXPO } from "@/lib/animations";

interface WordsPullUpProps {
  text: string;
  className?: string;
  /** Optional superscript asterisk after the very last character of the last word */
  showAsterisk?: boolean;
  /** Delay before the entire animation starts (seconds) */
  startDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  startDelay = 0,
  as: Tag = "span",
}: WordsPullUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-80px" });
  const words = text.split(" ");

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={`inline-flex flex-wrap ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="overflow-hidden inline-block mr-[0.25em] last:mr-0"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block"
            custom={i}
            variants={wordPullUpVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ transitionDelay: `${startDelay}s` }}
          >
            {/* On the last word, optionally append superscript */}
            {i === words.length - 1 && showAsterisk ? (
              <span className="relative">
                {word}
                <sup
                  className="absolute text-[0.28em] text-brand leading-none"
                  style={{ top: "0.65em", right: "-0.35em" }}
                >
                  *
                </sup>
              </span>
            ) : (
              word
            )}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
