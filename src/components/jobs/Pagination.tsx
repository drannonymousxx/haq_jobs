"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-4">
      <button 
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-[#64748B] hover:border-[rgba(182, 49, 6,0.3)] hover:text-[#B63106] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronsLeft size={16} />
      </button>
      
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-[#64748B] hover:border-[rgba(182, 49, 6,0.3)] hover:text-[#B63106] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronLeft size={16} />
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] font-semibold transition-all ${
              isActive 
                ? "bg-[#B63106] text-white border border-[#B63106] shadow-[0_6px_15px_-3px_rgba(182, 49, 6,0.4)]" 
                : "bg-brand-card border border-brand-border text-brand-text hover:border-[rgba(182, 49, 6,0.3)] hover:text-[#B63106] shadow-sm"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-[#64748B] hover:border-[rgba(182, 49, 6,0.3)] hover:text-[#B63106] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronRight size={16} />
      </button>

      <button 
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-[#64748B] hover:border-[rgba(182, 49, 6,0.3)] hover:text-[#B63106] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
