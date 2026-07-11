"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Custom Radio Button Component
function CustomRadio({ 
  label, 
  name, 
  checked, 
  onChange 
}: { 
  label: string; 
  name: string; 
  checked: boolean; 
  onChange: () => void 
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'border-brand bg-brand/10' : 'border-brand-border group-hover:border-brand/40 bg-brand-surface'}`}>
        <div className={`w-2.5 h-2.5 rounded-full bg-brand transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
      <span className={`text-[15px] transition-colors ${checked ? 'text-brand-text font-semibold' : 'text-brand-text-muted group-hover:text-brand-text'}`}>
        {label}
      </span>
      <input 
        type="radio" 
        name={name} 
        checked={checked} 
        onChange={onChange}
        className="hidden" 
      />
    </label>
  );
}

export default function CompaniesHiringForm() {
  const [hiringLocation, setHiringLocation] = useState("");
  const [role, setRole] = useState("");
  const [headcount, setHeadcount] = useState("");

  const locations = [
    "Pan India", "Delhi NCR", "Mumbai", "Bangalore", 
    "Hyderabad", "Chennai", "Kolkata", "Pune", 
    "Remote", "International"
  ];

  const roles = [
    "Founder / Managing Partner", "HR / Talent Acquisition", 
    "Legal Recruiter", "Startup Founder", "In-house Counsel", 
    "Hiring Manager", "Other"
  ];

  const headcounts = ["1–10", "11–50", "51–200", "200+"];

  return (
    <section className="w-full py-24 md:py-32 bg-brand-bg relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-brand opacity-[0.03] rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-[#1D4ED8] opacity-[0.02] rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-col items-center relative z-10">
        
        {/* Intro / Heading Area */}
        <div className="w-full max-w-4xl text-center md:text-left mb-16 md:mb-20 self-start select-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block text-xs font-bold tracking-[0.15em] text-brand uppercase">
              Built for modern legal hiring
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight leading-[1.1] mb-8 max-w-3xl"
          >
            Flexible hiring solutions for every stage of your legal growth
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] leading-relaxed text-brand-text-secondary max-w-3xl space-y-4 font-medium"
          >
            <p>
              From startup legal hiring to enterprise recruitment workflows, HAQJobs helps firms and legal teams discover qualified talent faster with streamlined hiring tools.
            </p>
            <p>
              Looking for something a bit more specific? We&apos;re happy to create a custom solution fit for your team.
            </p>
            <p className="font-semibold text-brand pt-2">
              To find you the best option, we just need a few details →
            </p>
          </motion.div>
        </div>

        {/* Large Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-brand-card rounded-[28px] md:rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-brand-border overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side */}
          <div className="w-full md:w-[40%] p-10 md:p-14 flex flex-col items-start border-b md:border-b-0 md:border-r border-brand-border bg-brand-surface select-none">
            <div className="mb-16">
              <Image className="brightness-0 invert" 
                src="/logofull.png" 
                alt="HAQJobs Logo" 
                width={140} 
                height={36} 
                style={{ width: '140px', height: 'auto' }}
              />
            </div>
            
            <div className="mt-auto md:mt-10 lg:mt-20">
              <h3 className="text-2xl font-bold text-brand-text mb-4">
                Schedule a hiring consultation
              </h3>
              <p className="text-[15px] text-brand-text-muted leading-relaxed max-w-[280px]">
                Tell us about your hiring needs and we’ll connect you with the right team.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-[60%] p-10 md:p-14 bg-brand-card">
            <div className="flex flex-col gap-12">
              
              {/* Question 1 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  Where are you primarily hiring? <span className="text-brand">*</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {locations.map((loc) => (
                    <CustomRadio 
                      key={loc}
                      label={loc}
                      name="location"
                      checked={hiringLocation === loc}
                      onChange={() => setHiringLocation(loc)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What best describes your role? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {roles.map((r) => (
                    <CustomRadio 
                      key={r}
                      label={r}
                      name="role"
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What is your company headcount? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {headcounts.map((hc) => (
                    <CustomRadio 
                      key={hc}
                      label={hc}
                      name="headcount"
                      checked={headcount === hc}
                      onChange={() => setHeadcount(hc)}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="mt-14 flex justify-center md:justify-start">
              <button className="px-10 py-4 bg-brand text-white text-[15px] font-bold rounded-full hover:bg-brand-hover hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(182,49,6,0.35)] transition-all duration-300 w-full sm:w-auto min-w-[200px] cursor-pointer">
                Submit
              </button>
            </div>
            
          </div>
        </motion.div>

      </div>
    </section>
  );
}
