"use client";

import { motion } from "framer-motion";
import PricingCard from "@/components/pricing/PricingCard";
import EditorialText from "@/components/ui/EditorialText";

export default function FindTalent() {
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
            <EditorialText text="Find *Talent*" />
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[17px] md:text-[19px] leading-relaxed text-brand-text-secondary max-w-[800px]"
          >
            Discover top legal talent with advanced search, smart filtering, and recruiter-focused sourcing tools.
          </motion.p>
        </div>

        {/* Pricing Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Access */}
          <PricingCard
            name="Access"
            price="Free"
            description="Basic sourcing access"
            features={[
              "Candidate browsing",
              "ATS integration",
              "Basic outreach tools"
            ]}
            actions={[
              { label: "Start Sourcing Free", href: "/signup/recruiter?mode=signup", variant: "primary" },
              { label: "Learn More", href: "/pricing/details", variant: "outline" }
            ]}
          />

          {/* Card 2: Recruit Pro */}
          <PricingCard
            name="Recruit Pro"
            price="₹9,999"
            priceSuffix="/mo"
            description="Advanced hiring and sourcing tools"
            features={[
              "Advanced candidate filters",
              "Personalized outreach",
              "Resume access",
              "Instant scheduling",
              "Unlimited messaging",
              "Legal-specific discovery tools"
            ]}
            actions={[
              { label: "Upgrade Sourcing", href: "/signup/recruiter?mode=signup", variant: "primary" },
              { label: "Learn More", href: "/pricing/details", variant: "outline" }
            ]}
            badge="Popular"
            badgeStyle="coral"
            isFeatured={true}
          />

          {/* Card 3: Elite Hiring */}
          <PricingCard
            name="Elite Hiring"
            price="Custom"
            description="Dedicated recruitment support for growing firms"
            features={[
              "Dedicated hiring specialist",
              "Curated weekly candidate pipeline",
              "Priority candidate access",
              "Custom sourcing strategy",
              "Assisted interview coordination"
            ]}
            actions={[
              { label: "Schedule a Call", href: "/for-companies?plan=elite-hiring&source=pricing-page#consultation", variant: "primary" },
              { label: "Learn More", href: "/pricing/details", variant: "outline" }
            ]}
            badge="Best Value"
            badgeStyle="gold"
          />

        </div>

      </div>
    </section>
  );
}
