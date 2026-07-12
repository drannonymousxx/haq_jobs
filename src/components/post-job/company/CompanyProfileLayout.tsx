"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyProfileData } from "./types";
import { CompanyHeader } from "./CompanyHeader";
import { CompanyNavigation } from "./CompanyNavigation";
import { CompanyOverview } from "./CompanyOverview";
import { TeamMemberCard } from "./TeamMemberCard";
import { CultureSection } from "./CultureSection";
import { FundingTimeline } from "./FundingTimeline";
import { CompanyJobsList } from "./CompanyJobsList";

interface CompanyProfileLayoutProps {
  companyData: CompanyProfileData;
}

const tabs = ["Overview", "Team", "Culture", "Funding", "Careers"];

export function CompanyProfileLayout({ companyData }: CompanyProfileLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="w-full bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-xl">
      {/* 1. Header Portion */}
      <CompanyHeader 
        name={companyData.name}
        tagline={companyData.tagline}
        logoText={companyData.logoText}
      />

      {/* 2. Tabs Navigation */}
      <CompanyNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 3. Main Content Portal */}
      <div className="p-8 md:p-10 min-h-[380px] bg-brand-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Overview" && (
              <CompanyOverview 
                headline={companyData.tagline}
                description={companyData.detailedOverview}
                imageUrl={companyData.overviewImageUrl}
              />
            )}

            {activeTab === "Team" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyData.members.map((member) => (
                  <TeamMemberCard 
                    key={member.name}
                    name={member.name}
                    designation={member.designation}
                    quote={member.quote}
                    avatarUrl={member.avatarUrl}
                  />
                ))}
              </div>
            )}

            {activeTab === "Culture" && (
              <CultureSection 
                title={companyData.culture.title}
                description={companyData.culture.description}
                imageUrl={companyData.culture.imageUrl}
              />
            )}

            {activeTab === "Funding" && (
              <FundingTimeline 
                fundingRounds={companyData.funding}
              />
            )}

            {activeTab === "Careers" && (
              <CompanyJobsList 
                companyName={companyData.name}
                jobs={companyData.jobs}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
