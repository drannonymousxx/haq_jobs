"use client";

import { motion } from "framer-motion";
import { CompanyProfileLayout } from "./company/CompanyProfileLayout";
import { lexoraProfileData } from "./company/mockData";

export function CompanyProfileSection() {
  return (
    <section className="py-16 md:py-24 bg-brand-bg border-y border-brand-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-brand opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1080px] mx-auto px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-4 tracking-tight font-poppins leading-tight">
            Tell your story with company profiles
          </h2>
          <p className="text-brand-text-muted text-lg mb-6 font-medium">
            Designed to show what makes you different; it&apos;s branding at its best.
          </p>
          <div className="text-brand hover:text-brand-hover font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 select-none">
            Create your company profile <span>→</span>
          </div>
        </motion.div>

        {/* Dynamic Company Profile Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full"
        >
          <CompanyProfileLayout companyData={lexoraProfileData} />
        </motion.div>

      </div>
    </section>
  );
}
export default CompanyProfileSection;
