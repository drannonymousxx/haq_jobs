"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { cardEntranceVariants, staggerContainerVariants, listItemVariants } from "@/lib/animations";

export interface FeatureCardData {
  index: number;
  number: string;
  title: string;
  description: string;
  checkItems: string[];
  /** If provided, this element is rendered instead of a text card body */
  visualSlot?: React.ReactNode;
}

interface FeatureCardProps {
  data: FeatureCardData;
  cardIndex: number;
}

export function FeatureCard({ data, cardIndex }: FeatureCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-80px" });

  if (data.visualSlot) {
    // First card — full visual slot (e.g. HeroDashboard)
    return (
      <motion.div
        ref={ref}
        custom={cardIndex}
        variants={cardEntranceVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative rounded-2xl overflow-hidden h-[420px] lg:h-full"
      >
        {data.visualSlot}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      custom={cardIndex}
      variants={cardEntranceVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col h-[420px] lg:h-full group hover:border-[#D9480F]/30 transition-colors duration-300"
    >
      {/* Number tag */}
      <span className="text-[10px] font-black text-[#CBD5E1]/40 uppercase tracking-[0.2em] mb-4">
        {data.number}
      </span>

      {/* Title */}
      <h3 className="text-[18px] font-bold text-white leading-tight mb-3 font-poppins">
        {data.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-[#CBD5E1]/60 leading-relaxed mb-5 font-medium">
        {data.description}
      </p>

      {/* Checklist */}
      <motion.ul
        className="flex flex-col gap-2.5 flex-1"
        variants={staggerContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {data.checkItems.map((item, i) => (
          <motion.li
            key={i}
            variants={listItemVariants}
            className="flex items-start gap-2.5 text-[13px] text-[#CBD5E1]/70 font-medium"
          >
            <Check
              size={13}
              className="text-[#D9480F] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            {item}
          </motion.li>
        ))}
      </motion.ul>

      {/* Learn more link */}
      <div className="mt-5 pt-4 border-t border-[#2A2A2A]">
        <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#CBD5E1]/50 group-hover:text-white transition-colors">
          Learn more
          <ArrowUpRight
            size={13}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>
    </motion.div>
  );
}
