"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatsCard from "@/components/dashboard/StatsCard";
import JobCard from "@/components/dashboard/JobCard";
import { recommendedJobsData } from "@/data/mockData";
import { 
  Award, 
  Briefcase, 
  Eye, 
  FileCheck, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  Compass, 
  UserCheck 
} from "lucide-react";

export default function CandidateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState("Open to Opportunities");

  useEffect(() => {
    async function loadCandidateData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userProfile) {
            setProfile(userProfile);
            setSearchStatus(userProfile.job_search_status || "Open to Opportunities");
          } else {
            setProfile({
              full_name: session.user.user_metadata?.full_name || "Candidate User",
              email: session.user.email,
              company_name: "Kolkata, West Bengal"
            });
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCandidateData();
  }, []);

  // Save toggle handler
  const handleJobSave = (jobId: string | number, isSaved: boolean) => {
    const stringId = String(jobId);
    if (isSaved) {
      setSavedJobs(prev => [...prev, stringId]);
    } else {
      setSavedJobs(prev => prev.filter(id => id !== stringId));
    }
  };

  const statusColors: Record<string, string> = {
    "Ready to Interview": "bg-emerald-500",
    "Open to Opportunities": "bg-blue-500",
    "Not Looking": "bg-slate-400"
  };

  const activeStatusColor = statusColors[searchStatus] || statusColors["Open to Opportunities"];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Loading skeleton banner */}
        <div className="h-24 bg-slate-100 rounded-3xl" />
        
        {/* Loading skeleton summary card */}
        <div className="h-48 bg-slate-100 rounded-3xl" />

        {/* Loading skeleton stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>

        {/* Loading skeleton jobs */}
        <div className="space-y-4">
          <div className="h-10 w-48 bg-slate-100 rounded" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Profile Completion Banner */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Progress bar segment blocks */}
        <div className="flex h-1.5 w-full bg-slate-100">
          <div className="flex-[6] bg-[#013CF1]" />
          <div className="flex-[4] bg-slate-100" />
        </div>
        
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#013CF1]">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-poppins">
                Your profile is missing key details (60% completed)
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                5 steps remaining to increase your recruiter matching score.
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/profile"
            className="text-xs font-bold text-[#013CF1] hover:text-[#012cc4] bg-blue-50/50 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 self-start sm:self-center"
          >
            Complete Profile <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 2. User Summary Card */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#013CF1]/10 to-blue-200/30 rounded-2xl flex items-center justify-center font-bold text-2xl text-[#013CF1] border border-blue-100">
            {profile?.full_name?.charAt(0).toUpperCase() || "C"}
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-poppins tracking-tight">
              {profile?.full_name}
            </h2>
            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 select-none">
              <MapPin size={12} className="text-slate-400" />
              {profile?.company_name || "Kolkata, West Bengal"}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeStatusColor}`} />
              <span className="text-xs font-bold text-slate-600 capitalize">
                {searchStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
          <Link
            href="/dashboard/profile"
            className="flex-grow md:flex-grow-0 text-center text-xs font-bold text-[#013CF1] hover:text-[#012cc4] bg-blue-50/50 hover:bg-blue-50 px-5 py-3 rounded-xl transition-all"
          >
            View Public Profile
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex-grow md:flex-grow-0 text-center text-xs font-bold bg-black hover:bg-slate-900 text-white px-5 py-3 rounded-xl transition-all"
          >
            Edit Profile
          </Link>
        </div>
      </section>

      {/* 3. Career Insights Analytics */}
      <section className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Career Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="Profile Strength" 
            value="60%" 
            icon={Award}
            iconBgColor="bg-blue-50"
            iconColor="text-[#013CF1]"
            description="Good. Add education details"
          />
          <StatsCard 
            label="Applications" 
            value="0" 
            icon={FileCheck}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            description="Start applying now"
          />
          <StatsCard 
            label="Saved Jobs" 
            value={savedJobs.length} 
            icon={Briefcase}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
            description="Jobs bookmarked"
          />
          <StatsCard 
            label="Profile Views" 
            value="12" 
            icon={Eye}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
            trend={{ value: "+25% this week", isPositive: true }}
          />
        </div>
      </section>

      {/* 4. Recommended Jobs Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Recommended Jobs</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Legal positions curated based on your preferences
            </p>
          </div>
          <Link 
            href="/dashboard/jobs" 
            className="text-xs font-bold text-[#013CF1] hover:text-[#012cc4] transition-colors flex items-center gap-0.5"
          >
            All Jobs <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="space-y-3.5">
          {recommendedJobsData.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              type={job.type}
              workplace={job.workplace}
              postedAt={job.postedAt}
              logoText={job.logoText}
              logoBg={job.logoBg}
              onSave={handleJobSave}
              initialSaved={savedJobs.includes(String(job.id))}
            />
          ))}
        </div>
      </section>

      {/* 5. Recent Activity & Empty State */}
      <section className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Recent Activity</h3>
        
        {/* Custom beautiful empty state */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <Compass size={22} />
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-700 font-poppins">No recent activity yet</h4>
            <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
              Start searching for internships and legal associate positions to build your application track record.
            </p>
          </div>

          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-black hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow"
          >
            Explore Opportunities <Compass size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
