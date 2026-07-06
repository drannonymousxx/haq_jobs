"use client";

import { useMotionValue } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import FloatingElements from "./FloatingElements";

export default function JobsHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Track mouse position to pass to FloatingElements for parallax effect
    // We update motion values directly, ensuring high-performance (no React re-renders)
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <section 
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden py-24 px-6 lg:px-8"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Background Parallax Elements */}
      <FloatingElements mouseX={mouseX} mouseY={mouseY} />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full mt-8">
        
        {/* Eyebrow */}
        <span className="text-[11px] sm:text-[13px] font-bold tracking-[0.15em] uppercase text-[#B63106] mb-8">
          DISCOVER TOP LEGAL & STARTUP OPPORTUNITIES
        </span>
        
        {/* Main Heading */}
        <h1 className="text-[46px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-bold text-brand-text leading-[1.05] tracking-tight mb-14 lg:mb-16">
          Find your next legal opportunity.
        </h1>

        {/* Search Bar Container */}
        <div className="w-full max-w-[840px] bg-brand-card rounded-[2rem] sm:rounded-full shadow-[0_20px_60px_-15px_rgba(182, 49, 6,0.08)] border border-[rgba(182, 49, 6,0.06)] p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-0 transition-all duration-300 hover:shadow-[0_25px_65px_-15px_rgba(182, 49, 6,0.12)] focus-within:ring-4 focus-within:ring-[rgba(182, 49, 6,0.05)] focus-within:border-[rgba(182, 49, 6,0.15)] relative">
          
          {/* Job Title Input */}
          <div className="flex-1 flex items-center gap-3.5 px-6 py-4 w-full sm:border-r border-brand-border">
            <Search size={22} className="text-[#64748B] flex-shrink-0" strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Job title, keyword, or company" 
              className="w-full bg-transparent border-none outline-none text-brand-text placeholder:text-[#94A3B8] text-[16px] font-medium"
            />
          </div>

          {/* Location Input */}
          <div className="flex-1 flex items-center gap-3.5 px-6 py-4 w-full">
            <MapPin size={22} className="text-[#64748B] flex-shrink-0" strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Location or remote" 
              className="w-full bg-transparent border-none outline-none text-brand-text placeholder:text-[#94A3B8] text-[16px] font-medium"
            />
          </div>

          {/* Search Button */}
          <button className="w-full sm:w-auto bg-[#191D20] text-white px-10 py-4 sm:py-4 rounded-[1.5rem] sm:rounded-full font-semibold text-[16px] hover:bg-[#B63106] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
