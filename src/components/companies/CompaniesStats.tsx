"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation, useSpring, useTransform } from "framer-motion";

interface StatItemProps {
  endValue: number;
  suffix: string;
  label: string;
  delay: number;
}

function AnimatedStat({ endValue, suffix, label, delay }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2
  });

  const displayValue = useTransform(springValue, (current) => {
    return Math.floor(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      // Small delay for staggered effect
      setTimeout(() => {
        springValue.set(endValue);
      }, delay * 1000);
    }
  }, [isInView, endValue, springValue, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <div className="flex items-baseline mb-2 overflow-hidden">
        <motion.span
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
          className="text-6xl md:text-[80px] font-bold text-[#013CF1] tracking-tight leading-none"
        >
          <motion.span>{displayValue}</motion.span>
          <span>{suffix}</span>
        </motion.span>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: delay + 0.3 }}
        className="text-[17px] font-bold text-[#191D20] tracking-wide"
      >
        {label}
      </motion.span>
    </div>
  );
}

export default function CompaniesStats() {
  return (
    <section className="bg-white border-b border-[#E2E8F0] relative z-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">

          <div className="flex-1 w-full">
            <AnimatedStat
              endValue={50}
              suffix="k+"
              label="legal professionals"
              delay={0.1}
            />
          </div>

          <div className="flex-1 w-full">
            <AnimatedStat
              endValue={5}
              suffix="k+"
              label="Companies hiring"
              delay={0.2}
            />
          </div>

          <div className="flex-1 w-full">
            <AnimatedStat
              endValue={20}
              suffix="k+"
              label="Hires made"
              delay={0.3}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
