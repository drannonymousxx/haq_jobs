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
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'border-[#013CF1]' : 'border-[#CBD5E1] group-hover:border-[#94A3B8]'}`}>
        <div className={`w-2.5 h-2.5 rounded-full bg-[#013CF1] transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
      <span className={`text-[15px] transition-colors ${checked ? 'text-[#191D20] font-medium' : 'text-[#475569] group-hover:text-[#191D20]'}`}>
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
    <section 
      className="w-full py-24 md:py-32"
      style={{
        background: "linear-gradient(90deg, #FDF7F2 0%, #F8FAFC 45%, #EEF4FF 100%)"
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-col items-center">
        
        {/* Intro / Heading Area */}
        <div className="w-full max-w-4xl text-center md:text-left mb-16 md:mb-20 self-start">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block text-xs font-bold tracking-[0.15em] text-[#013CF1] uppercase">
              Built for modern legal hiring
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191D20] tracking-tight leading-[1.1] mb-8 max-w-3xl"
          >
            Flexible hiring solutions for every stage of your legal growth
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] leading-relaxed text-[#475569] max-w-3xl space-y-4"
          >
            <p>
              From startup legal hiring to enterprise recruitment workflows, HAQJobs helps firms and legal teams discover qualified talent faster with streamlined hiring tools.
            </p>
            <p>
              Looking for something a bit more specific? We&apos;re happy to create a custom solution fit for your team.
            </p>
            <p className="font-medium text-[#191D20] pt-2">
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
          className="w-full bg-white rounded-[28px] md:rounded-[36px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E2E8F0] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side */}
          <div className="w-full md:w-[40%] p-10 md:p-14 flex flex-col items-start border-b md:border-b-0 md:border-r border-[#E2E8F0]">
            <div className="mb-16">
              <Image 
                src="/logofull.png" 
                alt="HAQJobs Logo" 
                width={140} 
                height={36} 
                style={{ width: '140px', height: 'auto' }}
              />
            </div>
            
            <div className="mt-auto md:mt-10 lg:mt-20">
              <h3 className="text-2xl font-bold text-[#191D20] mb-4">
                Schedule a hiring consultation
              </h3>
              <p className="text-[15px] text-[#64748B] leading-relaxed max-w-[280px]">
                Tell us about your hiring needs and we’ll connect you with the right team.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-[60%] p-10 md:p-14 bg-white">
            <div className="flex flex-col gap-12">
              
              {/* Question 1 */}
              <div>
                <h4 className="text-[16px] font-semibold text-[#191D20] mb-5">
                  Where are you primarily hiring? <span className="text-[#013CF1]">*</span>
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
                <h4 className="text-[16px] font-semibold text-[#191D20] mb-5">
                  What best describes your role? <span className="text-[#013CF1]">*</span>
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
                <h4 className="text-[16px] font-semibold text-[#191D20] mb-5">
                  What is your company headcount? <span className="text-[#013CF1]">*</span>
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
              <button className="px-10 py-4 bg-[#191D20] text-white text-[15px] font-semibold rounded-full hover:bg-[#2D3339] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto min-w-[200px]">
                Submit
              </button>
            </div>
            
          </div>
        </motion.div>

      </div>
    </section>
  );
}
