"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ value, suffix, delay = 0 }: { value: number, suffix: string, delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  
  const [displayValue, setDisplayValue] = useState("0" + suffix);

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
    }
  }, [inView, value, motionValue, delay]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest) + suffix);
    });
  }, [springValue, suffix]);

  return <span ref={ref}>{displayValue}</span>;
}

export default function StatsSection() {
  return (
    <section className="bg-[#B63106] text-white pt-10 pb-24 relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#B63106] rounded-full flex items-center justify-center">
        <ArrowDown size={20} className="text-white" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[4rem] md:text-[5rem] font-bold leading-none mb-4 tracking-tight">
              <AnimatedNumber value={8} suffix="M+" delay={0.1} />
            </div>
            <div className="text-lg font-medium opacity-90">Matches Made</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-[4rem] md:text-[5rem] font-bold leading-none mb-4 tracking-tight">
              <AnimatedNumber value={150} suffix="K+" delay={0.2} />
            </div>
            <div className="text-lg font-medium opacity-90">Legal Jobs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-[4rem] md:text-[5rem] font-bold leading-none mb-4 tracking-tight">
              <AnimatedNumber value={10} suffix="M+" delay={0.3} />
            </div>
            <div className="text-lg font-medium opacity-90">Firm Ready Candidates</div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
