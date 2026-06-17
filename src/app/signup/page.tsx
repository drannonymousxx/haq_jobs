"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Briefcase, ChevronRight, ArrowLeft } from "lucide-react";

export default function SignupSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logofull.png" 
            alt="HAQJobs Logo" 
            width={150} 
            height={39} 
            style={{ width: "150px", height: "auto" }}
            priority 
          />
        </Link>
        <Link 
          href="/login" 
          className="text-sm font-semibold text-slate-600 hover:text-[#013CF1] transition-colors flex items-center gap-1"
        >
          Already have an account? <span className="text-[#013CF1] hover:underline">Log in</span>
        </Link>
      </div>

      {/* Main Selection Area */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl w-full mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 max-w-md"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight font-poppins mb-3">
            Join HAQJobs
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 leading-relaxed">
            Create an account to start applying to roles or begin hiring premier legal talent.
          </p>
        </motion.div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
          
          {/* Card 1: Candidate */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-bl-[100%] translate-x-4 -translate-y-4 group-hover:bg-[#013CF1]/5 transition-colors duration-300"></div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-[#013CF1] transition-all duration-300">
                <User className="text-[#013CF1] group-hover:text-white w-6 h-6 transition-colors duration-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-poppins mb-2 group-hover:text-[#013CF1] transition-colors">
                I'm looking for opportunities
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                Discover internship slots, associate roles, clerkships, and courses tailored for law students and legal professionals.
              </p>
            </div>

            <Link 
              href="/signup/candidate" 
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold bg-black text-white hover:bg-slate-900 py-3.5 px-6 rounded-xl transition-all duration-300 w-full"
            >
              Join as Candidate
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Card 2: Recruiter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/40 rounded-bl-[100%] translate-x-4 -translate-y-4 group-hover:bg-amber-100/30 transition-colors duration-300"></div>
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-all duration-300">
                <Briefcase className="text-amber-600 group-hover:text-white w-6 h-6 transition-colors duration-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-poppins mb-2 group-hover:text-amber-600 transition-colors">
                I'm hiring legal talent
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                Post internships, clerkships, and jobs. Review applications and connect directly with top legal minds across India.
              </p>
            </div>

            <Link 
              href="/signup/recruiter" 
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold bg-black text-white hover:bg-slate-900 py-3.5 px-6 rounded-xl transition-all duration-300 w-full"
            >
              Join as Recruiter
              <ChevronRight size={16} />
            </Link>
          </motion.div>

        </div>

        {/* Back Link */}
        <div className="mt-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={12} /> Back to homepage
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-400 font-medium py-4">
        &copy; {new Date().getFullYear()} HAQJobs. All rights reserved.
      </div>

    </div>
  );
}
