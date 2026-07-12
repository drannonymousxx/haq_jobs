"use client";

import { motion } from "framer-motion";

const logos = [
  "Latham & Watkins",
  "Kirkland & Ellis",
  "Skadden",
  "Cooley",
  "Wilson Sonsini",
  "Fenwick"
];

export function LogoCloud() {
  return (
    <section className="py-16 bg-brand-bg border-b border-brand-border relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-xs font-semibold text-brand-text-muted mb-8 tracking-widest uppercase">
          More than 25K companies use HAQJobs to build their team
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="text-lg md:text-xl font-bold text-brand-text-muted hover:text-brand-text transition-colors select-none font-serif tracking-tight"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
