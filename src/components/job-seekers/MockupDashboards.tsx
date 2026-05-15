"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, BookOpen } from "lucide-react";

export default function MockupDashboards() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Text Content */}
        <div className="flex-1 max-w-xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-[#191D20] mb-6 leading-tight"
          >
            A Smarter Way to Track Your Legal Career
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-[#191D20]/70 mb-8"
          >
            Manage applications, track internship progress, and stand out to top law firms with a profile designed to highlight your legal expertise.
          </motion.p>

          <motion.ul 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              "Application tracking & status updates",
              "Profile strength insights for law students",
              "Direct messaging with legal recruiters"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[#191D20]/80">
                <CheckCircle2 size={20} className="text-[#013CF1]" />
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Mockup Graphics */}
        <div className="flex-1 relative w-full h-[450px] lg:h-[550px] flex items-center justify-center">
          
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#013CF1]/10 to-transparent rounded-full blur-3xl opacity-60" />

          {/* Main Dashboard Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="absolute z-10 w-[90%] md:w-[80%] max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013CF1] to-[#013CF1]/70" />
                <div>
                  <div className="w-24 h-4 bg-[#191D20]/10 rounded-md mb-1.5" />
                  <div className="w-16 h-3 bg-[#191D20]/5 rounded-md" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#191D20]/5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#191D20]/30" />
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#F0F0F0]/50 border border-[#191D20]/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-blue-100 text-[#013CF1]' : i === 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                      {i === 1 ? <TrendingUp size={16} /> : i === 2 ? <Users size={16} /> : <BookOpen size={16} />}
                    </div>
                    <div>
                      <div className="w-32 h-3.5 bg-[#191D20]/20 rounded-md mb-1.5" />
                      <div className="w-20 h-2.5 bg-[#191D20]/10 rounded-md" />
                    </div>
                  </div>
                  <div className="w-16 h-6 rounded-full bg-white border border-[#191D20]/5 flex items-center justify-center">
                    <div className="w-8 h-1.5 bg-[#013CF1]/30 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Widget 1 */}
          <motion.div 
            initial={{ opacity: 0, x: 40, y: -20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="absolute z-20 top-12 -right-4 md:right-0 bg-white/90 backdrop-blur-md border border-white shadow-[0_15px_35px_-5px_rgba(0,0,0,0.08)] rounded-2xl p-4 w-48"
          >
            <div className="text-xs font-semibold text-[#191D20]/60 mb-2 uppercase tracking-wider">Profile Strength</div>
            <div className="flex items-end gap-2 mb-2">
              <div className="text-2xl font-bold text-[#013CF1]">85%</div>
              <div className="text-xs text-emerald-500 font-medium pb-1">+12%</div>
            </div>
            <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-[#013CF1] rounded-full" 
              />
            </div>
          </motion.div>

          {/* Floating Widget 2 */}
          <motion.div 
            initial={{ opacity: 0, x: -40, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
            className="absolute z-0 bottom-12 -left-4 md:left-4 bg-[#191D20] text-white border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl p-5 w-56"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#013CF1] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-[#013CF1] border-2 border-[#191D20]"></span>
              </div>
              <div className="text-sm font-medium">Interview Request</div>
            </div>
            <div className="text-xs text-white/60">
              A top tier firm wants to schedule a call regarding your application.
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
