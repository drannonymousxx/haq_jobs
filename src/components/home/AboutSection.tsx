"use client";

import React from "react";
import { motion } from "framer-motion";
import { WordsPullUpMultiStyle } from "./WordsPullUpMultiStyle";
import { AnimatedLetters } from "./AnimatedLetters";
import { fadeUpVariants, EASE_OUT_EXPO } from "@/lib/animations";

const STATS = [
  { value: "12,000+", label: "Legal Professionals" },
  { value: "800+",    label: "Verified Employers" },
  { value: "2,400+",  label: "Jobs Posted" },
  { value: "94%",     label: "Placement Rate" },
];

const ABOUT_PARAGRAPH =
  "Over the last two years, we have worked alongside law students, senior lawyers, and top-tier law firms across India and internationally — building the infrastructure for modern legal hiring that the profession deserves. We believe that legal careers should be defined by talent, not by access.";

export function AboutSection() {
  return (
    <section
      id="about"
      className="bg-[#0B0B0B] py-16 md:py-24 lg:py-32"
      aria-label="About HAQJobs"
    >
      {/* Inner card */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20">

          {/* Label */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-center gap-2 mb-10 md:mb-14"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#D9480F]" aria-hidden="true" />
            <span className="text-[10px] sm:text-xs font-black text-[#D9480F] uppercase tracking-[0.2em]">
              Legal Technology
            </span>
          </motion.div>

          {/* Pull-up multi-style heading */}
          <div className="mb-12 md:mb-16">
            <WordsPullUpMultiStyle
              containerClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] sm:leading-[0.9] font-bold text-center mx-auto max-w-5xl"
              segments={[
                {
                  text: "HAQJobs is",
                  className: "text-white font-bold",
                },
                {
                  text: "built for legal careers.",
                  className: "text-[#D9480F] italic font-bold",
                },
                {
                  text: "We exist to make legal hiring transparent, fast, and accessible.",
                  className: "text-[#CBD5E1]/50 font-normal",
                },
              ]}
            />
          </div>

          {/* Scroll-linked char reveal paragraph */}
          <AnimatedLetters
            text={ABOUT_PARAGRAPH}
            className="text-sm sm:text-base md:text-lg text-[#CBD5E1] font-medium leading-relaxed max-w-3xl mx-auto text-center"
          />

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 pt-10 border-t border-[#2A2A2A]">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col gap-1 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: EASE_OUT_EXPO }}
              >
                <span className="text-3xl md:text-4xl font-black text-white font-poppins tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold text-[#CBD5E1]/50 uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
