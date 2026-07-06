"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CompaniesHero() {
  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-block text-[13px] font-bold tracking-[0.2em] text-[#B63106] uppercase">
            For Law Firms, Startups & Legal Teams
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-[76px] font-bold text-brand-text tracking-tight leading-[1.05] max-w-[1000px] mb-12"
        >
          The complete platform to discover, hire & manage top legal talent
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mb-10"
        >
          <span className="inline-block text-[13px] font-bold tracking-[0.15em] text-[#B63106] uppercase">
            Start hiring in minutes
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/post-job"
            className="w-full sm:w-auto px-8 py-4 bg-[#191D20] text-white rounded-xl font-semibold text-[15px] hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(25,29,32,0.4)] transition-all duration-300 flex items-center justify-center"
          >
            Post a job
          </Link>
          <Link
            href="/for-companies/demo"
            className="w-full sm:w-auto px-8 py-4 bg-brand-card text-brand-text rounded-xl font-semibold text-[15px] border border-brand-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:bg-[#F8FAFC] hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-center"
          >
            Book a demo
          </Link>
        </motion.div>

      </div>

      {/* Background gradients for premium SaaS feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-white to-transparent opacity-60 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#EEF2FF] rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#FFF5F3] rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Subtle Divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent"></div>
    </section>
  );
}
