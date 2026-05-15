"use client";

import { motion } from "framer-motion";

export default function JobSeekerHero() {
  return (
    <section className="pt-16 pb-16 md:pt-20 md:pb-24 flex flex-col items-center justify-center text-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        <span className="text-sm md:text-sm font-semibold tracking-widest text-[#013CF1] uppercase mb-4 block">
          Discover Your Next Opportunity
        </span>
        <h1 className="text-[3rem] md:text-[5rem] font-bold tracking-tight text-[#191D20] leading-[1.05] mb-6">
          Find Legal Jobs Built For You
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <p className="text-lg md:text-xl text-[#191D20]/70 mb-10 leading-relaxed">
          We make it easier to discover internships, remote roles, legal opportunities, and career paths from top law firms and fast-growing startups.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="flex flex-row items-center justify-center gap-4 md:gap-5 w-full"
      >
        <button className="px-6 md:px-7 py-3 min-w-[180px] bg-[#013CF1] text-white rounded-xl font-medium text-[15px] md:text-[16px] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
          Create Your Profile
        </button>
        <button className="px-6 md:px-7 py-3 min-w-[180px] bg-white border border-[#E2E8F0] text-[#191D20] rounded-xl font-medium text-[15px] md:text-[16px] hover:border-[#191D20] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
          Browse Jobs
        </button>
      </motion.div>

    </section>
  );
}
