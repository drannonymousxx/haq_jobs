"use client";

import { motion } from "framer-motion";
import PricingCard from "@/components/pricing/PricingCard";
import EditorialText from "@/components/ui/EditorialText";

export default function ManageTalent() {
  return (
    <section className="w-full bg-brand-bg py-12 md:py-16 mb-10">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[32px] md:text-[40px] font-bold text-[#B63106] tracking-tight mb-4 font-poppins"
          >
            <EditorialText text="Manage *Talent*" />
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-brand-text-secondary max-w-[800px]"
          >
            Track applicants, organize hiring pipelines, and manage legal recruitment workflows from one unified dashboard.
          </motion.p>
        </div>

        {/* Centered Single Pricing Card Layout */}
        <div className="flex justify-center">
          <PricingCard
            name="Track"
            price="Free"
            description="Simple ATS for legal hiring teams"
            features={[
              "ATS integration",
              "Candidate tracking",
              "Applicant review tools",
              "Legal hiring workflow management"
            ]}
            actions={[
              { label: "Sign Up", href: "/signup/recruiter", variant: "primary" }
            ]}
            className="max-w-[500px]"
          />
        </div>

      </div>
    </section>
  );
}
