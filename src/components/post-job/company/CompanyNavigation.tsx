"use client";

import React from "react";
import { motion } from "framer-motion";

interface CompanyNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CompanyNavigation({ tabs, activeTab, onTabChange }: CompanyNavigationProps) {
  return (
    <div className="px-8 md:px-10 border-b border-brand-border bg-brand-surface flex items-center justify-between overflow-x-auto no-scrollbar">
      <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative py-4 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer select-none ${
              activeTab === tab 
                ? "text-brand-text font-bold" 
                : "text-brand-text-muted hover:text-brand-text"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="profileTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
