"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AttractTalent() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[32px] md:text-[40px] font-bold text-[#013CF1] tracking-tight mb-4"
          >
            Attract Talent
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-[#475569] max-w-[800px]"
          >
            Create visibility for your legal opportunities and reach qualified candidates through curated listings and employer branding.
          </motion.p>
        </div>

        {/* Pricing Cards Split Layout */}
        <div className="flex flex-col lg:flex-row rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
          
          {/* Card 1: Access */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]"
          >
            <div className="mb-8">
              <span className="text-[19px] font-bold text-[#191D20] block mb-6">Access</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[48px] md:text-[56px] font-bold text-[#191D20] leading-none tracking-tight">Free</span>
              </div>
              <span className="text-[15px] text-[#475569]">Free plan for all employers</span>
            </div>

            <div className="flex-1 border-t border-[#E2E8F0] pt-8 mb-10">
              <ul className="space-y-4">
                {[
                  "Post jobs",
                  "Review applicants",
                  "Branded company profiles",
                  "Built-in hiring dashboard"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#191D20] shrink-0 mt-[2px]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[15px] text-[#191D20] leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="block text-center w-full bg-[#191D20] hover:bg-black text-white rounded-xl py-4 text-[15px] font-bold transition-colors">
              Sign Up
            </Link>
          </motion.div>

          {/* Card 2: Promoted Jobs */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full lg:w-1/2 flex flex-col bg-[#F8FAFC]"
          >
            {/* Top Strip */}
            <div className="bg-[#FCE7F3] text-center py-2 text-[13px] font-bold text-[#191D20]">
              Add-on
            </div>
            
            <div className="flex flex-col flex-1 p-8 md:p-12 pt-6 md:pt-10">
              <div className="mb-8">
                <span className="text-[19px] font-bold text-[#191D20] block mb-6">Promoted Jobs</span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[48px] md:text-[56px] font-bold text-[#191D20] leading-none tracking-tight">From ₹4,999</span>
                </div>
                <span className="text-[15px] text-[#475569]">Boost visibility for high-priority listings</span>
              </div>

              <div className="flex-1 border-t border-[#E2E8F0] pt-8 mb-10">
                <ul className="space-y-4">
                  {[
                    "Expanded candidate reach",
                    "Priority listing placement",
                    "Better exposure across categories",
                    "Increased application visibility"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#191D20] shrink-0 mt-[2px]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[15px] text-[#191D20] leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/signup" className="block text-center w-full bg-[#191D20] hover:bg-black text-white rounded-xl py-4 text-[15px] font-bold transition-colors">
                Get Started
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
