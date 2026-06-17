"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export function HeroSection() {
  return (
    <section className="relative w-full bg-white pt-12 pb-12 md:pt-16 md:pb-16 overflow-hidden border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-start">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6 md:gap-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left z-10"
        >
          <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-black leading-[1.05]">
            Find Legal Talent Built For You
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Post an unlimited amount of roles and instantly reach the most responsive, career-ready community of legal professionals and students.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center lg:justify-start">
            <Button href="/post-job/create" variant="primary" className="w-full sm:w-auto">
              Post a Job for Free
            </Button>
            <Button href="/demo" variant="outline" className="w-full sm:w-auto">
              Request a Demo
            </Button>
          </div>
        </motion.div>

        {/* Right Dashboard UI */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-full h-[500px] md:h-[600px] hidden md:block"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#013CF1]/5 via-transparent to-transparent rounded-full blur-[80px] -z-10" />
          
          <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
            {/* Mockup Header */}
            <div className="h-12 border-b border-gray-100 flex items-center px-4 justify-between bg-gray-50/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse opacity-50" />
            </div>

            {/* Mockup Body */}
            <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 bg-white overflow-hidden">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">Active Roles</div>
                  <div className="text-2xl font-bold text-black">Corporate Counsel</div>
                </div>
                <div className="px-3 py-1.5 bg-[#013CF1] text-white text-xs font-medium rounded-lg">
                  Published
                </div>
              </div>

              {/* Input Mockups */}
              <div className="space-y-4 flex-1">
                <div className="h-12 border border-gray-200 rounded-xl bg-gray-50 flex items-center px-4">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-3" />
                  <div className="w-1/3 h-4 bg-gray-200 rounded" />
                </div>
                <div className="h-24 border border-gray-200 rounded-xl bg-gray-50 p-4">
                  <div className="w-1/4 h-3 bg-gray-300 rounded mb-3" />
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-200 rounded" />
                    <div className="w-5/6 h-2 bg-gray-200 rounded" />
                    <div className="w-4/6 h-2 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 border border-gray-200 rounded-xl bg-gray-50 flex-1 flex items-center px-4">
                    <div className="w-1/2 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="h-12 border border-gray-200 rounded-xl bg-gray-50 flex-1 flex items-center px-4">
                    <div className="w-1/2 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>

              {/* Floating UI Card inside Mockup */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-[-20px] bg-white border border-gray-100 p-4 rounded-xl shadow-xl w-64"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#013CF1]">A+</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">New Applicant</div>
                    <div className="text-xs text-gray-500">Yale Law '23</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 flex-1 bg-gray-100 rounded-md" />
                  <div className="h-6 w-16 bg-[#013CF1]/10 rounded-md" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
