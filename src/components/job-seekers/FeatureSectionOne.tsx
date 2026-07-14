"use client";

import { motion } from "framer-motion";
import { Maximize2, PlusCircle, Send, Check } from "lucide-react";
import EditorialText from "@/components/ui/EditorialText";

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
            className="text-[3rem] md:text-[4.5rem] font-bold text-brand-text leading-[1.02] mb-6 max-w-2xl tracking-tight font-poppins"
          >
            <EditorialText text="Find work that *works for you*" />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-brand-text/80 mb-12 leading-relaxed"
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(182, 49, 6,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(182, 49, 6,0.12)]">
                <Maximize2 className="w-6 h-6 text-[#B63106]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-2">Stay in the know</h3>
                <p className="text-brand-text/70 leading-relaxed text-lg">
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(182, 49, 6,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(182, 49, 6,0.12)]">
                <PlusCircle className="w-6 h-6 text-[#B63106]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-2">Personalized search</h3>
                <p className="text-brand-text/70 leading-relaxed text-lg">
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[rgba(182, 49, 6,0.08)] flex items-center justify-center mt-1 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[rgba(182, 49, 6,0.12)]">
                <Send className="w-6 h-6 text-[#B63106]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-2">Unique roles, exciting teams</h3>
                <p className="text-brand-text/70 leading-relaxed text-lg">
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
            className="absolute top-20 left-10 w-4/5 bg-brand-card h-24 rounded-full shadow-lg flex items-center px-6 border border-[#2563EB]/10 group cursor-default hover:scale-[1.02] transition-transform duration-300"
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
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
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
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div className="w-48 h-3 bg-[#93C5FD] rounded-full opacity-80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
