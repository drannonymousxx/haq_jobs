"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
import { CheckCircle2, FileText, Briefcase, Calendar, Star, Scale } from "lucide-react";

interface FloatingElementsProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export default function FloatingElements({ mouseX, mouseY }: FloatingElementsProps) {
  // Parallax transforms mapping standard screen coords (0 to 2000px approx) 
  // to very subtle pixel movements for high-end inertia.
  const moveX1 = useTransform(mouseX, [0, 2000], [25, -25]);
  const moveY1 = useTransform(mouseY, [0, 2000], [25, -25]);
  
  const moveX2 = useTransform(mouseX, [0, 2000], [-15, 15]);
  const moveY2 = useTransform(mouseY, [0, 2000], [-15, 15]);
  
  const moveX3 = useTransform(mouseX, [0, 2000], [10, -10]);
  const moveY3 = useTransform(mouseY, [0, 2000], [-10, 10]);

  const moveX4 = useTransform(mouseX, [0, 2000], [-30, 30]);
  const moveY4 = useTransform(mouseY, [0, 2000], [30, -30]);

  const moveX5 = useTransform(mouseX, [0, 2000], [20, -20]);
  const moveY5 = useTransform(mouseY, [0, 2000], [-20, 20]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 1. Interview Scheduled Notification (Top Left) */}
      <motion.div 
        style={{ x: moveX1, y: moveY1 }}
        className="absolute top-[18%] left-[8%] xl:left-[12%] hidden md:flex items-center gap-3 bg-brand-card p-3.5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(182, 49, 6,0.12)] border border-[rgba(182, 49, 6,0.06)]"
      >
        <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#B63106]">
          <Calendar size={18} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-brand-text tracking-tight">Interview Scheduled</p>
          <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Tomorrow, 10:00 AM</p>
        </div>
      </motion.div>

      {/* 2. Abstract Legal Document (Mid Left) */}
      <motion.div
        style={{ x: moveX2, y: moveY2 }}
        className="absolute top-[55%] left-[5%] xl:left-[8%] hidden lg:block"
      >
        <div className="relative w-[72px] h-[90px] bg-brand-card rounded-xl shadow-[0_15px_35px_-10px_rgba(182, 49, 6,0.1)] border border-[rgba(182, 49, 6,0.05)] p-3 flex flex-col gap-2.5 rotate-[-6deg]">
          <div className="w-full h-1.5 bg-[#EEF2FF] rounded-full"></div>
          <div className="w-4/5 h-1.5 bg-[#EEF2FF] rounded-full"></div>
          <div className="w-full h-1.5 bg-[#EEF2FF] rounded-full"></div>
          <div className="mt-auto self-end w-6 h-6 rounded-full bg-[#B63106] flex items-center justify-center shadow-md">
            <Scale size={10} className="text-white" strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* 3. Soft Geometric Sphere (Bottom Left) */}
      <motion.div
        style={{ x: moveX3, y: moveY3 }}
        className="absolute bottom-[15%] left-[18%] w-48 h-48 rounded-full bg-gradient-to-br from-[rgba(182, 49, 6,0.04)] to-transparent blur-2xl hidden md:block"
      />

      {/* 4. Remote Internship Chip (Top Right) */}
      <motion.div
        style={{ x: moveX4, y: moveY4 }}
        className="absolute top-[22%] right-[10%] xl:right-[15%] hidden md:flex items-center gap-2 bg-brand-card px-4 py-2.5 rounded-full shadow-[0_12px_30px_-5px_rgba(182, 49, 6,0.08)] border border-[rgba(182, 49, 6,0.05)]"
      >
        <div className="w-2 h-2 rounded-full bg-[#B63106] animate-pulse"></div>
        <span className="text-[12px] font-bold text-brand-text tracking-tight">Remote Internship</span>
      </motion.div>

      {/* 5. Legal Briefcase Icon (Mid Right) */}
      <motion.div
        style={{ x: moveX5, y: moveY5 }}
        className="absolute top-[52%] right-[6%] xl:right-[10%] hidden lg:flex w-[68px] h-[68px] bg-brand-card rounded-[1.25rem] items-center justify-center shadow-[0_20px_40px_-10px_rgba(182, 49, 6,0.12)] border border-[rgba(182, 49, 6,0.06)] rotate-[8deg]"
      >
        <Briefcase size={26} className="text-[#B63106]" strokeWidth={2} />
      </motion.div>

      {/* 6. Application Sent Mini Card (Bottom Right) */}
      <motion.div
        style={{ x: moveX1, y: moveY2 }}
        className="absolute bottom-[28%] right-[12%] xl:right-[18%] hidden md:flex items-center gap-2.5 bg-brand-card p-3 rounded-2xl shadow-[0_15px_30px_-10px_rgba(182, 49, 6,0.1)] border border-[rgba(182, 49, 6,0.05)]"
      >
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#B63106]">
          <CheckCircle2 size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-brand-text tracking-tight pr-2">Application Sent</p>
        </div>
      </motion.div>

      {/* Mobile-only subtle elements (Kept to 2 to avoid clutter) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-[12%] right-[8%] md:hidden flex items-center gap-1.5 bg-brand-card px-3 py-1.5 rounded-full shadow-lg border border-[rgba(182, 49, 6,0.05)]"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#B63106]"></div>
        <span className="text-[10px] font-bold text-brand-text">Remote</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-[20%] left-[8%] md:hidden flex items-center gap-1.5 bg-brand-card px-3 py-1.5 rounded-full shadow-lg border border-[rgba(182, 49, 6,0.05)]"
      >
        <Star size={10} className="text-[#B63106]" />
        <span className="text-[10px] font-bold text-brand-text">Top Firms</span>
      </motion.div>

    </div>
  );
}
