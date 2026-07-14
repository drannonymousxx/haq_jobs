"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EditorialText from "@/components/ui/EditorialText";

export default function JobSeekerHero() {
  return (
    <section className="pt-16 pb-16 md:pt-20 md:pb-24 flex flex-col items-center justify-center text-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        <span className="text-sm md:text-sm font-semibold tracking-widest text-[#B63106] uppercase mb-4 block">
          Discover Your Next Opportunity
        </span>
        <h1 className="text-[3rem] md:text-[5rem] font-bold tracking-tight text-brand-text leading-[1.05] mb-6 font-poppins">
          <EditorialText text="Find *Legal Jobs* Built For You" />
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <p className="text-lg md:text-xl text-brand-text/70 mb-10 leading-relaxed">
          We make it easier to discover internships, remote roles, legal opportunities, and career paths from top law firms and fast-growing startups.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="flex flex-row items-center justify-center gap-4 md:gap-5 w-full"
      >
        <Link href="/signup/candidate">
          <button className="px-6 md:px-7 py-3 min-w-[180px] bg-[#B63106] text-white rounded-xl font-medium text-[15px] md:text-[16px] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center cursor-pointer">
            Create Your Profile
          </button>
        </Link>
        <Link href="/job-seekers/jobs">
          <button className="px-6 md:px-7 py-3 min-w-[180px] bg-brand-card border border-brand-border text-brand-text rounded-xl font-medium text-[15px] md:text-[16px] hover:border-[#191D20] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center cursor-pointer">
            Browse Jobs
          </button>
        </Link>
      </motion.div>

    </section>
  );
}
