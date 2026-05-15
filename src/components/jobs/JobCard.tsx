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
        <div className="bg-white rounded-[1.5rem] p-6 border border-[#E2E8F0] shadow-sm hover:shadow-[0_15px_40px_-10px_rgba(1,60,241,0.08)] hover:border-[rgba(1,60,241,0.15)] transition-all duration-300 relative">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <h3 className="text-[18px] md:text-[20px] font-bold text-[#191D20] group-hover:text-[#013CF1] transition-colors mb-1.5 leading-tight">
                {job.title}
              </h3>
              <p className="text-[14px] font-medium text-[#64748B]">{job.company}</p>
            </div>
            {/* Logo Placeholder */}
            <div className="w-12 h-12 rounded-[0.8rem] bg-[#EEF2FF] border border-[rgba(1,60,241,0.06)] flex items-center justify-center flex-shrink-0 text-[#013CF1] font-bold text-lg">
              {job.company.charAt(0)}
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#64748B] mb-5">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>{job.experience}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-[#CBD5E1]"></div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{job.type}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-[#CBD5E1]"></div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{job.workplace} &middot; {job.location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {job.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#F8FAFC] text-[#64748B] text-[12px] font-medium px-3 py-1.5 rounded-full border border-[#E2E8F0]">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#F1F5F9] gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#64748B] font-medium">
              <span>Posted {job.posted}</span>
              <div className="flex items-center gap-1 text-[#013CF1] bg-[rgba(1,60,241,0.04)] px-2 py-1 rounded-md">
                <Hourglass size={12} />
                <span>{job.daysLeft} days left</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#EEF2FF] to-white text-[#013CF1] border border-[rgba(1,60,241,0.1)] px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5">
                <Banknote size={14} />
                {job.salary}
              </div>
              <div className="flex items-center gap-1 ml-1">
                <button 
                  className="text-[#94A3B8] hover:text-[#013CF1] hover:bg-[#EEF2FF] transition-all p-1.5 rounded-md" 
                  onClick={(e) => { e.preventDefault(); }}
                >
                  <Share2 size={16} />
                </button>
                <button 
                  className="text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 transition-all p-1.5 rounded-md" 
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
