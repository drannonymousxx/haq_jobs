"use client";

import Link from "next/link";
import { Briefcase, Clock, MapPin, Share2, Heart, Banknote, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

export interface JobData {
  id: string;
  slug: string;
  title: string;
  company: string;
  experience: string;
  type: string;
  workplace: string;
  location: string;
  tags: string[];
  posted: string;
  daysLeft: number;
  salary: string;
}

interface JobCardProps {
  job: JobData;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="w-full"
    >
      <Link href={`/job-seekers/jobs/${job.slug}`} className="block group">
        <div className="bg-brand-card rounded-[1.5rem] p-6 border border-brand-border shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:border-brand/25 transition-all duration-300 relative">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <h3 className="text-[18px] md:text-[20px] font-bold text-brand-text group-hover:text-brand transition-colors mb-1.5 leading-tight">
                {job.title}
              </h3>
              <p className="text-[14px] font-medium text-brand-text-muted">{job.company}</p>
            </div>
            {/* Logo Placeholder */}
            <div className="w-12 h-12 rounded-[0.8rem] bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 text-brand font-bold text-lg">
              {job.company.charAt(0)}
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-brand-text-muted mb-5">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-brand/80" />
              <span>{job.experience}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-brand-border"></div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand/80" />
              <span>{job.type}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-brand-border"></div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-brand/80" />
              <span>{job.workplace} &middot; {job.location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {job.tags.map((tag, idx) => (
              <span key={idx} className="bg-brand-surface text-brand-text-secondary text-[12px] font-semibold px-3 py-1.5 rounded-full border border-brand-border hover:border-brand/30 transition-colors select-none">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-brand-border gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-brand-text-muted font-medium">
              <span>Posted {job.posted}</span>
              <div className="flex items-center gap-1 text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-md">
                <Hourglass size={12} />
                <span>{job.daysLeft} days left</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-brand/10 text-brand border border-brand/20 px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5">
                <Banknote size={14} />
                {job.salary}
              </div>
              <div className="flex items-center gap-1 ml-1">
                <button 
                  className="text-brand-text-muted hover:text-brand hover:bg-brand/10 transition-all p-2 rounded-md cursor-pointer" 
                  onClick={(e) => { e.preventDefault(); }}
                >
                  <Share2 size={16} />
                </button>
                <button 
                  className="text-brand-text-muted hover:text-brand-error hover:bg-brand-error/10 transition-all p-2 rounded-md cursor-pointer" 
                  onClick={(e) => { e.preventDefault(); }}
                >
                  <Heart size={16} />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </Link>
    </motion.div>
  );
}
