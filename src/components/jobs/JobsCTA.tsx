"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EditorialText from "@/components/ui/EditorialText";

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
    <section className="py-20 bg-brand-bg select-none">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-brand-card rounded-[2rem] md:rounded-[3rem] border border-brand-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative"
        >
          {/* Illustration Panel */}
          <div
            className="md:w-5/12 bg-gradient-to-br from-brand-card via-brand-surface to-[#16161A] p-10 md:p-16 flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-[400px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background blur elements */}
            <div className="absolute w-[200px] h-[200px] bg-brand opacity-[0.06] rounded-full blur-3xl top-0 left-0 pointer-events-none" />
            <div className="absolute w-[150px] h-[150px] bg-brand-bg opacity-[0.8] rounded-full blur-2xl bottom-0 right-0 pointer-events-none" />

            {/* Abstract 3D Composition */}
            <div className="relative w-full aspect-square max-w-[280px]">

              {/* Platform */}
              <motion.div
                style={{ x: platformX, y: platformY }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-gradient-to-b from-brand-card to-brand-surface border border-brand-border rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform -rotate-6"
              >
                {/* 3D edge effect */}
                <div className="absolute bottom-0 left-0 w-full h-3 bg-zinc-900 rounded-b-2xl transform translate-y-2 opacity-50"></div>
              </motion.div>

              {/* Cube */}
              <motion.div
                style={{ x: cubeX, y: cubeY }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-tr from-brand to-[#1D4ED8] rounded-3xl shadow-[0_20px_50px_rgba(182,49,6,0.3)] border border-white/10 z-10 flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/10 to-transparent"></div>
                <div className="absolute w-12 h-12 bg-brand-card/10 rounded-full blur-xl top-[-10px] right-[-10px]"></div>
              </motion.div>

              {/* Sphere */}
              <motion.div
                style={{ x: sphereX, y: sphereY }}
                className="absolute bottom-1/4 right-8 w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF7E6B] to-brand shadow-[0_15px_30px_rgba(182,49,6,0.25)] border border-white/10 z-20 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute w-6 h-6 bg-brand-card/25 rounded-full blur-md top-1 right-1"></div>
              </motion.div>

              {/* Floating Pill */}
              <motion.div
                style={{ x: sphereX, y: cubeY }}
                className="absolute top-1/4 left-8 w-12 h-20 rounded-full bg-gradient-to-b from-brand-card to-brand-surface border border-brand-border shadow-[0_10px_25px_rgba(0,0,0,0.4)] z-0 overflow-hidden"
              >
                <div className="absolute w-4 h-4 bg-brand rounded-full blur-sm top-2 left-2"></div>
              </motion.div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="md:w-7/12 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-brand-card relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-brand/10 to-transparent opacity-60 rounded-bl-[100px] pointer-events-none" />

            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-brand-text mb-5 tracking-tight leading-[1.1] font-poppins">
              <EditorialText text="Start discovering *better legal opportunities*" />
            </h2>
            <p className="text-[16px] md:text-[18px] text-brand-text-secondary mb-10 leading-relaxed max-w-[500px]">
              Apply to verified jobs with one click, connect with founders, and increase your visibility with top legal recruiters searching for your skills.
            </p>

            <div>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-bold text-[15px] hover:bg-brand-hover hover:shadow-[0_10px_30px_rgba(182,49,6,0.4)] hover:-translate-y-[1px] transition-all duration-300 group cursor-pointer"
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
