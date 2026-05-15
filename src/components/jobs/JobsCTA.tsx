"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function JobsCTA() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax transforms for abstract shapes
  const sphereX = useTransform(smoothX, [-300, 300], [20, -20]);
  const sphereY = useTransform(smoothY, [-300, 300], [20, -20]);

  const cubeX = useTransform(smoothX, [-300, 300], [-10, 10]);
  const cubeY = useTransform(smoothY, [-300, 300], [-10, 10]);

  const platformX = useTransform(smoothX, [-300, 300], [5, -5]);
  const platformY = useTransform(smoothY, [-300, 300], [5, -5]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-white rounded-[2rem] md:rounded-[3rem] border border-[#013CF1]/25 shadow-[0_20px_60px_-15px_rgba(1,60,241,0.08)] overflow-hidden flex flex-col md:flex-row relative"
        >
          {/* Illustration Panel */}
          <div
            className="md:w-5/12 bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#E0E7FF] p-10 md:p-16 flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-[400px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background blur elements */}
            <div className="absolute w-[200px] h-[200px] bg-[#013CF1] opacity-[0.03] rounded-full blur-3xl top-0 left-0 pointer-events-none" />
            <div className="absolute w-[150px] h-[150px] bg-white opacity-[0.6] rounded-full blur-2xl bottom-0 right-0 pointer-events-none" />

            {/* Abstract 3D Composition */}
            <div className="relative w-full aspect-square max-w-[280px]">

              {/* Platform */}
              <motion.div
                style={{ x: platformX, y: platformY }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-gradient-to-b from-[#FFFFFF] to-[#EEF2FF] rounded-2xl shadow-[0_20px_40px_-10px_rgba(1,60,241,0.15)] transform -rotate-6"
              >
                {/* 3D edge effect */}
                <div className="absolute bottom-0 left-0 w-full h-3 bg-[#E2E8F0] rounded-b-2xl transform translate-y-2 opacity-50"></div>
              </motion.div>

              {/* Cube */}
              <motion.div
                style={{ x: cubeX, y: cubeY }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-tr from-[#013CF1] to-[#60A5FA] rounded-3xl shadow-[0_20px_50px_-15px_rgba(1,60,241,0.4)] border border-[rgba(255,255,255,0.2)] z-10 flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/20 to-transparent"></div>
                <div className="absolute w-12 h-12 bg-white/10 rounded-full blur-xl top-[-10px] right-[-10px]"></div>
              </motion.div>

              {/* Sphere */}
              <motion.div
                style={{ x: sphereX, y: sphereY }}
                className="absolute bottom-1/4 right-8 w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF7E6B] to-[#FF9E8F] shadow-[0_15px_30px_-10px_rgba(255,126,107,0.4)] border border-[rgba(255,255,255,0.3)] z-20 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute w-6 h-6 bg-white/40 rounded-full blur-md top-1 right-1"></div>
              </motion.div>

              {/* Floating Pill */}
              <motion.div
                style={{ x: sphereX, y: cubeY }}
                className="absolute top-1/4 left-8 w-12 h-20 rounded-full bg-gradient-to-b from-white to-[#F8FAFC] shadow-[0_10px_25px_-5px_rgba(1,60,241,0.1)] border border-white z-0 overflow-hidden"
              >
                <div className="absolute w-4 h-4 bg-white rounded-full blur-sm top-2 left-2"></div>
              </motion.div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="md:w-7/12 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-white relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[#EEF2FF] to-transparent opacity-50 rounded-bl-[100px] pointer-events-none" />

            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#191D20] mb-5 tracking-tight leading-[1.1]">
              Start discovering better legal opportunities
            </h2>
            <p className="text-[16px] md:text-[18px] text-[#64748B] mb-10 leading-relaxed max-w-[500px]">
              Apply to verified jobs with one click, connect with founders, and increase your visibility with top legal recruiters searching for your skills.
            </p>

            <div>
              <Link
                href="/job-seekers/register"
                className="inline-flex items-center justify-center gap-2 bg-[#191D20] text-white px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-[#013CF1] hover:shadow-[0_10px_30px_-10px_rgba(1,60,241,0.5)] transition-all duration-300 group"
              >
                Create your profile
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
