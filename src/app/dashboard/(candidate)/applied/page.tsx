"use client";

import React, { useState, useEffect } from "react";
import { Loader2, FileCheck, Compass } from "lucide-react";
import Link from "next/link";

export default function CandidateAppliedPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading your applications history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Applied Jobs</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Track the status of your submitted legal internship and job applications.
        </p>
      </div>

      {/* Applied jobs empty state */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FileCheck size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-700 font-poppins">No applications submitted yet</h4>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            You haven't applied to any roles on HAQJobs yet. Start browsing jobs to submit your first application!
          </p>
        </div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1 text-xs font-bold bg-black hover:bg-slate-900 text-white py-2.5 px-5 rounded-xl transition-all cursor-pointer"
        >
          Find Jobs <Compass size={14} />
        </Link>
      </div>

    </div>
  );
}
