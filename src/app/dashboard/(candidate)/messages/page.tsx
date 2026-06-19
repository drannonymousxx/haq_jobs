"use client";

import React, { useState, useEffect } from "react";
import { Loader2, MessageSquare } from "lucide-react";

export default function CandidateMessagesPage() {
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
        <p className="text-xs font-semibold text-slate-500">Checking message inbox...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Messages</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Direct communication with hiring managers and corporate legal representatives.
        </p>
      </div>

      {/* Messages empty state */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#013CF1] flex items-center justify-center">
          <MessageSquare size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-700 font-poppins">Your inbox is empty</h4>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            When recruiters contact you regarding job applications or interview schedules, the chat conversations will appear here.
          </p>
        </div>
      </div>

    </div>
  );
}
