"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dropdownData = {
  filters: ["Remote", "Hybrid", "In Office", "Internship", "Full Time", "Part Time", "Immediate Joining", "Verified Firms"],
  type: ["Internship", "Full Time", "Part Time", "Contract", "Trainee", "Associate"],
  location: ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Kolkata", "Chennai", "Remote"],
  roles: ["Corporate Lawyer", "Legal Associate", "Compliance Analyst", "Legal Researcher", "Contract Specialist", "Arbitration Associate", "IP Lawyer", "Startup Counsel"],
  sort: ["Most Relevant", "Recently Posted", "Highest Salary", "Earliest Deadline", "Remote First"],
};

export default function JobsFilterBar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const renderDropdown = (id: string, options: string[]) => (
    <AnimatePresence>
      {activeDropdown === id && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-0 mt-2 bg-brand-card rounded-2xl border border-brand-border shadow-[0_15px_40px_-10px_rgba(182, 49, 6,0.1)] p-2 w-56 z-50"
        >
          <div className="flex flex-col max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E2E8F0] [&::-webkit-scrollbar-thumb]:rounded-full">
            {options.map((option, idx) => (
              <button
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-[14px] text-brand-text font-medium rounded-xl hover:bg-[#EEF2FF] hover:text-[#B63106] transition-colors text-left"
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-3 w-full border-b border-brand-border pb-6 mb-8 relative">
      <div className="relative">
        <button 
          onClick={() => toggleDropdown("filters")}
          className={`flex items-center gap-2 bg-brand-card border border-[rgba(182, 49, 6,0.15)] rounded-full px-5 py-2 text-[14px] font-semibold transition-all flex-shrink-0 ${activeDropdown === "filters" ? "shadow-md border-[#B63106] text-[#B63106]" : "text-brand-text shadow-sm hover:shadow-md hover:border-[#B63106]"}`}
        >
          <Filter size={16} className={activeDropdown === "filters" ? "text-[#B63106]" : "text-[#B63106]"} />
          Filters
          <span className="bg-[#B63106] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-1">
            2
          </span>
        </button>
        {renderDropdown("filters", dropdownData.filters)}
      </div>

      {[
        { name: "Type", id: "type", options: dropdownData.type },
        { name: "Location", id: "location", options: dropdownData.location },
        { name: "Roles", id: "roles", options: dropdownData.roles },
        { name: "Sort By", id: "sort", options: dropdownData.sort },
      ].map((filter) => (
        <div key={filter.id} className="relative">
          <button
            onClick={() => toggleDropdown(filter.id)}
            className={`flex items-center gap-1.5 border rounded-full px-4 py-2 text-[14px] font-medium transition-all flex-shrink-0 ${
              activeDropdown === filter.id
                ? "bg-[#EEF2FF] border-[rgba(182, 49, 6,0.3)] text-[#B63106] shadow-sm"
                : "bg-brand-card border-brand-border text-[#64748B] hover:border-[rgba(182, 49, 6,0.2)] hover:text-brand-text"
            }`}
          >
            {filter.name}
            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === filter.id ? "text-[#B63106] rotate-180" : "text-[#94A3B8]"}`} />
          </button>
          {renderDropdown(filter.id, filter.options)}
        </div>
      ))}
    </div>
  );
}
