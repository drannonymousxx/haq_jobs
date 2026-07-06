"use client";

import React, { useState } from "react";
import { 
  Share2, 
  MapPin, 
  Clock, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  ListChecks, 
  Users2, 
  Info, 
  Bookmark, 
  X,
  Building2,
  DollarSign
} from "lucide-react";

interface JobDetailsPanelProps {
  job: any;
  onClose?: () => void;
  isApplied: boolean;
  isSaved: boolean;
  onApply: (id: string | number) => Promise<void> | void;
  onSave: (id: string | number, isSaved: boolean) => Promise<void> | void;
  onWithdraw?: (id: string | number) => Promise<void> | void;
  logoText?: string;
  logoBg?: string;
}

export default function JobDetailsPanel({
  job,
  onClose,
  isApplied,
  isSaved,
  onApply,
  onSave,
  onWithdraw,
  logoText = "SAM",
  logoBg = "bg-brand/10 text-brand"
}: JobDetailsPanelProps) {
  const [saved, setSaved] = useState(isSaved);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  React.useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (onSave) {
      await onSave(job.id, newSavedState);
    }
  };

  const handleWithdrawClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to withdraw your application? This action will remove your profile from the recruiter's hiring pipeline.")) {
      return;
    }
    setWithdrawing(true);
    try {
      if (onWithdraw) {
        await onWithdraw(job.id);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const handleApplyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isApplied || applying) return;
    setApplying(true);
    try {
      if (onApply) {
        await onApply(job.id);
      }
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = job.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const shareUrl = `${window.location.origin}/job-seekers/jobs/${slug}`;
    const shareData = {
      title: job.title,
      text: `Check out this opportunity: ${job.title} at ${job.firm_name}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // If sharing is cancelled or fails, fallback to copy clipboard
        if (err instanceof Error && err.name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Opportunity public link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };

  return (
    <div className="flex flex-col bg-brand-card rounded-3xl border border-brand-border shadow-lg overflow-hidden animate-fade-in font-poppins w-full">
      
      {/* 1. Header Banner & Share */}
      <div className="relative h-28 bg-gradient-to-r from-brand-hover to-brand flex items-center justify-between px-6 select-none">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
        
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-brand-card/95 hover:bg-brand-card text-brand-text px-3.5 py-2 rounded-xl shadow transition-all flex items-center gap-1.5 text-xs font-bold z-10 cursor-pointer border border-brand-border"
        >
          <Share2 size={13} className="text-brand" />
          <span>Share Link</span>
        </button>
      </div>

      {/* 2. Brand Overlay & Company Details */}
      <div className="relative px-6 -mt-10 pb-6 border-b border-brand-border space-y-4">
        <div className="flex justify-between items-end">
          {job.firm_logo_url ? (
            <img
              src={job.firm_logo_url}
              alt={job.firm_name}
              className="w-16 h-16 rounded-2xl object-cover bg-brand-card p-1 shadow border border-brand-border"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shadow bg-brand-card border border-brand-border ${logoBg}`}>
              {logoText}
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-brand-bg hover:bg-brand-card text-brand-text-muted rounded-xl transition-colors cursor-pointer border border-brand-border"
              title="Close Panel"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Info Blocks */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-brand-text-muted uppercase tracking-widest flex items-center gap-1">
            <Building2 size={12} />
            {job.firm_name}
          </p>
          
          <h2 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight leading-snug">
            {job.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-brand-text-muted font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-brand-text-muted" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
              {job.employment_type}
            </span>
            <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
              {job.work_mode}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mid Grid Section */}
      <div className="p-6 space-y-6 flex-grow overflow-y-auto">
        
        {/* Description / Bio */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-1.5 select-none">
            <Info size={14} className="text-brand" />
            Opportunity Overview
          </h4>
          <p className="text-xs text-brand-text-muted leading-relaxed font-medium whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Responsibilities list if populated */}
        {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-1.5 select-none">
              <ListChecks size={14} className="text-brand" />
              Key Responsibilities
            </h4>
            <ul className="space-y-2">
              {job.responsibilities.map((resp: string, index: number) => (
                <li key={index} className="flex gap-2 text-xs text-brand-text-muted font-semibold leading-relaxed">
                  <span className="text-brand font-bold">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements / Eligibility list if populated */}
        {Array.isArray(job.eligibility_criteria) && job.eligibility_criteria.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-1.5 select-none">
              <CheckCircle2 size={14} className="text-brand" />
              Requirements & Eligibility
            </h4>
            <ul className="space-y-2">
              {job.eligibility_criteria.map((elig: string, index: number) => (
                <li key={index} className="flex gap-2 text-xs text-brand-text-muted font-semibold leading-relaxed">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{elig}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Tag block */}
        {Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest select-none">
              Skills & Expertise
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((skill: string) => (
                <span key={skill} className="text-[10px] font-bold text-brand-text-secondary bg-brand-bg border border-brand-border px-2.5 py-1 rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-bg p-4 rounded-2xl border border-brand-border text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-bold">Compensation / Stipend</span>
            <span className="text-brand-text-secondary font-extrabold flex items-center gap-1 text-[13px]">
              <DollarSign size={13} className="text-brand-text-muted" />
              {job.salary || "Not Disclosed"}
            </span>
          </div>

          {job.working_hours && (
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-bold">Working Hours</span>
              <span className="text-brand-text-secondary font-bold flex items-center gap-1">
                <Clock size={13} className="text-brand-text-muted" />
                {job.working_hours}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-bold">Available Openings</span>
            <span className="text-brand-text-secondary font-bold flex items-center gap-1">
              <Users2 size={13} className="text-brand-text-muted" />
              {job.openings || 1} {job.openings === 1 ? "vacancy" : "vacancies"}
            </span>
          </div>

          {job.deadline && (
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-bold">Application Deadline</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Calendar size={13} className="text-rose-400/80" />
                {new Date(job.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </div>
          )}
        </div>

        {/* Selection Stages Sequence chain */}
        {Array.isArray(job.selection_process) && job.selection_process.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest select-none">
              Selection Process Stages
            </h4>
            
            <div className="flex flex-col gap-1.5">
              {job.selection_process.map((step: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[9px] font-black border border-brand-border flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. Action Row Footer */}
      <div className="p-5 border-t border-brand-border bg-brand-card flex items-center gap-3 justify-between">
        <button
          onClick={handleSaveToggle}
          className={`px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold select-none ${
            saved 
              ? "bg-brand border-brand text-white hover:bg-brand-hover" 
              : "bg-brand-card border-brand-border text-brand-text-muted hover:text-brand-text-secondary hover:border-brand"
          }`}
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          <span>{saved ? "Saved" : "Save Opportunity"}</span>
        </button>

        {isApplied ? (
          <div className="flex gap-2 items-center flex-grow sm:flex-none justify-end">
            <span className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-2xl select-none whitespace-nowrap flex items-center gap-1">
              ✓ Applied
            </span>
            {onWithdraw && (
              <button
                onClick={handleWithdrawClick}
                disabled={withdrawing}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs rounded-2xl transition-all cursor-pointer select-none whitespace-nowrap"
              >
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleApplyClick}
            disabled={applying}
            className="flex-grow sm:flex-none px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-2xl transition-all cursor-pointer whitespace-nowrap text-center shadow-md"
          >
            {applying ? "Applying..." : "Apply Opportunity"}
          </button>
        )}
      </div>

    </div>
  );
}
