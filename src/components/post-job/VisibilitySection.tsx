"use client";

import { motion } from "framer-motion";
import EditorialText from "@/components/ui/EditorialText";

export function VisibilitySection() {
  return (
    <section className="py-16 md:py-24 bg-brand-card relative overflow-hidden border-b border-brand-border">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Side: Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="text-sm font-bold text-[#B63106] tracking-widest uppercase">High Exposure</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text leading-[1.1] font-poppins">
            Get posting. <br />
            Get <span className="text-[#B63106] italic font-bold">visibility</span>. <br />
            Get ready to hire.
          </h2>
          <p className="text-lg text-brand-text-muted mt-2 max-w-md leading-relaxed font-medium">
            Job listings are visible where top legal professionals spend their time. Your roles typically get thousands of views per week; if you need more exposure, promote your job with a few clicks.
          </p>
        </motion.div>

        {/* Right Side: Floating Cards */}
        <div className="relative h-[500px] w-full bg-brand-bg rounded-3xl p-8 border border-brand-border flex flex-col justify-center gap-6 overflow-hidden select-none">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full bg-brand-surface p-5 rounded-2xl shadow-xl border border-brand-border flex items-center justify-between z-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-card rounded-lg flex flex-wrap p-1.5 gap-0.5 border border-brand-border">
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#B63106] rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#B63106]/60 rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#B63106]/40 rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#B63106]/20 rounded-sm" />
              </div>
              <div>
                <h3 className="text-brand-text font-bold text-sm md:text-base leading-tight">Associate Attorney</h3>
                <p className="text-brand-text-muted text-xs mt-1">Corporate M&A • New York</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-brand-card text-brand-text text-xs font-bold rounded-xl border border-brand-border hover:bg-brand-surface hover:border-brand/40 transition-all cursor-pointer">
              Apply
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full bg-brand-surface p-5 rounded-2xl shadow-xl border border-brand-border flex items-center justify-between z-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center border border-brand/20 text-[#B63106] font-bold text-lg">
                L
              </div>
              <div>
                <h3 className="text-brand-text font-bold text-sm md:text-base leading-tight">Senior Paralegal</h3>
                <p className="text-brand-text-muted text-xs mt-1">Litigation • Remote</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-brand-card text-brand-text text-xs font-bold rounded-xl border border-brand-border hover:bg-brand-surface hover:border-brand/40 transition-all cursor-pointer">
              Apply
            </button>
          </motion.div>

          {/* Decorative background lines to represent pipeline */}
          <div className="absolute top-10 left-10 bottom-10 w-px bg-gradient-to-b from-transparent via-brand-border to-transparent -z-0" />
          
        </div>
      </div>
    </section>
  );
}
export default VisibilitySection;
