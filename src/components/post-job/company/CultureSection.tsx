"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface CultureSectionProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export function CultureSection({ title, description, imageUrl }: CultureSectionProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Editorial banner header */}
      <div className="flex items-center gap-2 text-brand">
        <Sparkles size={16} />
        <span className="text-xs font-black uppercase tracking-widest">Our Values</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Culture Description Column */}
        <div className="flex-1 flex flex-col gap-6">
          <h4 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight font-poppins leading-tight">
            {title}
          </h4>
          <p className="text-brand-text-secondary text-[16px] leading-relaxed font-medium whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Culture Visual Placeholder Column */}
        <div className="w-full lg:w-[380px] shrink-0 h-[280px] bg-brand-surface border border-brand-border rounded-3xl overflow-hidden relative select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-blue-500/5 flex flex-col justify-end p-6 border-b border-brand-border">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-sm mb-3">
              L
            </div>
            <span className="text-brand-text font-bold text-sm">Lexora Life</span>
            <span className="text-brand-text-muted text-xs mt-0.5">Integrity & legal precision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
