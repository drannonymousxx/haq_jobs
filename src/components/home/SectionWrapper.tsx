"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants } from "@/lib/animations";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Skip the default fade-up entrance animation */
  noAnimation?: boolean;
}

/**
 * Reusable section wrapper that enforces consistent vertical spacing
 * and provides a standard fade-up reveal animation.
 * Every homepage section should use this as its outermost element.
 */
export function SectionWrapper({ children, className = "", id, noAnimation = false }: SectionWrapperProps) {
  const ref = React.useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" });

  if (noAnimation) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

/** Inner content container — max-width + horizontal padding */
export function SectionContainer({
  children,
  className = "",
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use a wider max-width (1400px vs default 1200px) */
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${wide ? "max-w-[1400px]" : "max-w-[1200px]"} ${className}`}
    >
      {children}
    </div>
  );
}
