"use client";

import { motion } from "framer-motion";

export default function FeatureSectionOne() {
  return (
    <section className="pt-10 pb-24 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

        {/* Left: Text Content */}
        <div className="flex-1 w-full max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[3rem] md:text-[4.5rem] font-bold text-[#191D20] leading-[1.02] mb-6 max-w-2xl tracking-tight"
          >
            Find work that works for you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-[#191D20]/80 mb-12 leading-relaxed"
          >
            A personalized and private job search, with all the info you care about, all upfront.
          </motion.p>

          <div className="space-y-12">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-5 group cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(1,60,241,0.12)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#013CF1]">
                  <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-[#191D20] mb-2">Stay in the know</h3>
                <p className="text-[#191D20]/70 leading-relaxed text-lg">
                  No guessing games. View compensation and firm culture before you apply.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-5 group cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(1,60,241,0.12)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#013CF1]">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-[#191D20] mb-2">Personalized search</h3>
                <p className="text-[#191D20]/70 leading-relaxed text-lg">
                  Personalized filters make it quick and easy to find the legal roles you care about.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-5 group cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(1,60,241,0.12)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#013CF1]">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-[#191D20] mb-2">Unique roles, exciting teams</h3>
                <p className="text-[#191D20]/70 leading-relaxed text-lg">
                  Discover unique legal jobs with future-defining firms.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Right: Abstract 3D-like Mockup */}
        <div className="flex-1 w-full max-w-lg relative h-[500px] translate-y-10">
          <div className="absolute inset-0 bg-[#E0E7FF] rounded-t-full rounded-b-lg -z-10 w-full h-[120%]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="absolute top-20 left-10 w-4/5 bg-white h-24 rounded-full shadow-lg flex items-center px-6 border border-[#2563EB]/10 group cursor-default hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="w-8 h-8 rounded-full border-4 border-[#2563EB] flex-shrink-0 bg-[#60A5FA]/20" />
            <div className="ml-4 w-1/2 h-4 rounded-full bg-[#60A5FA]/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-52 left-20 w-4/5 flex items-center gap-4 group cursor-default hover:translate-x-2 transition-transform duration-300"
          >
            <div className="w-12 h-12 bg-[#2563EB] rounded-lg shadow flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="w-48 h-3 bg-[#60A5FA] rounded-full opacity-80" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute top-72 left-20 w-4/5 flex items-center gap-4 group cursor-default hover:translate-x-2 transition-transform duration-300"
          >
            <div className="w-12 h-12 bg-[#60A5FA] rounded-lg shadow flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="w-48 h-3 bg-[#93C5FD] rounded-full opacity-80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
