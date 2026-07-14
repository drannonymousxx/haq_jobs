"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Lock } from "lucide-react";
import EditorialText from "@/components/ui/EditorialText";

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
              <Star className="w-8 h-8 text-[#3B82F6] fill-current" />
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
              <div className="w-4 h-4 rounded-full bg-brand-card" />
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
            className="text-[2.5rem] md:text-[3.5rem] font-bold text-brand-text leading-[1.1] mb-6 font-poppins"
          >
            <EditorialText text="Brand yourself for *new opportunities*" />
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-brand-text/80 mb-12 leading-snug"
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(182, 49, 6,0.08)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(182, 49, 6,0.12)] mt-1">
                <MapPin className="w-6 h-6 text-[#B63106]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-1">One click apply</h3>
                <p className="text-brand-text/70 leading-relaxed text-base">
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(182, 49, 6,0.08)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(182, 49, 6,0.12)] mt-1">
                <Lock className="w-6 h-6 text-[#B63106]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-1">Set your preferences</h3>
                <p className="text-brand-text/70 leading-relaxed text-base">
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
