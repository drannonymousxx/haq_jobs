"use client";

import React from "react";
import JobCard, { JobData } from "@/components/jobs/JobCard";
import { Briefcase } from "lucide-react";

interface CompanyJobsListProps {
  companyName: string;
  jobs: JobData[];
}

export function CompanyJobsList({ companyName, jobs }: CompanyJobsListProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center select-none">
        <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-text-muted mb-4">
          <Briefcase size={20} />
        </div>
        <h4 className="text-md font-bold text-brand-text">No Open Positions</h4>
        <p className="text-brand-text-muted text-xs mt-1 max-w-[240px]">
          We don&apos;t have any open vacancies at {companyName} right now. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-brand">
        <Briefcase size={16} />
        <span className="text-xs font-black uppercase tracking-widest">
          Open Careers at {companyName} ({jobs.length})
        </span>
      </div>

      {/* Vertical list of jobs using platform-wide reusable JobCard */}
      <div className="flex flex-col gap-5">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
