"use client";

import React from "react";
import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#0B0B0B] overflow-hidden pointer-events-none z-0">
      {/* Dark grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      {/* Noise texture overlay */}
      <div 
        className="noise-overlay absolute inset-0 opacity-[0.35] mix-blend-overlay" 
        aria-hidden="true" 
      />

      {/* Animated Light Orb 1 (Orange/Accent) - Top Right */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(217, 72, 15, 0.12) 0%, rgba(217, 72, 15, 0) 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Animated Light Orb 2 (Deep Red-Orange) - Bottom Left */}
      <motion.div
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 60, -70, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] left-[-15%] w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(154, 52, 18, 0.08) 0%, rgba(154, 52, 18, 0) 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Animated Light Orb 3 (Soft Rust) - Right Center */}
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 80, -40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(91, 36, 16, 0.06) 0%, rgba(91, 36, 16, 0) 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Vignette effect overlay to build depth & contrast */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(11, 11, 11, 0.8) 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
