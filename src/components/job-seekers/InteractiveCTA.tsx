"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function InteractiveCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse parallax
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    // Calculate normalized coordinates (-1 to 1)
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Transforms for 3D elements
  const bgX = useTransform(smoothMouseX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothMouseY, [-1, 1], [-10, 10]);

  const umbrellaX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const umbrellaY = useTransform(smoothMouseY, [-1, 1], [-10, 10]);
  const umbrellaRotate = useTransform(smoothMouseX, [-1, 1], [-3, 3]);

  const chairX = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
  const chairY = useTransform(smoothMouseY, [-1, 1], [-5, 5]);

  const sphereX = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
  const sphereY = useTransform(smoothMouseY, [-1, 1], [-30, 30]);

  const cubeX = useTransform(smoothMouseX, [-1, 1], [-25, 25]);
  const cubeY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  const pillX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const pillY = useTransform(smoothMouseY, [-1, 1], [-40, 40]);

  const smallBallX = useTransform(smoothMouseX, [-1, 1], [-50, 50]);
  const smallBallY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  return (
    <section className="pt-12 pb-24 px-8 md:px-12 lg:px-16 xl:px-20 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

        {/* LEFT SIDE: Text Content */}
        <div className="flex-1 w-full max-w-2xl pl-2 md:pl-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[2.3rem] md:text-[3.2rem] font-bold text-brand-text leading-[1.05] tracking-tight mb-6"
          >
            Let the opportunities come to you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-[1.65rem] text-brand-text/80 mb-12 leading-relaxed max-w-2xl"
          >
            Create a profile that highlights your unique skills and preferences, then apply to jobs with just one click.
          </motion.p>

          <div className="space-y-10">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-5 group cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-1group-hover:bg-[#DDE7FF]2 rounded-full bg-[#EEF2FF] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md  mt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1D4DFF]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-1">Connect with founders</h3>
                <p className="text-brand-text/70 leading-relaxed text-base">
                  Let founders pitch you directly on their opportunity.
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-[#DDE7FF] mt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1D4DFF]">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold text-brand-text mb-1">Get featured</h3>
                <p className="text-brand-text/70 leading-relaxed text-base">
                  Feature your profile even further and make more meaningful legal connections.
                </p>
              </div>
            </motion.div>

            <Link href="/signup" className="inline-block">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 px-8 py-3.5 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Get started
              </motion.button>
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Visual */}
        <div
          className="flex-1 w-full max-w-lg relative h-[600px] flex items-center justify-center cursor-default hidden lg:flex perspective-1000"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Arch Shape */}
          <motion.div
            style={{ x: bgX, y: bgY }}
            className="absolute right-0 top-10 w-[85%] h-[90%] bg-[#D9DFFF] rounded-t-[300px] rounded-br-[100px] rounded-bl-[40px] -z-10 shadow-sm transition-transform duration-100 ease-out"
          />

          {/* Floating UI Composition */}
          <div className="relative w-full h-full flex flex-col justify-center items-center transform-gpu">

            {/* Base Platform */}
            <motion.div
              style={{ x: bgX, y: bgY }}
              className="absolute bottom-24 w-48 h-12 rounded-full bg-[#F4AFCB] shadow-[inset_0_-4px_10px_rgba(0,0,0,0.1)] z-0"
            />

            {/* Umbrella */}
            <motion.div
              style={{ x: umbrellaX, y: umbrellaY, rotate: umbrellaRotate }}
              className="absolute top-16 z-10 flex flex-col items-center"
            >
              {/* Canopy */}
              <div className="relative w-80 h-32 -mb-2 z-20">
                <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0px 15px 15px rgba(182, 49, 6,0.2))' }}>
                  <path d="M 10 90 Q 50 65 100 90 Q 150 65 190 90 L 100 15 Z" fill="#B63106" />
                  <path d="M 50 78 Q 100 65 150 78 L 100 15 Z" fill="#255aff" opacity="0.8" />
                  <path d="M 80 85 Q 100 75 120 85 L 100 15 Z" fill="#4d77ff" opacity="0.6" />
                </svg>
                {/* Top finial */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-4 bg-[#F4AFCB] rounded-t-full" />
              </div>
              {/* Pole */}
              <div className="w-3 h-72 bg-gradient-to-r from-[#e39db9] to-[#F4AFCB] rounded-full z-10 shadow-inner" />
            </motion.div>

            {/* Lounge Chair */}
            <motion.div
              style={{ x: chairX, y: chairY }}
              className="absolute bottom-32 z-20"
            >
              <div className="relative w-64 h-48">
                {/* Backrest */}
                <div className="absolute top-6 left-12 w-32 h-48 border-[6px] border-[#B63106] bg-[#F4AFCB] rounded-xl origin-bottom rotate-[-35deg] shadow-2xl flex items-center justify-center overflow-hidden z-10">
                  {/* Fabric texture lines */}
                  <div className="w-full h-full opacity-10 flex flex-col justify-evenly">
                    <div className="w-full h-1 bg-black"></div>
                    <div className="w-full h-1 bg-black"></div>
                    <div className="w-full h-1 bg-black"></div>
                  </div>
                </div>
                {/* Seat */}
                <div className="absolute bottom-12 left-6 w-48 h-16 border-[6px] border-[#B63106] bg-[#F4AFCB] rounded-xl origin-bottom-left rotate-12 shadow-lg z-20 overflow-hidden">
                  {/* Fabric texture lines */}
                  <div className="w-full h-full opacity-10 flex flex-col justify-evenly">
                    <div className="w-full h-1 bg-black"></div>
                  </div>
                </div>
                {/* Front Leg */}
                <div className="absolute bottom-4 left-36 w-3 h-20 border-[4px] border-[#B63106] rounded-full rotate-[-25deg] z-0" />
                {/* Back Leg */}
                <div className="absolute bottom-4 left-16 w-3 h-20 border-[4px] border-[#B63106] rounded-full rotate-[25deg] z-30" />
              </div>
            </motion.div>

            {/* Floating Shapes */}
            {/* Sphere */}
            <motion.div
              style={{ x: sphereX, y: sphereY }}
              className="absolute bottom-44 left-44 w-24 h-24 rounded-full z-30 shadow-[0_20px_40px_rgba(182, 49, 6,0.4)]"
              initial={{ y: 20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #4f79ff, #B63106)' }} />
            </motion.div>

            {/* Rounded Cube */}
            <motion.div
              style={{ x: cubeX, y: cubeY }}
              className="absolute bottom-36 left-24 w-20 h-20 rounded-2xl z-20 shadow-[0_15px_30px_rgba(0,0,0,0.1)] border border-white/40"
              initial={{ y: -10, rotate: 10 }}
              animate={{ y: [0, 15, 0], rotate: [10, -5, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <div className="w-full h-full rounded-2xl" style={{ background: 'linear-gradient(135deg, #AFC4FF, #D9DFFF)' }} />
            </motion.div>

            {/* Small Pill / Cylinder */}
            <motion.div
              style={{ x: pillX, y: pillY }}
              className="absolute bottom-52 left-32 w-8 h-24 rounded-full z-10 shadow-lg rotate-45"
              initial={{ y: 0 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(to bottom, #FBEAEA, #F4AFCB)' }} />
            </motion.div>

            {/* Small floating ball */}
            <motion.div
              style={{ x: smallBallX, y: smallBallY }}
              className="absolute bottom-28 left-52 w-12 h-12 rounded-full z-40 shadow-md"
              initial={{ y: 0 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #fff, #FBEAEA, #F4AFCB)' }} />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
