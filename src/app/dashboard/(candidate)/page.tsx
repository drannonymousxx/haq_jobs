"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import StatsCard from "@/components/dashboard/StatsCard";
import JobCard from "@/components/dashboard/JobCard";
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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
  AlertCircle,
  Bell,
  Check
} from "lucide-react";

export default function CandidateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState("Open to Opportunities");
  const [viewsCount, setViewsCount] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  // Notifications, Interviews, and Offers states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  // Strength details
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState<string>("Basic Profile");
  const [checklist, setChecklist] = useState<any[]>([]);

  const loadCandidateDashboardData = async () => {
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

        // 2. Fetch Relational Data for Strength and Jobs
        const [expRes, eduRes, skillRes, reviewsRes, recsRes, viewsRes, savedRes, appliedRes, jobsRes, notifyRes] = await Promise.all([
          supabase.from("experiences").select("id").eq("profile_id", userId),
          supabase.from("educations").select("id").eq("profile_id", userId),
          supabase.from("candidate_skills").select("id").eq("profile_id", userId),
          supabase.from("reviews").select("id").eq("candidate_id", userId),
          supabase.from("recommendations").select("id").eq("candidate_id", userId),
          supabase.from("profile_views").select("id", { count: "exact" }).eq("candidate_id", userId),
          supabase.from("saved_jobs").select("job_id").eq("profile_id", userId),
          supabase.from("job_applications").select("id, job_id, created_at, status").eq("profile_id", userId),
          supabase.from("jobs").select("*").eq("job_status", "Published").order("created_at", { ascending: false }).limit(3),
          supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false })
        ]);

        // Handle notifications
        setNotifications(notifyRes.data || []);

        // Handle stats
        if (viewsRes.count !== null) setViewsCount(viewsRes.count);
        
        if (savedRes.data) {
          setSavedJobs(savedRes.data.map((item: any) => String(item.job_id)));
        }
        
        if (appliedRes.data) {
          setAppliedJobs(appliedRes.data.map((item: any) => String(item.job_id)));
        }

        if (jobsRes.data) {
          setJobs(jobsRes.data);
        }

        // Fetch details for applied jobs for recent activity
        if (appliedRes.data && appliedRes.data.length > 0) {
          const appliedIds = appliedRes.data.map((item: any) => String(item.job_id));
          const appIds = appliedRes.data.map((item: any) => String(item.id));
          
          const { data: dbAppliedJobs } = await supabase
            .from("jobs")
            .select("id, title, firm_name, recruiter_id")
            .in("id", appliedIds);
          
          if (dbAppliedJobs) {
            setRecentApplications(
              appliedRes.data.map((app: any) => {
                const jobInfo = dbAppliedJobs.find(j => String(j.id) === String(app.job_id));
                return {
                  id: app.job_id,
                  title: jobInfo?.title || "Legal Professional Role",
                  company: jobInfo?.firm_name || "Legal Recruiter",
                  appliedAt: app.created_at
                };
              })
            );

            // Fetch Interviews for these applications
            const { data: dbInterviews } = await supabase
              .from("interviews")
              .select("*")
              .in("application_id", appIds)
              .eq("status", "pending")
              .order("scheduled_at", { ascending: true });

            if (dbInterviews) {
              const mappedInts = dbInterviews.map((i: any) => {
                const application = appliedRes.data.find((a: any) => String(a.id) === String(i.application_id));
                const jobInfo = dbAppliedJobs.find(j => String(j.id) === String(application?.job_id));
                return {
                  ...i,
                  jobTitle: jobInfo?.title || "Legal Opening",
                  company: jobInfo?.firm_name || "Hiring Law Firm",
                  recruiterId: jobInfo?.recruiter_id
                };
              });
              setInterviews(mappedInts);
            }

            // Fetch Offers for these applications
            const { data: dbOffers } = await supabase
              .from("offers")
              .select("*")
              .in("application_id", appIds)
              .eq("status", "pending")
              .order("created_at", { ascending: false });

            if (dbOffers) {
              const mappedOffers = dbOffers.map((o: any) => {
                const application = appliedRes.data.find((a: any) => String(a.id) === String(o.application_id));
                const jobInfo = dbAppliedJobs.find(j => String(j.id) === String(application?.job_id));
                return {
                  ...o,
                  appId: application?.id,
                  company: jobInfo?.firm_name || "Hiring Firm",
                  recruiterId: jobInfo?.recruiter_id
                };
              });
              setOffers(mappedOffers);
            }
          }
        }

        // Calculate strength
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
      console.error("Failed to load candidate dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidateDashboardData();
  }, []);

  // Accept/Decline/Reschedule interview actions
  const handleUpdateInterview = async (interviewId: string, newStatus: string, recruiterId: string, jobTitle: string) => {
    try {
      const { error } = await supabase
        .from("interviews")
        .update({ status: newStatus })
        .eq("id", interviewId);

      if (error) throw error;

      // Notify Recruiter
      if (recruiterId) {
        let title = "Interview Response";
        let content = `Candidate ${profile?.full_name || "User"} has ${newStatus} the interview invitation for "${jobTitle}".`;
        if (newStatus === "reschedule_requested") {
          title = "Interview Reschedule Requested";
          content = `Candidate ${profile?.full_name || "User"} has requested a reschedule for the interview invitation for "${jobTitle}".`;
        }
        await supabase
          .from("notifications")
          .insert({
            user_id: recruiterId,
            title,
            content,
            is_read: false
          });
      }

      await loadCandidateDashboardData();
    } catch (e: any) {
      alert("Failed to update interview invitation: " + e.message);
    }
  };

  // Accept/Decline job offer actions
  const handleUpdateOffer = async (offerId: string, newStatus: string, appId: string, recruiterId: string, position: string) => {
    try {
      const now = new Date().toISOString();
      const offerFields: any = { status: newStatus };
      if (newStatus === "accepted") {
        offerFields.accepted_at = now;
      } else {
        offerFields.declined_at = now;
      }

      const { error: offerErr } = await supabase
        .from("offers")
        .update(offerFields)
        .eq("id", offerId);

      if (offerErr) throw offerErr;

      // Update application stage
      const appStatus = newStatus === "accepted" ? "hired" : "rejected";
      const { error: appErr } = await supabase
        .from("job_applications")
        .update({ status: appStatus })
        .eq("id", appId);

      if (appErr) throw appErr;

      // Notify Recruiter
      if (recruiterId) {
        const title = newStatus === "accepted" ? "Offer Accepted! 🎉" : "Offer Declined";
        const content = `Candidate ${profile?.full_name || "User"} has ${newStatus} the job offer for the position of "${position}".`;
        await supabase
          .from("notifications")
          .insert({
            user_id: recruiterId,
            title,
            content,
            is_read: false,
            type: "offer",
            reference_id: appId,
            reference_type: "job_applications"
          });
      }

      await loadCandidateDashboardData();
    } catch (e: any) {
      alert("Failed to update job offer status: " + e.message);
    }
  };

  // Clear in-app notifications
  const handleClearNotification = async (notifyId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notifyId);

      if (!error) {
        setNotifications(prev => prev.filter(n => n.id !== notifyId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatPostedAt = (dateStr: string): string => {
    if (!dateStr) return "Recent";
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return "Yesterday";
      return `${days} days ago`;
    } catch (e) {
      return "Recent";
    }
  };

  const getCompanyInitials = (name: string): string => {
    if (!name) return "JOB";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 3).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getCompanyBgColor = (name: string): string => {
    if (!name) return "bg-blue-100 text-[#013CF1]";
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-amber-100 text-amber-700",
      "bg-emerald-100 text-emerald-700",
      "bg-purple-100 text-purple-700",
      "bg-rose-100 text-rose-700",
      "bg-indigo-100 text-indigo-700",
      "bg-sky-100 text-sky-700"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Save toggle handler
  const handleJobSave = async (jobId: string | number, isSaved: boolean) => {
    if (!profile) return;
    const stringId = String(jobId);
    
    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .insert({ profile_id: profile.id, job_id: stringId })
          .select();
        setSavedJobs(prev => [...prev, stringId]);
      } else {
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
      } else {
        alert(mapSupabaseError(error, "Failed to apply for job."));
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
      <div className="space-y-8 animate-pulse font-poppins">
        <div className="h-24 bg-slate-100 rounded-3xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins">
      
      {/* 1. Profile Completion Banner */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div className="bg-[#013CF1] h-full transition-all duration-500" style={{ width: `${strengthScore}%` }} />
        </div>
        
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#013CF1]">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
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

      {/* 3. IN-APP PERSISTENT NOTIFICATIONS FEED */}
      {notifications.length > 0 && (
        <section className="bg-blue-50/40 border border-blue-100/50 rounded-3xl p-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
              <Bell size={14} className="text-[#013CF1]" />
              <span>In-App Notifications</span>
            </h3>
            <span className="text-[9px] font-bold bg-blue-100 text-[#013CF1] px-2 py-0.5 rounded-full uppercase">
              {notifications.length} Unread
            </span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className="flex items-start justify-between gap-4 p-3 bg-white rounded-2xl border border-blue-50 shadow-sm"
              >
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">{n.title}</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{n.content}</p>
                </div>
                <button
                  onClick={() => handleClearNotification(n.id)}
                  className="p-1 text-slate-400 hover:text-[#013CF1] rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                  title="Dismiss notification"
                >
                  <Check size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PENDING INTERVIEW INVITATIONS */}
      {interviews.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Interview Rounds Invitations</h3>
          <div className="grid grid-cols-1 gap-4">
            {interviews.map((i) => (
              <div 
                key={i.id}
                className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-0.5 rounded-full">
                      Interview Scheduled
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800">{i.title}</h4>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-bold">
                    For position at: <span className="text-slate-800 font-black">{i.company}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-semibold pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{new Date(i.scheduled_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{new Date(i.scheduled_at).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })} ({i.duration})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={13} />
                      <span className="capitalize">{i.type} Round</span>
                    </div>
                  </div>

                  {i.meeting_link && (
                    <div className="text-xs pt-1">
                      <span className="text-slate-400 font-bold block">Meeting Link:</span>
                      <a href={i.meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                        {i.meeting_link}
                      </a>
                    </div>
                  )}

                  {i.location && (
                    <div className="text-xs pt-1 text-slate-500 font-medium">
                      <span className="text-slate-400 font-bold block">Office Location:</span>
                      <span>{i.location}</span>
                    </div>
                  )}

                  {i.notes && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                      <strong className="text-slate-700 font-bold block mb-0.5">Recruiter Notes:</strong>
                      {i.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleUpdateInterview(i.id, "accepted", i.recruiterId, i.jobTitle)}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                  >
                    Accept Round
                  </button>
                  <button
                    onClick={() => handleUpdateInterview(i.id, "reschedule_requested", i.recruiterId, i.jobTitle)}
                    className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Request Reschedule
                  </button>
                  <button
                    onClick={() => handleUpdateInterview(i.id, "declined", i.recruiterId, i.jobTitle)}
                    className="px-3 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PENDING JOB OFFERS */}
      {offers.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Pending Job Offer Letters</h3>
          <div className="grid grid-cols-1 gap-4">
            {offers.map((o) => (
              <div 
                key={o.id}
                className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-150 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
              >
                <div className="space-y-2.5 flex-grow text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                      Offer Extended 🎉
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800">{o.position} Offer</h4>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-bold">
                    Offered by: <span className="text-slate-800 font-black">{o.company}</span>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Offered Salary</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5">{o.salary}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Joining Date</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5">{new Date(o.joining_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Employment Type</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5 capitalize">{o.employment_type}</span>
                    </div>
                  </div>

                  {o.notes && (
                    <div className="bg-white/80 border border-slate-100 p-3 rounded-2xl text-slate-500 leading-relaxed mt-2 font-medium">
                      <strong className="text-slate-700 font-bold block mb-0.5 font-poppins">Offer Terms & Notes:</strong>
                      {o.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleUpdateOffer(o.id, "accepted", o.appId, o.recruiterId, o.position)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() => handleUpdateOffer(o.id, "declined", o.appId, o.recruiterId, o.position)}
                    className="px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
            {jobs.length > 0 ? (
              jobs.map((job) => {
                const initials = getCompanyInitials(job.firm_name);
                const bg = getCompanyBgColor(job.firm_name);
                return (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.firm_name}
                    location={job.location}
                    type={job.employment_type}
                    workplace={job.work_mode}
                    postedAt={formatPostedAt(job.created_at)}
                    logoText={initials}
                    logoBg={bg}
                    onSave={handleJobSave}
                    initialSaved={savedJobs.includes(String(job.id))}
                    onApply={handleJobApply}
                    initialApplied={appliedJobs.includes(String(job.id))}
                  />
                );
              })
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center flex flex-col items-center justify-center space-y-3 max-w-lg mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700 font-poppins">No legal opportunities yet</h4>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed mx-auto">
                    No legal opportunities have been posted yet. Recruiters will appear here once they publish their openings.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-800 font-poppins">Recent Activity</h3>
          
          {recentApplications.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
              {recentApplications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Submitted application for {app.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Under recruiter review at {app.company}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {formatPostedAt(app.appliedAt)}
                  </span>
                </div>
              ))}
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
