"use client";

import React, { useState } from "react";
import { Share2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CompanyHeaderProps {
  name: string;
  tagline: string;
  logoText: string;
}

export function CompanyHeader({ name, tagline, logoText }: CompanyHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareText, setShareText] = useState("Share");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareText("Copied!");
    setTimeout(() => setShareText("Share"), 2000);
  };

  return (
    <div className="p-8 md:p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border bg-brand-surface">
      <div className="flex items-center gap-6">
        {/* Logo Container */}
        <div className="w-16 h-16 rounded-xl border border-brand-border bg-brand-card shadow-sm flex items-center justify-center p-1 flex-shrink-0 select-none">
          <div className="w-full h-full text-brand font-bold text-xl tracking-tighter flex items-center justify-center">
            {logoText}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-brand-text tracking-tight font-poppins">{name}</h3>
          <p className="text-brand-text-muted text-sm mt-1 font-medium">{tagline}</p>
        </div>
      </div>

      {/* Header Actions for Mobile/Responsive */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-xl text-brand-text-secondary hover:text-brand-text hover:bg-brand-card transition-all font-semibold text-sm cursor-pointer select-none"
        >
          <Share2 size={16} className="text-brand-text-muted" />
          <span>{shareText}</span>
        </button>

        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer select-none ${
            isFollowing
              ? "bg-brand/10 text-brand border border-brand/35 hover:bg-brand/20"
              : "bg-brand text-white hover:bg-brand-hover shadow-sm shadow-brand/20"
          }`}
        >
          {isFollowing ? (
            <>
              <Check size={14} />
              <span>Following</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Follow</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
