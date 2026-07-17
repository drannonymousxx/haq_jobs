"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GradientBackground } from "./GradientBackground";
import { AnimatedOrbit } from "./AnimatedOrbit";
import { AnimatedCounter } from "./AnimatedCounter";
import { PlatformTicker } from "./PlatformTicker";

export default function HomeOrbitSection() {
  // Entrance animations for the left content column
  const contentStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const textFadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // cubic-bezier(0.22, 1, 0.36, 1)
      },
    },
  };

  const buttonFadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#0B0B0B] border-t border-[#1A1A1A] py-20 lg:py-28 px-6 md:px-10 lg:px-16 flex flex-col gap-14 lg:gap-20"
      aria-label="Legal Hiring Ecosystem"
    >
      {/* Animated gradient drifting light layer */}
      <GradientBackground />

      {/* Main Grid Wrapper */}
      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* LEFT COLUMN: Headline & Messaging & CTAs */}
        <motion.div 
          className="lg:col-span-5 flex flex-col items-start text-left"
          variants={contentStaggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Tagline label */}
          <motion.span 
            variants={textFadeUpVariants}
            className="text-xs font-black uppercase tracking-widest text-[#D9480F] mb-4"
          >
            HAQJobs Legal Hiring Ecosystem
          </motion.span>

          {/* Premium Headline */}
          <motion.h2 
            variants={textFadeUpVariants}
            className="text-4xl sm:text-5xl lg:text-[2.85rem] xl:text-[3.25rem] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-6 font-poppins"
          >
            One Platform.<br />
            Every Legal <span className="text-[#D9480F] italic font-bold">Opportunity.</span>
          </motion.h2>

          {/* Supporting Copy */}
          <motion.p 
            variants={textFadeUpVariants}
            className="text-base sm:text-lg text-[#CBD5E1]/70 leading-relaxed mb-8 max-w-lg"
          >
            A modern platform connecting law students, lawyers, recruiters, law firms, and legal departments. Interviews, applications, messaging, AI-powered matching, and hiring workflows—all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={buttonFadeUpVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            {/* Primary Button */}
            <Link 
              href="/signup/candidate?mode=login"
              className="relative px-8 py-3.5 rounded-xl font-bold bg-[#D9480F] text-white hover:bg-[#B63106] transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,72,15,0.4)] flex items-center justify-center gap-2 group whitespace-nowrap text-sm cursor-pointer"
            >
              Explore Opportunities
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            {/* Secondary Button */}
            <Link 
              href="/signup/recruiter?mode=login"
              className="relative px-8 py-3.5 rounded-xl font-bold bg-transparent text-white border border-[#2A2A2A] hover:border-[#D9480F]/60 transition-all duration-300 hover:bg-zinc-900/40 flex items-center justify-center gap-2 group whitespace-nowrap text-sm cursor-pointer"
            >
              Hire Legal Talent
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: Orbits & Center stats */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
          {/* Centered scaling orbit workspace to handle responsiveness cleanly */}
          <div className="relative w-[650px] h-[650px] flex items-center justify-center scale-[0.62] xs:scale-[0.72] sm:scale-[0.8] md:scale-[0.88] lg:scale-100 transition-transform duration-500 origin-center">
            {/* Concentric rotating rings and PNG logos */}
            <AnimatedOrbit />



            {/* Central glassmorphic count-up stat */}
            <AnimatedCounter 
              targetValue={25} 
              label="Verified Legal Professionals" 
              suffix="K+" 
              size={165} 
              entranceDelay={0.3} 
            />
          </div>
        </div>

      </div>

      {/* BOTTOM TICKER: Infinite marquee partner law firms */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.2 }}
        className="relative z-10 w-full mt-6"
      >
        <PlatformTicker />
      </motion.div>
    </section>
  );
}
