"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { WordsPullUp } from "./WordsPullUp";

import { EASE_OUT_EXPO } from "@/lib/animations";

export function HeroSection() {
  return (
    <section
      className="relative w-full bg-[#0B0B0B] p-3 sm:p-4 md:p-5"
      aria-label="Hero"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {/* ── Inner inset container ── */}
      <div className="relative w-full h-full min-h-[calc(100vh-64px-40px)] rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#0B0B0B] border border-[#1A1A1A]">

        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0 opacity-[0.55] mix-blend-overlay pointer-events-none z-10" aria-hidden="true" />

        {/* Ambient gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(217,72,15,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(217,72,15,0.04) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* Bottom gradient to ground the content */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-[6]"
          style={{ background: "linear-gradient(to top, rgba(11,11,11,0.8) 0%, transparent 100%)" }}
          aria-hidden="true"
        />

        {/* ── Grid lines decorative ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[4] opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
          aria-hidden="true"
        />

        {/* ── Main content ── */}
        <div className="absolute inset-0 z-20 flex items-center px-6 md:px-10 lg:px-16">
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col gap-6 md:gap-7">
            <div>
              <WordsPullUp
                text="Where Legal Talent Meets Opportunity."
                as="h1"
                className="text-[9vw] sm:text-[8vw] md:text-[6.8vw] lg:text-[5.6vw] xl:text-[4.6vw] font-bold leading-[1.1] tracking-[-0.03em] text-white block w-full font-poppins"
              />
              <motion.p
                className="text-sm sm:text-base text-[#CBD5E1]/50 font-semibold tracking-widest uppercase mt-4 ml-1 hidden lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                Legal Career Platform · Since 2024
              </motion.p>
            </div>

            <motion.p
              className="text-[#CBD5E1]/70 text-base sm:text-lg leading-relaxed font-medium max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              Connecting law students, lawyers, law firms, and recruiters through one intelligent hiring platform.
            </motion.p>

            {/* CTA row */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              {/* Primary CTA pill */}
              <Link href="/signup/candidate?mode=login" className="group">
                <div className="flex items-center gap-2 bg-[#D9480F] rounded-full pl-5 pr-2 py-2 group-hover:gap-3 transition-all duration-300">
                  <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap">
                    Explore Jobs
                  </span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </Link>

              {/* Secondary CTA pill */}
              <Link href="/signup/recruiter?mode=login" className="group">
                <div className="flex items-center gap-2 border border-[#2A2A2A] rounded-full pl-5 pr-2 py-2 hover:border-[#D9480F]/40 group-hover:gap-3 transition-all duration-300 bg-[#121212]/50 backdrop-blur-sm">
                  <span className="text-white/80 font-bold text-sm sm:text-base whitespace-nowrap">
                    Hire Talent
                  </span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:scale-110 group-hover:border-[#D9480F]/40 transition-all duration-300 shrink-0">
                    <ArrowRight size={14} className="text-white/60" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>


      </div>
    </section>
  );
}
