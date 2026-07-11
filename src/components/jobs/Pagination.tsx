"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-4 select-none">
      <button 
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-text-muted hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
      >
        <ChevronsLeft size={16} />
      </button>
      
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-text-muted hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
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
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
              isActive 
                ? "bg-brand text-white border border-brand shadow-[0_6px_15px_-3px_rgba(182,49,6,0.35)]" 
                : "bg-brand-card border border-brand-border text-brand-text hover:border-brand/40 hover:text-brand shadow-sm"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-text-muted hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>

      <button 
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-text-muted hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
