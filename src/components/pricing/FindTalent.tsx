"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FindTalent() {
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
            Find Talent
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-[#475569] max-w-[800px]"
          >
            Discover top legal talent with advanced search, smart filtering, and recruiter-focused sourcing tools.
          </motion.p>
        </div>

        {/* Pricing Cards Layout */}
        <div className="flex flex-col lg:flex-row rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
          
          {/* Card 1: Access */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/3 flex flex-col p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]"
          >
            <div className="mb-8">
              <span className="text-[19px] font-bold text-[#191D20] block mb-6">Access</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[40px] md:text-[48px] font-bold text-[#191D20] leading-none tracking-tight">Free</span>
              </div>
              <span className="text-[15px] text-[#475569]">Basic sourcing access</span>
            </div>

            <div className="flex-1 border-t border-[#E2E8F0] pt-8 mb-10">
              <ul className="space-y-4">
                {[
                  "Candidate browsing",
                  "ATS integration",
                  "Basic outreach tools"
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

            <div className="flex items-center gap-3">
              <Link href="/signup" className="flex-1 block text-center bg-[#191D20] hover:bg-black text-white rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                Sign Up
              </Link>
              <Link href="/pricing/details" className="flex-1 block text-center bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#191D20] rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Recruit Pro */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full lg:w-1/3 flex flex-col p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] bg-[#F8FAFC]"
          >
            <div className="mb-8">
              <span className="text-[19px] font-bold text-[#191D20] block mb-6">Recruit Pro</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[40px] md:text-[48px] font-bold text-[#191D20] leading-none tracking-tight">₹9,999</span>
                <span className="text-[15px] font-medium text-[#475569]">/mo</span>
              </div>
              <span className="text-[15px] text-[#475569]">Advanced hiring and sourcing tools</span>
            </div>

            <div className="flex-1 border-t border-[#E2E8F0] pt-8 mb-10">
              <ul className="space-y-4">
                {[
                  "Advanced candidate filters",
                  "Personalized outreach",
                  "Resume access",
                  "Instant scheduling",
                  "Unlimited messaging",
                  "Legal-specific discovery tools"
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

            <div className="flex items-center gap-3">
              <Link href="/signup" className="flex-1 block text-center bg-[#191D20] hover:bg-black text-white rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                Sign Up
              </Link>
              <Link href="/pricing/details" className="flex-1 block text-center bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#191D20] rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Elite Hiring */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/3 flex flex-col bg-white"
          >
            {/* Top Strip */}
            <div className="bg-[#FDE68A] text-center py-2 text-[13px] font-bold text-[#191D20]">
              Best Value
            </div>
            
            <div className="flex flex-col flex-1 p-8 md:p-10 pt-6 md:pt-8">
              <div className="mb-8">
                <span className="text-[19px] font-bold text-[#191D20] block mb-6">Elite Hiring</span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[40px] md:text-[48px] font-bold text-[#191D20] leading-none tracking-tight">Custom</span>
                </div>
                <span className="text-[15px] text-[#475569]">Dedicated recruitment support for growing firms</span>
              </div>

              <div className="flex-1 border-t border-[#E2E8F0] pt-8 mb-10">
                <ul className="space-y-4">
                  {[
                    "Dedicated hiring specialist",
                    "Curated weekly candidate pipeline",
                    "Priority candidate access",
                    "Custom sourcing strategy",
                    "Assisted interview coordination"
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

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3">
                <Link href="/contact" className="w-full sm:flex-1 lg:w-full xl:flex-1 block text-center bg-[#191D20] hover:bg-black text-white rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                  Schedule a Call
                </Link>
                <Link href="/pricing/details" className="w-full sm:flex-1 lg:w-full xl:flex-1 block text-center bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#191D20] rounded-xl py-3.5 text-[15px] font-bold transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
