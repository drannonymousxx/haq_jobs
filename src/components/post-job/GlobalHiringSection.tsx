"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export function GlobalHiringSection() {
  return (
    <section className="py-16 md:py-24 bg-brand-bg relative overflow-hidden border-b border-brand-border">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Side: Floating Preferences Panel */}
        <div className="relative h-[450px] w-full flex justify-center items-center bg-brand-card rounded-3xl border border-brand-border p-8 select-none">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm bg-brand-surface border border-brand-border p-6 rounded-2xl shadow-2xl relative z-10"
          >
            <div className="mb-6">
              <h4 className="text-brand-text font-bold mb-3">Target Geography</h4>
              <div className="space-y-2">
                <div className="h-10 w-full bg-brand-card rounded-lg border border-brand-border flex items-center justify-between px-3">
                  <span className="text-sm text-brand-text-secondary font-medium">United States</span>
                  <div className="w-4 h-4 rounded-full border border-brand-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#B63106]" />
                  </div>
                </div>
                <div className="h-10 w-full bg-brand-card rounded-lg border border-brand-border flex items-center justify-between px-3 opacity-60">
                  <span className="text-sm text-brand-text-muted">Europe (Remote)</span>
                  <div className="w-4 h-4 rounded-full border border-brand-border" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-brand-text font-bold mb-3">Timezone Overlap</h4>
              <div className="flex gap-2 flex-wrap">
                {["PST", "EST", "CST", "GMT", "CET"].map((tz, i) => (
                  <div 
                    key={tz}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      i < 3 
                        ? 'bg-brand/10 text-brand border border-brand/20' 
                        : 'bg-brand-card text-brand-text-muted border border-brand-border'
                    }`}
                  >
                    {tz}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">Accept remote workers</span>
              <div className="w-8 h-4 bg-[#B63106] rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-brand-card rounded-full shadow-sm" />
              </div>
            </div>
          </motion.div>
          
          {/* Subtle background circles */}
          <div className="absolute w-[300px] h-[300px] border border-brand-border rounded-full" />
          <div className="absolute w-[450px] h-[450px] border border-brand-border rounded-full border-dashed" />
        </div>

        {/* Right Side: Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <span className="text-[#B63106] text-sm font-bold tracking-widest uppercase">A Worldwide Workforce</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text leading-[1.1] font-poppins">
            Go global. <br />
            <span className="text-brand-text-muted">Or hyper-local.</span>
          </h2>
          <p className="text-lg text-brand-text-muted leading-relaxed font-medium">
            Our specialized community of legal professionals is at your fingertips. Specify the regions and time zones where you&apos;ll accept candidates to build a distributed team, or one a bit closer to home.
          </p>
          <div className="mt-4">
            <Button href="/for-companies#consultation" variant="primary">
              Hire Talent Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
export default GlobalHiringSection;
