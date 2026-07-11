"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const featuredJobs = [
  { id: 1, slug: "corporate-legal-associate", title: "Corporate Legal Associate", company: "Lexora Legal", type: "Full Time" },
  { id: 2, slug: "litigation-intern", title: "Litigation Intern", company: "JurisEdge", type: "Internship" },
  { id: 3, slug: "contract-management-analyst", title: "Contract Management Analyst", company: "CounselSync", type: "Remote" },
  { id: 4, slug: "legal-research-associate", title: "Legal Research Associate", company: "StartLaw Partners", type: "Full Time" },
  { id: 5, slug: "ip-law-intern", title: "IP Law Intern", company: "Novus Legal", type: "Internship" },
  { id: 6, slug: "startup-legal-consultant", title: "Startup Legal Consultant", company: "Briefly AI Legal", type: "Contract" },
  { id: 7, slug: "compliance-executive", title: "Compliance Executive", company: "Clarity Legal Tech", type: "Full Time" },
  { id: 8, slug: "arbitration-associate", title: "Arbitration Associate", company: "Lexora Legal", type: "Full Time" },
  { id: 9, slug: "tax-law-analyst", title: "Tax Law Analyst", company: "JurisEdge", type: "Full Time" },
  { id: 10, slug: "remote-legal-research", title: "Remote Legal Research Intern", company: "CounselSync", type: "Remote" },
  { id: 11, slug: "ip-litigator", title: "IP Litigator", company: "StartLaw Partners", type: "Full Time" },
  { id: 12, slug: "legal-ops-manager", title: "Legal Operations Manager", company: "Clarity Legal Tech", type: "Full Time" },
  { id: 13, slug: "data-privacy-counsel", title: "Data Privacy Counsel", company: "Novus Legal", type: "Full Time" },
  { id: 14, slug: "paralegal-specialist", title: "Paralegal Specialist", company: "Briefly AI Legal", type: "Remote" },
  { id: 15, slug: "corporate-counsel", title: "Corporate Counsel", company: "JurisEdge", type: "Full Time" },
];

export default function FeaturedSidebar() {
  return (
    <div className="bg-brand-card rounded-[1.5rem] border border-brand-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[calc(100vh-140px)] max-h-[900px] min-h-[500px] select-none">
      <div className="p-5 border-b border-brand-border bg-brand-surface">
        <h3 className="font-bold text-brand-text text-[16px] tracking-tight">Featured</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand/35">
        <div className="flex flex-col">
          {featuredJobs.map((job, index) => (
            <Link 
              key={job.id} 
              href={`/job-seekers/jobs/${job.slug}`}
              className="group block"
            >
              <div className={`p-4 flex gap-3.5 items-start transition-colors duration-200 hover:bg-brand-surface/70 ${index !== featuredJobs.length - 1 ? 'border-b border-brand-border' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center flex-shrink-0 text-brand font-bold text-[14px]">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-brand-text group-hover:text-brand transition-colors leading-tight mb-1.5 pr-2">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[12px] text-brand-text-muted">
                    <span className="font-medium truncate max-w-[120px]">{job.company}</span>
                    <div className="w-1 h-1 rounded-full bg-brand-border"></div>
                    <span className="text-brand-text-muted whitespace-nowrap">{job.type}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
