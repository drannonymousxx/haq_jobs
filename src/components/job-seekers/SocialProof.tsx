"use client";

import { motion } from "framer-motion";

export default function SocialProof() {
  return (
    <section className="py-16 px-4 mb-16 border-t border-[#191D20]/5 bg-gradient-to-b from-transparent to-[#F0F0F0]/30">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex -space-x-4 mb-6"
        >
          {/* Avatar Placeholders */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-medium text-xs
                ${i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-indigo-400' : i === 3 ? 'bg-[#013CF1]' : i === 4 ? 'bg-purple-400' : 'bg-slate-400'}
              `}
              style={{ zIndex: 10 - i }}
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-[#F0F0F0] flex items-center justify-center text-[#191D20]/60 font-medium text-xs z-0">
            +1k
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg font-medium text-[#191D20]"
        >
          “1,000+ Students & Lawyers growing with HAQJobs”
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-40 grayscale"
        >
          {/* Logo Placeholders for "Trusted By" */}
          <div className="text-xl font-bold font-serif tracking-tighter">GLOBAL LAW</div>
          <div className="text-xl font-bold tracking-widest uppercase">Apex Partners</div>
          <div className="text-xl font-medium tracking-tight">Lex<span className="font-light">Group</span></div>
          <div className="text-xl font-extrabold italic">TECH<span className="text-blue-600">COUNSEL</span></div>
        </motion.div>

      </div>
    </section>
  );
}
