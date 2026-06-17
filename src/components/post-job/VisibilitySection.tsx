"use client";

import { motion } from "framer-motion";

export function VisibilitySection() {
  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Side: Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="text-sm font-bold text-[#013CF1] tracking-widest uppercase">High Exposure</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.1]">
            Get posting. <br />
            Get visibility. <br />
            Get ready to hire.
          </h2>
          <p className="text-lg text-gray-500 mt-2 max-w-md leading-relaxed">
            Job listings are visible where top legal professionals spend their time. Your roles typically get thousands of views per week; if you need more exposure, promote your job with a few clicks.
          </p>
        </motion.div>

        {/* Right Side: Floating Cards */}
        <div className="relative h-[500px] w-full bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-center gap-6">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full bg-white p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex flex-wrap p-1 gap-0.5 border border-gray-100">
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#013CF1] rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#013CF1]/60 rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#013CF1]/40 rounded-sm" />
                <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-[#013CF1]/20 rounded-sm" />
              </div>
              <div>
                <h3 className="text-black font-semibold">Associate Attorney</h3>
                <p className="text-gray-400 text-xs mt-0.5">Corporate M&A • New York</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 text-black text-sm font-medium rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
              Apply
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full bg-white p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 text-red-500 font-bold font-serif">
                L
              </div>
              <div>
                <h3 className="text-black font-semibold">Senior Paralegal</h3>
                <p className="text-gray-400 text-xs mt-0.5">Litigation • Remote</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 text-black text-sm font-medium rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
              Apply
            </div>
          </motion.div>

          {/* Decorative background lines to represent pipeline */}
          <div className="absolute top-10 left-10 bottom-10 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent -z-10" />
          
        </div>
      </div>
    </section>
  );
}
