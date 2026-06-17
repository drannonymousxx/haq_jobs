"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Clock, ArrowUpRight } from "lucide-react";

const opportunities = [
  {
    id: 1,
    role: "Corporate Law Internship",
    firm: "Top Tier Global Firm",
    location: "New York, NY (Hybrid)",
    type: "Internship",
    posted: "2d ago",
  },
  {
    id: 2,
    role: "Litigation Associate",
    firm: "Boutique Litigation Partners",
    location: "Remote",
    type: "Full-time",
    posted: "1w ago",
  },
  {
    id: 3,
    role: "Remote Legal Research Role",
    firm: "TechLaw Innovations",
    location: "San Francisco, CA",
    type: "Contract",
    posted: "3d ago",
  },
  {
    id: 4,
    role: "Startup Legal Intern",
    firm: "Venture Counsel Group",
    location: "Austin, TX",
    type: "Internship",
    posted: "5h ago",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function FeaturedOpportunities() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#191D20]">Featured Opportunities</h2>
          <p className="text-[#191D20]/60 mt-1">Handpicked roles for you</p>
        </div>
        <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#013CF1] hover:text-[#013CF1]/80 transition-colors group">
          View all 
          <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {opportunities.map((opp) => (
          <motion.div 
            key={opp.id}
            variants={item}
            className="group bg-white p-6 rounded-2xl border border-[#191D20]/5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col"
          >
            {/* Soft gradient hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#013CF1]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center border border-[#191D20]/10">
                <Building2 size={20} className="text-[#191D20]/40" />
              </div>
              <span className="text-xs font-medium text-[#191D20]/50 bg-[#191D20]/5 px-2 py-1 rounded-md">
                {opp.posted}
              </span>
            </div>
            
            <div className="relative z-10 flex-grow">
              <h3 className="font-semibold text-[#191D20] text-lg leading-tight mb-1 group-hover:text-[#013CF1] transition-colors">
                {opp.role}
              </h3>
              <p className="text-sm text-[#191D20]/70 mb-4">{opp.firm}</p>
              
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-[#191D20]/60">
                  <MapPin size={14} />
                  <span>{opp.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#191D20]/60">
                  <Clock size={14} />
                  <span>{opp.type}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4 border-t border-[#191D20]/5">
              <button className="w-full py-2 bg-[#F0F0F0] text-[#191D20] text-sm font-medium rounded-xl group-hover:bg-[#013CF1] group-hover:text-white transition-colors duration-300">
                Quick Apply
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <button className="w-full sm:hidden mt-6 py-3 border border-[#191D20]/10 rounded-xl text-sm font-medium text-[#191D20] hover:bg-[#F0F0F0] transition-colors flex items-center justify-center gap-1">
        View all opportunities
        <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
