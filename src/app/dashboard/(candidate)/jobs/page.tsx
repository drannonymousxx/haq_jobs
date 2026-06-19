"use client";

import React, { useState, useEffect } from "react";
import JobCard from "@/components/dashboard/JobCard";
import { recommendedJobsData } from "@/data/mockData";
import { Search, Compass, Loader2 } from "lucide-react";

export default function CandidateJobsPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filteredJobs, setFilteredJobs] = useState(recommendedJobsData);

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredJobs(recommendedJobsData);
    } else {
      setFilteredJobs(
        recommendedJobsData.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery]);

  const handleSaveToggle = (jobId: string | number, isSaved: boolean) => {
    const stringId = String(jobId);
    if (isSaved) {
      setSavedJobs(prev => [...prev, stringId]);
    } else {
      setSavedJobs(prev => prev.filter(id => id !== stringId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Searching active opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Explore Jobs</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Browse through clerkships, legal analyst roles, and litigation opportunities.
          </p>
        </div>

        {/* Search input field */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search role or firm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs bg-white"
          />
          <Search size={14} className="text-slate-400 absolute left-3 top-3 select-none" />
        </div>
      </div>

      {/* Main listings or empty states */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              type={job.type}
              workplace={job.workplace}
              postedAt={job.postedAt}
              logoText={job.logoText}
              logoBg={job.logoBg}
              onSave={handleSaveToggle}
              initialSaved={savedJobs.includes(String(job.id))}
            />
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Compass size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-700 font-poppins">No matches found</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                We couldn't find any job match for "{searchQuery}". Try refining your keywords.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold bg-black hover:bg-slate-900 text-white py-2 px-4 rounded-xl transition-all cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
