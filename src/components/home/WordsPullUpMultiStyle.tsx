"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { EASE_OUT_EXPO, STAGGER_WORD } from "@/lib/animations";

export interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  containerClassName?: string;
  startDelay?: number;
}

export function WordsPullUpMultiStyle({
  segments,
  containerClassName = "",
  startDelay = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-80px" });

  // Flatten all words while tracking their segment className
  const allWords: Array<{ word: string; className: string }> = [];
  segments.forEach(({ text, className = "" }) => {
    text.split(" ").forEach((word) => {
      allWords.push({ word, className });
    });
  });

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-1 ${containerClassName}`}
      aria-label={segments.map((s) => s.text).join(" ")}
    >
      {allWords.map(({ word, className }, i) => (
        <span
          key={i}
          className="overflow-hidden inline-block"
          aria-hidden="true"
        >
          <motion.span
            className={`inline-block ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: EASE_OUT_EXPO,
                      delay: startDelay + i * STAGGER_WORD,
                    },
                  }
                : { opacity: 0, y: 20 }
            }
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
