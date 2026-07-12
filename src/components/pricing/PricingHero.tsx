"use client";

import { motion } from "framer-motion";

export default function PricingHero() {
  return (
    <section className="relative w-full bg-brand-bg overflow-hidden pt-12 pb-12 md:pt-16 md:pb-16 flex items-center justify-center">
      {/* Abstract Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-16 h-16 bg-brand-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center opacity-70"
        >
          {/* Mock abstract logo */}
          <div className="w-8 h-8 border-4 border-[#B63106] rounded-full opacity-40"></div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[15%] right-[15%] w-20 h-20 bg-brand-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center opacity-80"
        >
          {/* Slack-like mock icon */}
          <div className="flex flex-wrap w-8 h-8 gap-1 rotate-45">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[25%] w-14 h-14 bg-brand-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center opacity-60"
        >
          {/* Abstract icon */}
          <div className="w-6 h-6 bg-pink-400 rounded-lg rotate-12"></div>
        </motion.div>
      </div>

      <div className="relative max-w-[800px] mx-auto px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-block text-[13px] font-bold tracking-[0.2em] text-[#B63106] uppercase">
            Pricing
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-[72px] font-bold text-brand-text tracking-tight leading-[1.1] mb-8"
        >
          Hire legal talent your way.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-[21px] leading-[1.6] text-brand-text-secondary max-w-[720px] mx-auto"
        >
          Expand your reach with verified legal job listings, discover top candidates faster, and simplify hiring with solutions built for modern legal teams.
        </motion.p>
      </div>
    </section>
  );
}
