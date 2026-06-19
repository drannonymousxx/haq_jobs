"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Gift, Copy, Check } from "lucide-react";

export default function CandidateReferPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const referralLink = "https://haqjobs.com/signup?ref=legalfriend2026";

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading your referral link...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Refer a Friend</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Share HAQJobs with your law classmates or legal colleagues and earn premium perks.
        </p>
      </div>

      {/* Refer card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Gift size={26} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-800 text-sm font-poppins">Invite your law school colleagues</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
            Help your friends discover clerkships, internship slots, and legal courses. Earn a free resume review session!
          </p>
        </div>

        {/* Copy block */}
        <div className="w-full flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl max-w-sm">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-grow bg-transparent outline-none text-[11px] font-semibold text-slate-600 pl-2 select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              copied 
                ? "bg-emerald-500 text-white" 
                : "bg-black hover:bg-slate-900 text-white"
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

    </div>
  );
}
