"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CompanyOverviewProps {
  headline: string;
  description: string;
  imageUrl?: string;
}

export function CompanyOverview({ headline, description, imageUrl }: CompanyOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      {/* Left side text columns */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <h4 className="text-xl md:text-2xl font-bold text-brand-text tracking-tight font-poppins">
          {headline}
        </h4>
        <p className="text-brand-text-secondary text-[15px] leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* Right side image placeholder */}
      <div className="lg:col-span-5 w-full h-[280px] bg-brand-bg rounded-2xl overflow-hidden relative border border-brand-border group select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-surface to-brand/10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3 text-brand">
            <ChevronDown className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="text-brand-text font-bold text-sm">Lexora Workspace</span>
          <span className="text-brand-text-muted text-xs mt-1">Interactive drafting dashboard</span>
        </div>
      </div>
    </div>
  );
}
