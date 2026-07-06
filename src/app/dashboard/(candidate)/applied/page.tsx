"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import JobCard from "@/components/dashboard/JobCard";
import JobDetailsPanel from "@/components/dashboard/JobDetailsPanel";
import { 
  Loader2, 
  FileCheck, 
  Compass, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";

// Helper to format creation dates to relative text
const formatPostedAt = (dateStr: string): string => {
  if (!dateStr) return "Recent";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  } catch (e) {
    return "Recent";
  }
};

const getCompanyInitials = (name: string): string => {
  if (!name) return "JOB";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 3).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getCompanyBgColor = (name: string): string => {
  if (!name) return "bg-blue-100 text-[#B63106]";
  const colors = [
    "bg-blue-100 text-brand-hover",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-sky-100 text-sky-700"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function CandidateAppliedPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Load Applied Opportunities
  const loadAppliedJobsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;
      setCurrentUserId(userId);

      // 1. Fetch job applications and saved jobs
      const [appsRes, savedRes] = await Promise.all([
        supabase.from("job_applications").select("job_id").eq("profile_id", userId),
        supabase.from("saved_jobs").select("job_id").eq("profile_id", userId)
      ]);

      if (appsRes.error) throw appsRes.error;
      if (savedRes.error) throw savedRes.error;

      const appJobIds = appsRes.data?.map(app => String(app.job_id)) || [];
      const savedJobIds = savedRes.data?.map(s => String(s.job_id)) || [];

      setAppliedJobs(appJobIds);
      setSavedJobs(savedJobIds);

      if (appJobIds.length === 0) {
        setRawJobs([]);
        setLoading(false);
        return;
      }

      // 2. Fetch job listing details matching application IDs
      const { data: jobsData, error: jobsErr } = await supabase
        .from("jobs")
        .select("*")
        .in("id", appJobIds);

      if (jobsErr) throw jobsErr;

      // Sort applied jobs so that the latest applications appear first
      // Since supabase in query doesn't respect array order, we can map locally
      const sortedJobs = (jobsData || []).sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setRawJobs(sortedJobs);
    } catch (err) {
      console.error("Applied Jobs load failure:", err);
      setError(mapSupabaseError(err, "Failed to load applied opportunities."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppliedJobsData();
  }, []);

  // Handle Save Bookmark toggling
  const handleSaveToggle = async (jobId: string | number, isSaved: boolean) => {
    if (!currentUserId) return;
    const stringId = String(jobId);
    
    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .insert({ profile_id: currentUserId, job_id: stringId })
          .select();
        setSavedJobs(prev => [...prev, stringId]);
      } else {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("profile_id", currentUserId)
          .eq("job_id", stringId);
        setSavedJobs(prev => prev.filter(id => id !== stringId));
      }
    } catch (err) {
      console.error("Failed to bookmark job in applied listings:", err);
      alert(mapSupabaseError(err, "Failed to update saved job."));
    }
  };

  // Handle Application Withdrawal
  const handleWithdrawApplication = async (jobId: string | number) => {
    if (!currentUserId) return;
    const stringId = String(jobId);

    try {
      const { error: deleteErr } = await supabase
        .from("job_applications")
        .delete()
        .eq("profile_id", currentUserId)
        .eq("job_id", stringId);

      if (deleteErr) throw deleteErr;

      // Update state immediately
      setRawJobs(prev => prev.filter(j => String(j.id) !== stringId));
      setAppliedJobs(prev => prev.filter(id => id !== stringId));
      
      // Auto-collapse details panel if withdrawn
      if (expandedJobId === stringId) {
        setExpandedJobId(null);
      }

      alert("Application withdrawn successfully.");
    } catch (err) {
      console.error("Failed to withdraw application:", err);
      alert(mapSupabaseError(err, "Failed to withdraw application. Please try again."));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted font-poppins">Loading your applications history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 text-center max-w-md mx-auto space-y-4 font-poppins">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h4 className="text-sm font-bold text-brand-text">Load Failure</h4>
        <p className="text-xs text-brand-text-muted font-medium leading-relaxed">{error}</p>
        <button 
          onClick={loadAppliedJobsData}
          className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-text font-poppins">Applied Jobs</h1>
        <p className="text-xs text-brand-text-muted font-semibold mt-1">
          Track the status of your submitted legal internship and job applications.
        </p>
      </div>

      {/* 2. Listings Grid or Empty State */}
      {rawJobs.length === 0 ? (
        <div className="bg-brand-card rounded-3xl border border-brand-border shadow-sm p-12 text-center flex flex-col items-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-text-secondary font-poppins">No applications submitted yet</h4>
            <p className="text-xs text-brand-text-muted font-semibold leading-relaxed">
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Applied Job Cards List */}
          <div className={`space-y-4 ${expandedJobId ? "lg:col-span-5" : "lg:col-span-12 w-full"}`}>
            {rawJobs.map((job) => {
              const initials = getCompanyInitials(job.firm_name);
              const bg = getCompanyBgColor(job.firm_name);
              const isExpanded = expandedJobId === String(job.id);
              return (
                <div key={job.id} className="space-y-4">
                  <JobCard
                    id={job.id}
                    title={job.title}
                    company={job.firm_name}
                    location={job.location}
                    type={job.employment_type}
                    workplace={job.work_mode}
                    postedAt={formatPostedAt(job.created_at)}
                    logoText={initials}
                    logoBg={bg}
                    onSave={handleSaveToggle}
                    initialSaved={savedJobs.includes(String(job.id))}
                    onApply={() => {}}
                    initialApplied={true}
                    onClick={() => setExpandedJobId(isExpanded ? null : String(job.id))}
                    isExpanded={isExpanded}
                  />

                  {/* Inline Mobile Expanded Details */}
                  {isExpanded && (
                    <div className="block lg:hidden mt-2">
                      <JobDetailsPanel
                        job={job}
                        onClose={() => setExpandedJobId(null)}
                        isApplied={true}
                        isSaved={savedJobs.includes(String(job.id))}
                        onApply={() => {}}
                        onSave={handleSaveToggle}
                        onWithdraw={handleWithdrawApplication}
                        logoText={initials}
                        logoBg={bg}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Desktop Selected Applied Job Details Panel */}
          {expandedJobId && (
            <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-24 max-h-[82vh] overflow-y-auto z-20 font-poppins">
              {(() => {
                const selectedJob = rawJobs.find(j => String(j.id) === expandedJobId);
                if (!selectedJob) return null;
                const initials = getCompanyInitials(selectedJob.firm_name);
                const bg = getCompanyBgColor(selectedJob.firm_name);
                return (
                  <JobDetailsPanel
                    job={selectedJob}
                    onClose={() => setExpandedJobId(null)}
                    isApplied={true}
                    isSaved={savedJobs.includes(expandedJobId)}
                    onApply={() => {}}
                    onSave={handleSaveToggle}
                    onWithdraw={handleWithdrawApplication}
                    logoText={initials}
                    logoBg={bg}
                  />
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
