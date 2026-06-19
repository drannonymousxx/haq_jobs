"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Compass, BookOpen, Trophy } from "lucide-react";
import { coursesData, contestsData } from "@/data/mockData";

export default function CandidateDiscoverPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Discovering legal career resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Discover</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Explore legal certificate courses, moot court opportunities, and advocacy guidelines.
        </p>
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Courses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen size={18} className="text-[#013CF1]" />
            <h3 className="text-base font-bold text-slate-800 font-poppins">Featured Courses</h3>
          </div>
          <div className="space-y-3">
            {coursesData.map((course) => (
              <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-[#013CF1]/30 transition-all">
                <h4 className="text-xs font-bold text-slate-800 font-poppins">{course.title}</h4>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                  <span>Provider: <strong className="text-slate-600">{course.provider}</strong></span>
                  <span>Duration: <strong className="text-slate-600">{course.duration}</strong></span>
                  <span className="bg-blue-50 text-[#013CF1] font-bold px-2 py-0.5 rounded">{course.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Contests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800 font-poppins">Moot Courts & Essays</h3>
          </div>
          <div className="space-y-3">
            {contestsData.map((contest) => (
              <div key={contest.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-amber-500/30 transition-all">
                <h4 className="text-xs font-bold text-slate-800 font-poppins">{contest.title}</h4>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                  <span>Organizer: <strong className="text-slate-600">{contest.organizer}</strong></span>
                  <span>Deadline: <strong className="text-slate-600">{contest.date}</strong></span>
                  <span className="bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded">{contest.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
