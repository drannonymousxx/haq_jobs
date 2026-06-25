"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Briefcase, 
  Loader2, 
  Building2, 
  Calendar,
  PlusCircle, 
  Users,
  Search,
  ArrowRight,
  Eye,
  FileCheck,
  Award,
  Lock
} from "lucide-react";
import Link from "next/link";
import { recommendedJobsData } from "@/data/mockData";
import { calculateRecruiterStrength } from "@/lib/profileUtils";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Dynamic metrics state
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  // Strength details
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Basic");

  useEffect(() => {
    async function checkAuthAndLoadMetrics() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);
        const userId = session.user.id;

        // Fetch user profile to verify role
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching recruiter profile:", profileError.message);
        }

        let currentProfile = userProfile;
        if (userProfile) {
          if (userProfile.role !== "recruiter") {
            router.push("/dashboard");
            return;
          }
          setProfile(userProfile);
        } else {
          // Fallback profile state from metadata
          currentProfile = {
            id: userId,
            full_name: session.user.user_metadata?.full_name || "Recruiter User",
            email: session.user.email,
            role: "recruiter",
            company_name: session.user.user_metadata?.company_name || "",
            designation: session.user.user_metadata?.designation || ""
          };
          setProfile(currentProfile);
        }

        // Calculate profile completion
        const strength = calculateRecruiterStrength(currentProfile);
        setStrengthScore(strength.score);
        setStrengthLabel(strength.label);

        // Fetch jobs posted by this recruiter
        let myJobIds: string[] = [];
        let activeJobs = 0;
        try {
          const { data: myJobs } = await supabase
            .from("jobs")
            .select("id, job_status")
            .eq("recruiter_id", userId);
          
          if (myJobs) {
            myJobIds = myJobs.map(j => String(j.id));
            activeJobs = myJobs.filter(j => j.job_status === "Published").length;
          }
        } catch (e) {
          console.error("Error loading jobs for counts:", e);
        }
        setActiveJobsCount(activeJobs);

        // Fetch total applicants for my jobs
        let totalAppsCount = 0;
        if (myJobIds.length > 0) {
          const { count, error: appsCountErr } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .in("job_id", myJobIds);
          if (!appsCountErr && count !== null) {
            totalAppsCount = count;
          }
        }
        setApplicantsCount(totalAppsCount);

        // Fetch Recruiter profile views count (how many candidate profiles has this recruiter viewed)
        const { count: recruiterViews, error: viewsCountErr } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("viewer_id", userId);

        if (!viewsCountErr && recruiterViews !== null) {
          setViewsCount(recruiterViews);
        }

        // Fetch Recent Applications with Candidate details
        let formattedApps: any[] = [];
        if (myJobIds.length > 0) {
          const { data: apps, error: appsErr } = await supabase
            .from("job_applications")
            .select(`
              id,
              job_id,
              created_at,
              profile_id,
              profiles (
                id,
                full_name,
                email,
                city,
                state,
                profile_photo_url
              )
            `)
            .in("job_id", myJobIds)
            .order("created_at", { ascending: false })
            .limit(5);

          if (!appsErr && apps) {
            const realJobIds = apps.map((a: any) => String(a.job_id));
            const { data: jobsDetails } = await supabase
              .from("jobs")
              .select("id, title")
              .in("id", realJobIds);

            const jobMap = new Map();
            if (jobsDetails) {
              jobsDetails.forEach(j => jobMap.set(String(j.id), j.title));
            }
            recommendedJobsData.forEach(j => jobMap.set(String(j.id), j.title));

            const formatAppliedDate = (dateStr: string): string => {
              if (!dateStr) return "";
              try {
                const d = new Date(dateStr);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
              } catch (e) {
                return "";
              }
            };

            formattedApps = apps.map((app: any) => {
              const jobTitle = jobMap.get(String(app.job_id)) || "Legal Position";
              return {
                id: app.id,
                candidateId: app.profiles?.id,
                candidateName: app.profiles?.full_name || "Anonymous Candidate",
                candidateEmail: app.profiles?.email,
                candidatePhoto: app.profiles?.profile_photo_url,
                candidateLocation: app.profiles?.city && app.profiles?.state 
                  ? `${app.profiles.city}, ${app.profiles.state}` 
                  : "N/A",
                jobTitle,
                appliedAt: formatAppliedDate(app.created_at)
              };
            });
          } else if (appsErr) {
            console.error("Error loading recruiter apps:", appsErr.message);
          }
        }
        setRecentApplications(formattedApps);
        
      } catch (err) {
        console.error("Dashboard data load failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadMetrics();
  }, [router]);

  const formatJoinedDate = (dateStr: string): string => {
    if (!dateStr) return "Joined June 2026";
    try {
      const d = new Date(dateStr);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `Joined ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    } catch (e) {
      return "Joined June 2026";
    }
  };

  const isProfileCompleteEnough = strengthScore >= 50;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Profile Card */}
      <section className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
          
          {/* Recruiter Profile Photo */}
          {profile?.profile_photo_url ? (
            <img 
              src={profile.profile_photo_url} 
              alt={profile.full_name} 
              className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm mb-4"
            />
          ) : (
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 font-black text-2xl border border-amber-200">
              {profile?.full_name?.charAt(0).toUpperCase() || "R"}
            </div>
          )}

          {/* Name & Designation */}
          <h2 className="text-xl font-bold text-slate-800 font-poppins">{profile?.full_name}</h2>
          <p className="text-xs text-slate-400 font-bold mb-4">
            {profile?.designation || "Recruiter"} {profile?.company_name && "at"} <span className="text-slate-600 font-black">{profile?.company_name || "No Firm Added"}</span>
          </p>

          {/* Simple Email and Joined Fields */}
          <div className="w-full space-y-2 text-left border-t border-slate-50 pt-4 pb-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 flex-shrink-0" />
              <span>{formatJoinedDate(profile?.created_at)}</span>
            </div>
          </div>

          {/* Profile Completion percentage */}
          <div className="w-full border-t border-slate-50 pt-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500">Profile Completion</span>
              <span className="font-black text-[#013CF1]">{strengthScore}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${strengthScore}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold text-right capitalize">
              {strengthLabel}
            </p>
          </div>

          {/* Edit Profile Button */}
          <Link 
            href="/dashboard/recruiter/profile"
            className="w-full mt-6 text-center text-xs font-bold text-white bg-black hover:bg-slate-900 py-3 rounded-xl transition-all shadow-sm"
          >
            Edit Profile
          </Link>
        </div>
      </section>

      {/* Right Column: Statistics & Quick Actions */}
      <section className="lg:col-span-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-50 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-poppins tracking-tight">
              Welcome, {profile?.full_name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-sm text-slate-400 font-medium max-w-md">
              Find premier legal talent for your firm. Post job openings, internships, and clerkships in minutes.
            </p>

            {/* Profile Completion Job Restriction Message */}
            {!isProfileCompleteEnough && (
              <div className="mt-3 bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 max-w-md">
                <Lock size={14} className="flex-shrink-0" />
                <span>Complete your recruiter profile before posting opportunities. (Minimum 50% required)</span>
              </div>
            )}
          </div>
          
          <Link 
            href={isProfileCompleteEnough ? "/dashboard/recruiter/post-job" : "/dashboard/recruiter/profile"}
            className={`px-6 py-3 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center select-none ${
              isProfileCompleteEnough 
                ? "bg-black hover:bg-slate-900 text-white cursor-pointer" 
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!isProfileCompleteEnough) {
                e.preventDefault();
                router.push("/dashboard/recruiter/profile");
              }
            }}
          >
            {!isProfileCompleteEnough && <Lock size={14} />}
            <PlusCircle size={16} /> Post a Job
          </Link>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Jobs</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase size={14} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 font-poppins mt-2">{activeJobsCount}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Applicants</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck size={14} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 font-poppins mt-2">{applicantsCount}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Views</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Eye size={14} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 font-poppins mt-2">{viewsCount}</span>
          </div>
        </div>

        {/* Recent Candidate Applications */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-poppins">Recent Applications</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Candidates who applied to your legal roles.</p>
            </div>
            {recentApplications.length > 0 && (
              <Link 
                href="/dashboard/recruiter/jobs" 
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-0.5"
              >
                All Applications <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Candidate</th>
                    <th className="py-3 px-2">Applied Position</th>
                    <th className="py-3 px-2">Location</th>
                    <th className="py-3 px-2">Applied Date</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 flex items-center gap-3">
                        {app.candidatePhoto ? (
                          <img 
                            src={app.candidatePhoto} 
                            alt={app.candidateName} 
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                            {app.candidateName?.charAt(0).toUpperCase() || "C"}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 block">{app.candidateName}</span>
                          <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[150px]">{app.candidateEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 font-semibold text-slate-700">{app.jobTitle}</td>
                      <td className="py-4 px-2 text-slate-500 font-medium">{app.candidateLocation}</td>
                      <td className="py-4 px-2 text-slate-500 font-medium">{app.appliedAt}</td>
                      <td className="py-4 px-2 text-right">
                        {app.candidateId ? (
                          <Link 
                            href={`/candidate/${app.candidateId}`}
                            className="text-xs font-bold text-white bg-[#013CF1] hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all inline-block shadow-sm"
                          >
                            View Profile
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">No Profile</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Users className="text-slate-300 w-10 h-10" />
              <p className="text-xs font-semibold text-slate-500">No applications received yet.</p>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Post opportunities, candidates will apply to them, and they will list here.
              </p>
            </div>
          )}
        </div>

        {/* Quick Action Tiles */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-poppins mb-4">Recruiter Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Post Opportunity */}
            <Link 
              href={isProfileCompleteEnough ? "/dashboard/recruiter/post-job" : "/dashboard/recruiter/profile"}
              className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all group flex items-start gap-4 ${
                isProfileCompleteEnough 
                  ? "hover:border-amber-500/50 hover:shadow-md cursor-pointer" 
                  : "opacity-60 cursor-pointer"
              }`}
              onClick={(e) => {
                if (!isProfileCompleteEnough) {
                  e.preventDefault();
                  router.push("/dashboard/recruiter/profile");
                }
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                {isProfileCompleteEnough ? <PlusCircle size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Post Opportunity</h4>
                <p className="text-xs text-slate-400 mt-1">Create listings for associate lawyers, law clerks, and student interns.</p>
              </div>
            </Link>

            {/* Manage Candidates (Placeholder) */}
            <div 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all group flex items-start gap-4 cursor-default opacity-70"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#013CF1] flex items-center justify-center flex-shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Manage Candidates</h4>
                <p className="text-xs text-slate-400 mt-1">Review resumes, applications, and shortlist aspiring lawyers (Coming soon).</p>
              </div>
            </div>

            {/* Search Law Graduates (Placeholder) */}
            <div 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all group flex items-start gap-4 cursor-default opacity-70"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Search size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Search Law Graduates</h4>
                <p className="text-xs text-slate-400 mt-1">Directly search candidate profiles by NLU graduation year (Coming soon).</p>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
}
