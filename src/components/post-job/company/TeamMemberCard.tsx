"use client";

import React from "react";
import { Quote } from "lucide-react";

interface TeamMemberProps {
  name: string;
  designation: string;
  quote: string;
  avatarUrl?: string;
}

export function TeamMemberCard({ name, designation, quote, avatarUrl }: TeamMemberProps) {
  // Generate initials for placeholder avatar
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 h-full shadow-sm hover:border-brand/20 transition-all">
      {/* Profile Image/Avatar Container */}
      <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 shadow-sm flex items-center justify-center text-brand font-bold text-lg mb-5 select-none flex-shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-[17px] font-bold text-brand-text leading-snug">{name}</h4>
          <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider block mt-1">
            {designation}
          </span>
        </div>

        {/* Quote Block */}
        <div className="mt-6 border-t border-brand-border pt-4 relative">
          <Quote className="absolute top-4 right-0 w-8 h-8 text-brand/5 pointer-events-none" />
          <p className="text-sm text-brand-text-secondary leading-relaxed italic font-medium">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
