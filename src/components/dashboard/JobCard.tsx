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
  logoBg = "bg-blue-100 text-[#013CF1]",
  onSave,
  initialSaved = false
}: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (onSave) {
      onSave(id, newSavedState);
    }
  };

  const workplaceColors: Record<string, string> = {
    Remote: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Hybrid: "bg-amber-50 text-amber-700 border border-amber-100",
    Onsite: "bg-slate-50 text-slate-700 border border-slate-100"
  };

  const badgeColorClass = workplaceColors[workplace] || workplaceColors.Onsite;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
      
      {/* Left section: Logo + Details */}
      <div className="flex items-start gap-4">
        {/* Company Logo Placeholder */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm select-none ${logoBg}`}>
          {logoText}
        </div>
        
        {/* Job Details */}
        <div className="space-y-1.5">
          <h4 className="text-base font-bold text-slate-800 group-hover:text-[#013CF1] transition-colors leading-snug">
            {title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Building2 size={12} className="text-slate-400" />
              {company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {location}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColorClass}`}>
              {workplace}
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-[#013CF1] border border-blue-100 px-2.5 py-0.5 rounded-full">
              {type}
            </span>
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 ml-1 select-none">
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
              ? "bg-[#013CF1] border-[#013CF1] text-white hover:bg-[#012cc4]" 
              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
          }`}
          title={saved ? "Saved Opportunity" : "Save Opportunity"}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        
        <button
          onClick={() => alert(`Applying functionality is configured for ${title}. Redirecting...`)}
          className="text-xs font-bold text-slate-700 hover:text-white bg-slate-50 hover:bg-black px-4 py-2 border border-slate-200 hover:border-black rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Quick Apply
        </button>
      </div>

    </div>
  );
}
