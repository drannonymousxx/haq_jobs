"use client";

import { motion } from "framer-motion";

export default function FeatureSectionTwo() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-24">
        
        {/* Left: Abstract 3D-like Mockup */}
        <div className="flex-1 w-full max-w-lg relative h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#A7E9C3] rounded-[100px] -z-10 w-full h-[80%] my-auto" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-[220px] h-[320px] bg-[#16A34A] rounded-lg shadow-xl relative p-6 transform rotate-[-5deg]"
          >
            {/* Mockup document lines */}
            <div className="w-16 h-16 bg-[#A7E9C3] rounded-full mx-auto mb-6 flex items-center justify-center -mt-12 shadow-md">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-[#3B82F6]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-full h-4 bg-[#4ADE80] rounded" />
              ))}
            </div>

            {/* Floating toggles */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-12 -left-12 w-16 h-8 bg-[#3B82F6] rounded-full border-4 border-[#A7E9C3] flex items-center p-1"
            >
              <div className="w-4 h-4 rounded-full bg-white" />
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-16 -right-12 w-16 h-8 bg-[#3B82F6] rounded-full border-4 border-[#A7E9C3] flex items-center justify-end p-1"
            >
              <div className="w-4 h-4 rounded-full bg-[#A7E9C3]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Text Content */}
        <div className="flex-1 w-full max-w-xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[2.5rem] md:text-[3.5rem] font-bold text-[#191D20] leading-[1.1] mb-6"
          >
            Brand yourself for new opportunities
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-[#191D20]/80 mb-12 leading-snug"
          >
            Create a profile that highlights your unique skills and preferences, then apply to jobs with just one click
          </motion.p>

          <div className="space-y-10">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-5 group cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(1,60,241,0.12)] mt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#013CF1]">
                  <path d="M12 20v-6M12 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-[#191D20] mb-1">One click apply</h3>
                <p className="text-[#191D20]/70 leading-relaxed text-base">
                  Say goodbye to cover letters - your profile is all you need. One click to apply then you&apos;re done.
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(1,60,241,0.12)] mt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#013CF1]">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-[#191D20] mb-1">Set your preferences</h3>
                <p className="text-[#191D20]/70 leading-relaxed text-base">
                  Streamline the interview process by setting your expectations (salary, industry, culture, etc.) upfront.
                </p>
              </div>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 px-8 py-3.5 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-black transition-colors"
            >
              Create your profile for free
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
