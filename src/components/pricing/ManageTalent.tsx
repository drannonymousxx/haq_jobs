"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ManageTalent() {
  return (
    <section className="w-full bg-brand-card py-12 md:py-16 mb-10">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[32px] md:text-[40px] font-bold text-[#B63106] tracking-tight mb-4"
          >
            Manage Talent
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-[#475569] max-w-[800px]"
          >
            Track applicants, organize hiring pipelines, and manage legal recruitment workflows from one unified dashboard.
          </motion.p>
        </div>

        {/* Centered Single Pricing Card Layout */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-[500px] flex flex-col p-8 md:p-12 rounded-[32px] border border-brand-border shadow-[0_12px_40px_rgb(0,0,0,0.04)] bg-brand-card"
          >
            <div className="mb-8">
              <span className="text-[19px] font-bold text-brand-text block mb-6">Track</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[48px] md:text-[56px] font-bold text-brand-text leading-none tracking-tight">Free</span>
              </div>
              <span className="text-[15px] text-[#475569]">Simple ATS for legal hiring teams</span>
            </div>

            <div className="flex-1 border-t border-brand-border pt-8 mb-10">
              <ul className="space-y-4">
                {[
                  "ATS integration",
                  "Candidate tracking",
                  "Applicant review tools",
                  "Legal hiring workflow management"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-text shrink-0 mt-[2px]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[15px] text-brand-text leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="block text-center w-full bg-[#191D20] hover:bg-black text-white rounded-xl py-4 text-[15px] font-bold transition-colors">
              Sign Up
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
