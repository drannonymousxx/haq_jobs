"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatsCard from "@/components/dashboard/StatsCard";
import JobCard from "@/components/dashboard/JobCard";
import { recommendedJobsData } from "@/data/mockData";
import { calculateProfileStrength } from "@/lib/profileUtils";
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
  CheckCircle2,
  Circle
} from "lucide-react";

export default function CandidateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState("Open to Opportunities");
  const [viewsCount, setViewsCount] = useState(0);

  // Strength details
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState<string>("Basic Profile");
  const [checklist, setChecklist] = useState<any[]>([]);

  useEffect(() => {
    async function loadCandidateDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const userId = session.user.id;

          // 1. Fetch Candidate Profile
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          
          let profileObj = userProfile;
          if (!profileObj) {
            profileObj = {
              id: userId,
              full_name: session.user.user_metadata?.full_name || "Candidate User",
              email: session.user.email,
              company_name: "Kolkata, West Bengal"
            };
          }
          setProfile(profileObj);
          setSearchStatus(profileObj.job_search_status || "Open to Opportunities");

          // 2. Fetch Relational Data for Strength
          const [expRes, eduRes, skillRes, reviewsRes, recsRes, viewsRes, savedRes, appliedRes] = await Promise.all([
            supabase.from("experiences").select("id").eq("profile_id", userId),
            supabase.from("educations").select("id").eq("profile_id", userId),
            supabase.from("candidate_skills").select("id").eq("profile_id", userId),
            supabase.from("reviews").select("id").eq("candidate_id", userId),
            supabase.from("recommendations").select("id").eq("candidate_id", userId),
            supabase.from("profile_views").select("id", { count: "exact" }).eq("candidate_id", userId),
            supabase.from("saved_jobs").select("job_id").eq("profile_id", userId),
            supabase.from("job_applications").select("job_id").eq("profile_id", userId)
          ]);

          // Handle stats
          if (viewsRes.count !== null) setViewsCount(viewsRes.count);
          
          if (savedRes.data) {
            setSavedJobs(savedRes.data.map((item: any) => String(item.job_id)));
          }
          
          if (appliedRes.data) {
            setAppliedJobs(appliedRes.data.map((item: any) => String(item.job_id)));
          }

          // Calculate strength
          const expCount = expRes.data?.length || 0;
          const eduCount = eduRes.data?.length || 0;
          const skillCount = skillRes.data?.length || 0;
          const reviewCount = reviewsRes.data?.length || 0;
          const recCount = recsRes.data?.length || 0;

          const strength = calculateProfileStrength(
            profileObj,
            expRes.data || [],
            eduRes.data || [],
            skillRes.data || [],
            reviewCount,
            recCount
          );

          setStrengthScore(strength.score);
          setStrengthLabel(strength.label);
          setChecklist(strength.checklist);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCandidateDashboardData();
  }, []);

  // Save toggle handler
  const handleJobSave = async (jobId: string | number, isSaved: boolean) => {
    if (!profile) return;
    const stringId = String(jobId);
    
    try {
      if (isSaved) {
        // Save bookmark
        await supabase
          .from("saved_jobs")
          .insert({ profile_id: profile.id, job_id: stringId })
          .select();
        setSavedJobs(prev => [...prev, stringId]);
      } else {
        // Remove bookmark
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("profile_id", profile.id)
          .eq("job_id", stringId);
        setSavedJobs(prev => prev.filter(id => id !== stringId));
      }
    } catch (error) {
      console.error("Failed to sync saved job state:", error);
    }
  };

  // Job apply handler
  const handleJobApply = async (jobId: string | number) => {
    if (!profile) return;
    const stringId = String(jobId);

    try {
      const { error } = await supabase
        .from("job_applications")
        .insert({ profile_id: profile.id, job_id: stringId, status: "applied" })
        .select();

      if (!error) {
        setAppliedJobs(prev => [...prev, stringId]);
        // Update applications count locally
      } else {
        console.error("Failed to apply:", error.message);
      }
    } catch (error) {
      console.error("Job application sync error:", error);
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
        <div className="h-24 bg-slate-100 rounded-3xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-slate-100 rounded" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Profile Completion Banner */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div className="bg-[#013CF1] h-full transition-all duration-500" style={{ width: `${strengthScore}%` }} />
        </div>
        
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#013CF1]">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-poppins">
                Your profile is {strengthScore}% completed ({strengthLabel})
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {checklist.filter(item => !item.completed).length} details remaining to increase your recruiter matching score.
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/profile"
            className="text-xs font-bold text-white bg-[#013CF1] hover:bg-[#012cc4] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 self-start sm:self-center shadow-md shadow-blue-500/10"
          >
            Complete Profile <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 2. User Summary Card */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          {profile?.profile_photo_url ? (
            <img 
              src={profile.profile_photo_url} 
              alt={profile.full_name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#013CF1]/10 to-blue-200/30 rounded-2xl flex items-center justify-center font-bold text-2xl text-[#013CF1] border border-blue-100">
              {profile?.full_name?.charAt(0).toUpperCase() || "C"}
            </div>
          )}
          
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-poppins tracking-tight">
              {profile?.full_name}
            </h2>
            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 select-none">
              <MapPin size={12} className="text-slate-400" />
              {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : profile?.company_name || "Location Not Added"}
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
            href={`/candidate/${profile?.id}`}
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

      {/* Main Content Area */}
      <div className="space-y-8">
        
        {/* Career Insights Analytics */}
        <section className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Career Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard 
              label="Profile Strength" 
              value={`${strengthScore}%`} 
              icon={Award}
              iconBgColor="bg-blue-50"
              iconColor="text-[#013CF1]"
              description={strengthLabel}
            />
            <StatsCard 
              label="Applications" 
              value={appliedJobs.length} 
              icon={FileCheck}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
              description="Submitted resumes"
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
              value={viewsCount} 
              icon={Eye}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
              description="Recruiter clicks"
            />
          </div>
        </section>

        {/* Recommended Jobs */}
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
                onApply={handleJobApply}
                initialApplied={appliedJobs.includes(String(job.id))}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Recent Activity</h3>
          
          {appliedJobs.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
              {appliedJobs.slice(0, 3).map((jobId) => {
                const job = recommendedJobsData.find(j => String(j.id) === jobId);
                if (!job) return null;
                return (
                  <div key={job.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Submitted application for {job.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Under recruiter review at {job.company}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Just Now</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center space-y-4">
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
          )}
        </section>
      </div>

    </div>
  );
}
