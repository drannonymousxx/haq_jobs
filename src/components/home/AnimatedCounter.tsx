"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  label: string;
  suffix?: string;
  size?: number;
  entranceDelay?: number;
}

export function AnimatedCounter({
  targetValue,
  duration = 2,
  label,
  suffix = "",
  size = 170,
  entranceDelay = 0.2,
}: AnimatedCounterProps) {
  const currentValue = useCountUp(targetValue, duration);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // cubic-bezier(0.22, 1, 0.36, 1)
        delay: entranceDelay,
      },
    },
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
      {/* Translucent glass container with soft border glow */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 35px rgba(217, 72, 15, 0.35)",
          borderColor: "rgba(217, 72, 15, 0.4)",
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="rounded-full bg-[#121212]/85 border border-[#2A2A2A] flex flex-col items-center justify-center text-center p-6 shadow-2xl backdrop-blur-xl select-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: "0 0 25px rgba(217, 72, 15, 0.15)",
          borderWidth: "1.5px",
        }}
      >
        {/* Large count-up statistic */}
        <h3 className="text-3xl font-black text-white font-poppins tracking-tight leading-none mb-2">
          {currentValue}
          {suffix}
        </h3>
        
        {/* Label text underneath */}
        <p className="text-[10px] sm:text-[11px] font-bold text-[#CBD5E1]/60 uppercase tracking-widest leading-snug max-w-[120px]">
          {label}
        </p>
      </motion.div>
    </div>
  );
}
