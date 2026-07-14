"use client";

import { motion } from "framer-motion";
import PricingCard from "@/components/pricing/PricingCard";
import EditorialText from "@/components/ui/EditorialText";

export default function AttractTalent() {
  return (
    <section className="w-full bg-brand-bg py-12 md:py-16">
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
            <EditorialText text="Attract *Talent*" />
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-brand-text-secondary max-w-[800px]"
          >
            Create visibility for your legal opportunities and reach qualified candidates through curated listings and employer branding.
          </motion.p>
        </div>

        {/* Pricing Cards Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          <PricingCard
            name="Access"
            price="Free"
            description="Free plan for all employers"
            features={[
              "Post jobs",
              "Review applicants",
              "Branded company profiles",
              "Built-in hiring dashboard"
            ]}
            actions={[
              { label: "Sign Up", href: "/signup/recruiter", variant: "outline" }
            ]}
          />

          <PricingCard
            name="Promoted Jobs"
            price="From ₹4,999"
            description="Boost visibility for high-priority listings"
            features={[
              "Expanded candidate reach",
              "Priority listing placement",
              "Better exposure across categories",
              "Increased application visibility"
            ]}
            actions={[
              { label: "Get Started", href: "/signup/recruiter", variant: "primary" }
            ]}
            badge="Add-on"
            badgeStyle="coral"
            isFeatured={true}
          />
        </div>

      </div>
    </section>
  );
}
