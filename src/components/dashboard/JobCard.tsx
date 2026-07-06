"use client";

import React, { useState } from "react";
import { Bookmark, MapPin, Clock, Building2 } from "lucide-react";

interface JobCardProps {
  id: number | string;
  title: string;
  company: string;
  location: string;
  type: string;        // e.g. Internship, Full Time
  workplace: string;   // e.g. Remote, Hybrid, Onsite
  postedAt: string;
  logoText?: string;
  logoBg?: string;
  onSave?: (id: number | string, isSaved: boolean) => void;
  initialSaved?: boolean;
  onApply?: (id: number | string) => void;
  initialApplied?: boolean;
  onClick?: () => void;
  isExpanded?: boolean;
}

export default function JobCard({
  id,
  title,
  company,
  location,
  type,
  workplace,
  postedAt,
  logoText = "SAM",
  logoBg = "bg-blue-100 text-[#B63106]",
  onSave,
  initialSaved = false,
  onApply,
  initialApplied = false,
  onClick,
  isExpanded = false
}: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [applied, setApplied] = useState(initialApplied);

  // Sync props with state
  React.useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  React.useEffect(() => {
    setApplied(initialApplied);
  }, [initialApplied]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (onSave) {
      onSave(id, newSavedState);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (applied) return;
    setApplied(true);
    if (onApply) {
      onApply(id);
    }
  };

  const workplaceColors: Record<string, string> = {
    Remote: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Hybrid: "bg-amber-50 text-amber-700 border border-amber-100",
    Onsite: "bg-brand-bg text-brand-text-secondary border border-brand-border"
  };

  const badgeColorClass = workplaceColors[workplace] || workplaceColors.Onsite;

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer ${
        isExpanded 
          ? "border-blue-500 bg-brand/10/10 ring-2 ring-blue-500/10" 
          : "border-brand-border bg-brand-card hover:border-brand-border"
      }`}
    >
      
      {/* Left section: Logo + Details */}
      <div className="flex items-start gap-4">
        {/* Company Logo Placeholder */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm select-none ${logoBg}`}>
          {logoText}
        </div>
        
        {/* Job Details */}
        <div className="space-y-1.5">
          <h4 className="text-base font-bold text-brand-text group-hover:text-[#B63106] transition-colors leading-snug">
            {title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-text-muted font-medium">
            <span className="flex items-center gap-1 font-semibold text-brand-text-secondary">
              <Building2 size={12} className="text-brand-text-muted" />
              {company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-brand-text-muted" />
              {location}
            </span>
          </div>
 
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColorClass}`}>
              {workplace}
            </span>
            <span className="text-[10px] font-bold bg-brand/10 text-[#B63106] border border-blue-100 px-2.5 py-0.5 rounded-full">
              {type}
            </span>
            <span className="text-[10px] font-medium text-brand-text-muted flex items-center gap-1 ml-1 select-none">
              <Clock size={10} /> {postedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Save / Apply button */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 gap-3">
        <button
          onClick={handleSaveToggle}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
            saved 
              ? "bg-[#B63106] border-[#B63106] text-white hover:bg-[#932604]" 
              : "bg-brand-card border-brand-border text-brand-text-muted hover:text-brand-text-secondary hover:border-slate-300"
          }`}
          title={saved ? "Saved Opportunity" : "Save Opportunity"}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        
        {applied ? (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 border border-emerald-200 rounded-xl select-none whitespace-nowrap flex items-center gap-1">
            ✓ Applied
          </span>
        ) : (
          <button
            onClick={handleApplyClick}
            className="text-xs font-bold text-brand-text-secondary hover:text-white bg-brand-bg hover:bg-black px-4 py-2 border border-brand-border hover:border-black rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Quick Apply
          </button>
        )}
      </div>

    </div>
  );
}
