"use client";

import LegalCategories from "./LegalCategories";
import JobsFilterBar from "./JobsFilterBar";
import JobCard, { JobData } from "./JobCard";
import FeaturedSidebar from "./FeaturedSidebar";
import Pagination from "./Pagination";

const mockJobs: JobData[] = [
  {
    id: "1",
    slug: "corporate-legal-associate",
    title: "Corporate Legal Associate",
    company: "Lexora Legal",
    experience: "3-5 Yrs",
    type: "Full Time",
    workplace: "Hybrid",
    location: "Mumbai, India",
    tags: ["Corporate Law", "M&A", "Due Diligence"],
    posted: "2h ago",
    daysLeft: 12,
    salary: "15-20 LPA",
  },
  {
    id: "2",
    slug: "litigation-intern",
    title: "Litigation Intern",
    company: "JurisEdge",
    experience: "0-1 Yrs",
    type: "Internship",
    workplace: "On-site",
    location: "Delhi, India",
    tags: ["Litigation", "Research", "Drafting"],
    posted: "5h ago",
    daysLeft: 5,
    salary: "Stipend",
  },
  {
    id: "3",
    slug: "contract-management-analyst",
    title: "Contract Management Analyst",
    company: "CounselSync",
    experience: "1-3 Yrs",
    type: "Contract",
    workplace: "Remote",
    location: "Bangalore, India",
    tags: ["Contracts", "Compliance", "Tech"],
    posted: "1d ago",
    daysLeft: 20,
    salary: "8-12 LPA",
  },
  {
    id: "4",
    slug: "ip-law-associate",
    title: "IP Law Associate",
    company: "Novus Legal",
    experience: "2-4 Yrs",
    type: "Full Time",
    workplace: "Hybrid",
    location: "Pune, India",
    tags: ["IPR", "Trademarks", "Patents"],
    posted: "2d ago",
    daysLeft: 15,
    salary: "12-16 LPA",
  },
  {
    id: "5",
    slug: "startup-legal-consultant",
    title: "Startup Legal Consultant",
    company: "Briefly AI Legal",
    experience: "4-7 Yrs",
    type: "Full Time",
    workplace: "Remote",
    location: "Global",
    tags: ["Startup Law", "Venture Capital", "Advisory"],
    posted: "3d ago",
    daysLeft: 30,
    salary: "20-30 LPA",
  },
  {
    id: "6",
    slug: "data-privacy-counsel",
    title: "Data Privacy Counsel",
    company: "Clarity Legal Tech",
    experience: "5-8 Yrs",
    type: "Full Time",
    workplace: "Hybrid",
    location: "Hyderabad, India",
    tags: ["Data Privacy", "GDPR", "Tech Policy"],
    posted: "4d ago",
    daysLeft: 25,
    salary: "25-35 LPA",
  }
];

export default function JobsListings() {
  return (
    <section className="py-20 bg-brand-bg border-t border-brand-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text tracking-tight mb-2 select-none">
            12,000+ Legal Opportunities
          </h2>
          <p className="text-brand-text-secondary text-[16px]">
            Discover your next role at top law firms, tech startups, and corporate legal teams.
          </p>
        </div>

        {/* Categories */}
        <LegalCategories />

        {/* Filters */}
        <JobsFilterBar />

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          {/* Left Column: Job Cards */}
          <div className="flex-1 flex flex-col gap-5">
            {mockJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
            
            <Pagination />
          </div>

          {/* Right Column: Featured Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 hidden lg:block sticky top-24">
            <FeaturedSidebar />
          </div>
        </div>

      </div>
    </section>
  );
}
