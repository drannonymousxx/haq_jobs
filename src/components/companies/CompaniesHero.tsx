"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import EditorialText from "@/components/ui/EditorialText";

export default function CompaniesHero() {
  return (
    <section className="relative w-full bg-brand-bg overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
      {/* Background gradients for premium SaaS feel */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,49,6,0.07)_0%,transparent_65%)] pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-[#1D4ED8] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-center flex flex-col items-center select-none">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-block text-[13px] font-bold tracking-[0.2em] text-brand uppercase">
            For Law Firms, Startups & Legal Teams
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-[76px] font-extrabold text-brand-text tracking-tight leading-[1.05] max-w-[1000px] mb-12 font-poppins"
        >
          <EditorialText text="The complete platform to discover, hire & manage *top legal talent*" />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mb-10"
        >
          <span className="inline-block text-[13px] font-bold tracking-[0.15em] text-brand uppercase">
            Start hiring in minutes
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-10"
        >
          <Link
            href="/signup/recruiter"
            className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-xl font-bold text-[15px] hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(182,49,6,0.35)] hover:-translate-y-[1px] transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            Post a job
          </Link>
          <Link
            href="/signup/recruiter"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white rounded-xl font-bold text-[15px] border border-white/20 hover:bg-white/10 hover:border-white/40 hover:-translate-y-[1px] transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            Book a demo
          </Link>
        </motion.div>

      </div>

      {/* Subtle Divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#B63106]/20 to-transparent"></div>
    </section>
  );
}
