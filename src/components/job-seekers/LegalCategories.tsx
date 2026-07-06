"use client";

import { motion } from "framer-motion";

const categories = [
  "Corporate Law", "Litigation", "Arbitration", "Tax Law",
  "Intellectual Property", "Criminal Law", "Cyber Law",
  "Compliance", "Due Diligence", "Startups", "Environmental Law",
  "Legal Research", "Contract Drafting", "Case Analysis"
];

export default function LegalCategories() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">
          Explore by Practice Area
        </h2>
        <p className="text-brand-text/60 max-w-2xl mx-auto mb-10">
          From big law to boutique firms and tech startups, find the exact legal niche that matches your career aspirations.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {categories.map((category, idx) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              duration: 0.4, 
              delay: idx * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-brand-card border border-[#191D20]/10 rounded-full text-sm font-medium text-brand-text/80 hover:text-[#B63106] hover:border-[#B63106]/30 hover:shadow-sm transition-colors"
          >
            {category}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
