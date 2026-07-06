"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const tabs = ["Overview", "Team", "Culture", "Funding", "Careers"];

export function CompanyProfileSection() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section className="py-12 md:py-16 bg-brand-bg border-y border-brand-border">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-4 tracking-tight">
            Tell your story with company profiles
          </h2>
          <p className="text-brand-text-muted text-lg mb-6">
            Designed to show what makes you different; its branding at its best
          </p>
          <div className="text-[#B63106] font-medium hover:underline cursor-pointer inline-flex items-center gap-2">
            Create your company profile <span>→</span>
          </div>
        </motion.div>

        {/* Profile Card UI */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Header Area */}
          <div className="p-8 md:p-10 pb-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl border border-brand-border shadow-sm flex items-center justify-center p-1 flex-shrink-0">
              <div className="w-full h-full text-[#B63106] font-bold text-xl tracking-tighter flex items-center justify-center">
                Lx
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-semibold text-brand-text tracking-tight">Lexora AI</h3>
              <p className="text-brand-text-muted text-sm mt-1">Intelligent legal research and automation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 md:px-10 border-b border-brand-border flex items-center justify-between">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab ? "text-brand-text" : "text-brand-text-muted hover:text-brand-text"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="profileTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 hidden md:flex">
              <span className="text-sm text-brand-text-muted cursor-pointer hover:text-brand-text transition-colors">Share</span>
              <button className="px-4 py-1.5 text-sm font-medium text-[#B63106] border border-[#B63106] rounded-lg hover:bg-brand/10 transition-colors">
                Follow
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-8 md:p-10 min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "Overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h4 className="text-xl font-semibold text-brand-text mb-4">Your intelligent legal research companion</h4>
                      <p className="text-brand-text-secondary text-sm leading-relaxed">
                        Founded in 2024, Lexora AI is a San Francisco-based technology company passionate about transforming legal workflows and dedicated to empowering new ways of researching, drafting, and analyzing. Today, Lexora AI connects law firms with intelligent automation tools across the United States. By building advanced, domain-specific models, Lexora aims to connect legal professionals with the insights they care about most.
                      </p>
                    </div>
                    <div className="h-[250px] w-full bg-brand-bg rounded-xl overflow-hidden relative border border-brand-border">
                      {/* Image Placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-bg to-[#B63106]/10 flex items-center justify-center">
                        <span className="text-brand-text-muted font-medium">Lexora Workspace</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab !== "Overview" && (
                  <div className="flex items-center justify-center h-48 text-brand-text-muted text-sm">
                    {activeTab} content coming soon.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
