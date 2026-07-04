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
  Calendar as CalendarIcon,
  PlusCircle,
  Users,
  Search,
  ArrowRight,
  Eye,
  FileCheck,
  Award,
  Lock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  Copy,
  Archive,
  Trash2,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  TrendingUp,
  Inbox,
  Globe
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRecruiterStrength } from "@/lib/profileUtils";
import { mapSupabaseError } from "@/lib/errorUtils";
import { triggerWorkflowEvent } from "@/lib/systemAccount";

// Date formatting helper
const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return "";
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
    return "";
  }
};

export default function RecruiterDashboard() {
  const router = useRouter();

  // Base loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Session & User Profile
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Basic");

  // Dynamic metrics
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [newAppsTodayCount, setNewAppsTodayCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [offersSentCount, setOffersSentCount] = useState(0);
  const [hiresCount, setHiresCount] = useState(0);

  // Complete DB arrays
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recruiterInterviews, setRecruiterInterviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Pipeline status count map
  const [pipelineCounts, setPipelineCounts] = useState<Record<string, number>>({
    applied: 0,
    screening: 0,
    shortlisted: 0,
    interview: 0,
    assessment: 0,
    offered: 0,
    hired: 0,
    rejected: 0
  });

  // Search & Filters on Active Jobs Table
  const [jobsSearchQuery, setJobsSearchQuery] = useState("");
  const [jobsStatusFilter, setJobsStatusFilter] = useState("");
  const [jobsTypeFilter, setJobsTypeFilter] = useState("");
  const [jobsModeFilter, setJobsModeFilter] = useState("");
  const [jobsSortField, setJobsSortField] = useState("created_at");
  const [jobsSortOrder, setJobsSortOrder] = useState<"asc" | "desc">("desc");
  const [jobsPage, setJobsPage] = useState(1);
  const jobsPerPage = 5;

  // Search on dashboard level (filters applications & jobs lists)
  const [dashboardSearch, setDashboardSearch] = useState("");

  const hasActiveFilters =
    jobsSearchQuery !== "" ||
    jobsStatusFilter !== "" ||
    jobsTypeFilter !== "" ||
    jobsModeFilter !== "";

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Load Dashboard Data from Supabase
  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      const userId = session.user.id;

      // 1. Fetch Recruiter Profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

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

      // 2. Fetch Recruiter's Profile Views count
      const { count: recruiterViews } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewer_id", userId);

      if (recruiterViews !== null) {
        setViewsCount(recruiterViews);
      }

      // 3. Fetch Jobs
      const { data: dbJobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", userId)
        .order("created_at", { ascending: false });

      let loadedJobs = dbJobs || [];
      setJobs(loadedJobs);
      setActiveJobsCount(loadedJobs.filter(j => j.job_status === "Published").length);

      // 4. Fetch Applications & Candidate profiles
      if (loadedJobs.length > 0) {
        const myJobIds = loadedJobs.map(j => String(j.id));

        const { data: dbApps } = await supabase
          .from("job_applications")
          .select(`
            id,
            job_id,
            status,
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
          .order("created_at", { ascending: false });

        if (dbApps && dbApps.length > 0) {
          // Fetch candidate educations dynamically
          const candidateIds = Array.from(new Set(dbApps.map((a: any) => a.profile_id).filter(Boolean)));
          const { data: edus } = await supabase
            .from("educations")
            .select("profile_id, university_name, degree")
            .in("profile_id", candidateIds);

          const eduMap = new Map();
          if (edus) {
            edus.forEach((e: any) => {
              // Store highest degree or NALSAR/NLU if possible
              if (!eduMap.has(e.profile_id)) {
                eduMap.set(e.profile_id, `${e.degree}, ${e.university_name}`);
              }
            });
          }

          const jobTitleMap = new Map(loadedJobs.map(j => [String(j.id), j.title]));

          const formattedApps = dbApps.map((app: any) => {
            return {
              id: app.id,
              jobId: app.job_id,
              candidateId: app.profiles?.id,
              candidateName: app.profiles?.full_name || "Anonymous Candidate",
              candidateEmail: app.profiles?.email || "",
              candidatePhoto: app.profiles?.profile_photo_url,
              candidateLocation: app.profiles?.city && app.profiles?.state
                ? `${app.profiles.city}, ${app.profiles.state}`
                : "N/A",
              university: eduMap.get(app.profiles?.id) || "Law Graduate",
              jobTitle: jobTitleMap.get(String(app.job_id)) || "Legal Position",
              appliedAt: app.created_at,
              status: app.status || "applied"
            };
          });

          setApplications(formattedApps);
          setApplicantsCount(formattedApps.length);

          // Calculate status statistics
          setNewAppsTodayCount(formattedApps.filter(a => new Date(a.appliedAt).toDateString() === new Date().toDateString()).length);
          setShortlistedCount(formattedApps.filter(a => a.status === "shortlisted").length);
          setInterviewsCount(formattedApps.filter(a => a.status === "interview").length);
          setPendingReviewsCount(formattedApps.filter(a => a.status === "applied").length);
          setOffersSentCount(formattedApps.filter(a => a.status === "offered").length);
          setHiresCount(formattedApps.filter(a => a.status === "hired").length);

          // Pipeline count details
          const pipeline: Record<string, number> = {
            applied: 0,
            screening: 0,
            shortlisted: 0,
            interview: 0,
            assessment: 0,
            offered: 0,
            hired: 0,
            rejected: 0
          };
          formattedApps.forEach(a => {
            const s = a.status.toLowerCase();
            if (pipeline[s] !== undefined) {
              pipeline[s]++;
            } else {
              pipeline.applied++;
            }
          });
          setPipelineCounts(pipeline);

          // Fetch interviews for recruiter's jobs
          const appIds = formattedApps.map((a: any) => a.id);
          if (appIds.length > 0) {
            const { data: dbInts } = await supabase
              .from("interviews")
              .select("*")
              .in("application_id", appIds);
            if (dbInts) {
              setRecruiterInterviews(dbInts);
            }
          }

          // Build dynamic notification alerts
          const alerts: string[] = [];
          const newAppsCount = formattedApps.filter(a => new Date(a.appliedAt).toDateString() === new Date().toDateString()).length;
          if (newAppsCount > 0) {
            alerts.push(`You received ${newAppsCount} new job application(s) today.`);
          }
          const expiringJobs = loadedJobs.filter(j => j.deadline && new Date(j.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && new Date(j.deadline).getTime() > Date.now());
          if (expiringJobs.length > 0) {
            alerts.push(`${expiringJobs.length} job listing(s) are expiring in the next 3 days.`);
          }
          setNotifications(alerts);
        } else {
          setApplications([]);
          setApplicantsCount(0);
          setPipelineCounts({
            applied: 0,
            screening: 0,
            shortlisted: 0,
            interview: 0,
            assessment: 0,
            offered: 0,
            hired: 0,
            rejected: 0
          });
        }
      }
    } catch (err) {
      console.error("Dashboard data load failure:", err);
    }
  };

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      await loadDashboardData();
      setLoading(false);
    }
    initDashboard();
  }, [router]);

  // Recruiter actions on applicant rows
  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      if (!app) return;

      const currentStatus = app.status;
      let isValidTransition = false;
      if (currentStatus === "applied") {
        isValidTransition = (newStatus === "shortlisted" || newStatus === "rejected");
      } else if (currentStatus === "shortlisted") {
        isValidTransition = (newStatus === "interview" || newStatus === "offered" || newStatus === "rejected");
      } else if (currentStatus === "interview") {
        isValidTransition = (newStatus === "offered" || newStatus === "rejected");
      } else if (currentStatus === "offered") {
        isValidTransition = (newStatus === "hired" || newStatus === "rejected");
      }

      if (!isValidTransition) {
        alert(`Invalid stage transition from "${currentStatus}" to "${newStatus}".`);
        return;
      }

      setActionLoading(appId);
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (!error) {
        // Update local state instantly (Optimistic UI)
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
        );

        // Add persistent candidate notification & system message in sync
        if (app.candidateId) {
          const firmName = profile?.company_name || "the organization";
          if (newStatus === "shortlisted") {
            await triggerWorkflowEvent({
              userId: app.candidateId,
              title: "Application Shortlisted",
              content: `Congratulations! Your application for the position of "${app.jobTitle}" at "${firmName}" has been shortlisted.`,
              type: "shortlist",
              referenceId: appId,
              referenceType: "job_applications"
            });
          } else if (newStatus === "rejected") {
            await triggerWorkflowEvent({
              userId: app.candidateId,
              title: "Application Status Update",
              content: `Thank you for applying to "${firmName}".\n\nAfter careful consideration, we have decided not to move forward with your application.\n\nWe appreciate your interest and wish you success in your future opportunities.`,
              type: "rejection",
              referenceId: appId,
              referenceType: "job_applications"
            });
          }
        }

        // Reload all counts to match
        await loadDashboardData();
      } else {
        alert(mapSupabaseError(error, "Failed to update candidate status."));
      }
    } catch (e) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Duplicate Job Listing
  const handleDuplicateJob = async (job: any) => {
    try {
      setActionLoading(`dup-${job.id}`);
      const { id, created_at, updated_at, ...jobData } = job;
      const { error } = await supabase
        .from("jobs")
        .insert({
          ...jobData,
          title: `${job.title} (Copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        await loadDashboardData();
      } else {
        alert(mapSupabaseError(error, "Failed to duplicate job opening."));
      }
    } catch (e) {
      alert("Failed to duplicate job. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Archive Job Listing
  const handleArchiveJob = async (jobId: string) => {
    try {
      setActionLoading(`arch-${jobId}`);
      const { error } = await supabase
        .from("jobs")
        .update({ job_status: "Archived" })
        .eq("id", jobId);

      if (!error) {
        await loadDashboardData();
      } else {
        alert(mapSupabaseError(error, "Failed to archive job opening."));
      }
    } catch (e) {
      alert("Failed to archive job. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Job Listing
  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to permanently delete this job listing? This will also clear all related candidate applications.")) {
      try {
        setActionLoading(`del-${jobId}`);
        const { error } = await supabase
          .from("jobs")
          .delete()
          .eq("id", jobId);

        if (!error) {
          await loadDashboardData();
        } else {
          alert(mapSupabaseError(error, "Failed to delete job opening."));
        }
      } catch (e) {
        alert("Failed to delete job. Please try again.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Calendar variables
  const daysInMonthList = getDaysInMonth(calendarMonth);
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });
  const yearNumber = calendarMonth.getFullYear();

  // Job deadlines & interviews map for calendar highlight
  const deadlineMap = new Map();
  jobs.forEach(j => {
    if (j.deadline) {
      const dateStr = new Date(j.deadline).toDateString();
      if (!deadlineMap.has(dateStr)) {
        deadlineMap.set(dateStr, []);
      }
      deadlineMap.get(dateStr).push({ title: `Expiry: ${j.title}`, type: "expiry" });
    }
  });

  recruiterInterviews.forEach(i => {
    if (i.scheduled_at) {
      const dateStr = new Date(i.scheduled_at).toDateString();
      if (!deadlineMap.has(dateStr)) {
        deadlineMap.set(dateStr, []);
      }
      deadlineMap.get(dateStr).push({ title: `Interview: ${i.title}`, type: "interview" });
    }
  });

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
    setSelectedCalendarDay(null);
  };
  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
    setSelectedCalendarDay(null);
  };

  // Calculate selected day events
  const selectedDayEvents = selectedCalendarDay ? (deadlineMap.get(selectedCalendarDay) || []) : [];

  // Filter Active Jobs Array
  const filteredJobs = jobs.filter(j => {
    // search filter
    if (jobsSearchQuery) {
      const q = jobsSearchQuery.toLowerCase();
      if (!j.title.toLowerCase().includes(q) && !j.location.toLowerCase().includes(q)) return false;
    }
    // status filter
    if (jobsStatusFilter && j.job_status !== jobsStatusFilter) return false;
    // type filter
    if (jobsTypeFilter && j.employment_type !== jobsTypeFilter) return false;
    // mode filter
    if (jobsModeFilter && j.work_mode !== jobsModeFilter) return false;
    // dashboard level global search
    if (dashboardSearch) {
      const q = dashboardSearch.toLowerCase();
      if (!j.title.toLowerCase().includes(q) && !j.firm_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort Active Jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aVal: any = a[jobsSortField];
    let bVal: any = b[jobsSortField];
    if (jobsSortField === "created_at") {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    }
    if (aVal < bVal) return jobsSortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return jobsSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginated Jobs
  const totalJobsPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const paginatedJobs = sortedJobs.slice((jobsPage - 1) * jobsPerPage, jobsPage * jobsPerPage);

  // Filter Applications based on Dashboard level search
  const filteredApplications = applications.filter(app => {
    if (app.status !== "applied") return false;

    if (dashboardSearch) {
      const q = dashboardSearch.toLowerCase();
      return (
        app.candidateName.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.university.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isProfileCompleteEnough = strengthScore >= 50;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 font-poppins">

      {/* =========================================================================
          LEFT COLUMN: RECRUITER PROFILE CARD
          ========================================================================= */}
      <section className="lg:col-span-4 lg:sticky lg:top-20 self-start space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Subtle blue accent background bubble */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 -z-10" />

          {/* Profile Photo */}
          {profile?.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt={profile.full_name}
              className="w-20 h-20 rounded-2xl object-cover border border-white shadow-md mb-4 ring-4 ring-blue-50/50"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-[#013CF1] font-black text-2xl border border-blue-100 shadow-sm ring-4 ring-blue-50/50">
              {profile?.full_name?.charAt(0).toUpperCase() || "R"}
            </div>
          )}

          {/* Name & Badge */}
          <div className="flex items-center gap-1.5 justify-center mt-1">
            <h2 className="text-lg font-bold text-slate-800">{profile?.full_name}</h2>
            {profile?.official_email_domain && (
              <span className="w-4 h-4 bg-blue-100 text-[#013CF1] rounded-full flex items-center justify-center text-[10px]" title="Verified Recruiter Profile">
                ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 font-bold mt-1">
            {profile?.designation || "HR Lead"} at <span className="text-slate-700 font-black">{profile?.company_name || "Unspecified Law Firm"}</span>
          </p>

          {/* Verification Badge */}
          {profile?.official_email_domain && (
            <span className="mt-3 inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
              Verified Organization
            </span>
          )}

          {/* Dynamic details listing */}
          <div className="w-full space-y-3 text-left border-t border-slate-50 mt-5 pt-4 pb-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile?.email}</span>
            </div>
            {profile?.company_website && (
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-slate-400 flex-shrink-0" />
                <a href={profile.company_website} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline">
                  {profile.company_website.replace(/(^\w+:|^)\/\//, "")}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <CalendarIcon size={14} className="text-slate-400 flex-shrink-0" />
              <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("default", { month: "long", year: "numeric" }) : "June 2026"}</span>
            </div>
          </div>

          {/* Profile Completion percentage */}
          <div className="w-full border-t border-slate-50 pt-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">Profile Completion</span>
              <span className="font-black text-[#013CF1]">{strengthScore}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthScore}%` }}
                transition={{ duration: 0.6 }}
                className="bg-[#013CF1] h-full"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold text-right capitalize">
              {strengthLabel} Status
            </p>
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/dashboard/recruiter/profile"
            className="w-full mt-6 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 py-3 rounded-xl transition-all shadow-sm"
          >
            Edit Company Profile
          </Link>
        </motion.div>

        {/* Global Dashboard Search */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-poppins">Quick Search</h4>
          <Link href="/dashboard/recruiter/search" className="block relative w-full">
            <input
              type="text"
              placeholder="Search candidates..."
              readOnly
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#013CF1] text-xs bg-slate-50/50 font-medium cursor-pointer select-none pointer-events-none"
            />
            <Search size={14} className="text-slate-400 absolute left-3 top-3.5 select-none" />
          </Link>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-poppins">Calendar</h4>
            <div className="flex items-center gap-1">
              <button onClick={handlePrevMonth} className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500"><ChevronLeft size={14} /></button>
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap px-1.5">{monthName} {yearNumber}</span>
              <button onClick={handleNextMonth} className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500"><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* Grid Layout of Calendar */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-1 font-semibold text-xs">
            {daysInMonthList.map((dayObj, i) => {
              if (dayObj.day === 0 || !dayObj.date) {
                return <div key={`empty-${i}`} className="h-7" />;
              }
              const dStr = dayObj.date.toDateString();
              const hasExpiry = deadlineMap.has(dStr);
              const isToday = dayObj.date.toDateString() === new Date().toDateString();
              const isSelected = selectedCalendarDay === dStr;

              return (
                <button
                  key={`day-${i}`}
                  onClick={() => setSelectedCalendarDay(isSelected ? null : dStr)}
                  className={`h-7 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${isToday
                    ? "bg-[#013CF1] text-white font-bold"
                    : isSelected
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                    }`}
                >
                  <span>{dayObj.day}</span>
                  {hasExpiry && !isToday && !isSelected && (
                    <span className="w-1 h-1 bg-red-500 rounded-full absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Event details */}
          <AnimatePresence mode="wait">
            {selectedCalendarDay && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-3 p-3 bg-red-50/50 border border-red-100/50 rounded-2xl space-y-1 text-left"
              >
                <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Events on this day</h5>
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((evt: any, idx: number) => (
                    <p key={idx} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span>{evt.title}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">No events or application deadlines scheduled.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </section>

      {/* =========================================================================
          RIGHT COLUMN: DASHBOARD FEED
          ========================================================================= */}
      <section className="lg:col-span-8 space-y-8">

        {/* Modern Welcome Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#013CF1] to-blue-700 rounded-3xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden text-white"
        >
          {/* Subtle circle illustration backdrops */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/30 rounded-full pointer-events-none" />
          <div className="absolute right-24 -top-12 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] bg-white/10 text-white/95 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Recruiter Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-poppins">
              Welcome back, {profile?.full_name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-xs text-blue-100 font-medium max-w-md leading-relaxed">
              Find and hire India's next generation of legal professionals. Post opportunities, select resumes, and screen candidates.
            </p>

            {/* Profile completion restrictions warnings */}
            {!isProfileCompleteEnough && (
              <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 max-w-sm">
                <Lock size={14} className="flex-shrink-0 text-white/90" />
                <span>Verify company details to enable job posting. (Min 50%)</span>
              </div>
            )}
          </div>

          <Link
            href={isProfileCompleteEnough ? "/dashboard/recruiter/post-job" : "/dashboard/recruiter/profile"}
            className={`px-5 py-3 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center select-none ${isProfileCompleteEnough
              ? "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#013CF1] border border-white shadow-xl"
              : "bg-white/20 text-white/60 border border-white/10 cursor-not-allowed"
              }`}
            onClick={(e) => {
              if (!isProfileCompleteEnough) {
                e.preventDefault();
                router.push("/dashboard/recruiter/profile");
              }
            }}
          >
            {!isProfileCompleteEnough && <Lock size={12} />}
            <PlusCircle size={14} /> Post Opportunity
          </Link>
        </motion.div>

        {/* Dynamic Metric cards grid */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-poppins">Dashboard Overview</h3>
            <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded">Real-time stats</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Active Jobs */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{activeJobsCount}</span>
            </div>

            {/* Total Applicants */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicants</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{applicantsCount}</span>
            </div>

            {/* Candidate Views */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Views</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{viewsCount}</span>
            </div>

            {/* New Applications Today */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Today</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{newAppsTodayCount}</span>
            </div>

            {/* Shortlisted Candidates */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shortlisted</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{shortlistedCount}</span>
            </div>

            {/* Interviews Scheduled */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interviews</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{interviewsCount}</span>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{pendingReviewsCount}</span>
            </div>

            {/* Offers Sent */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offers Sent</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{offersSentCount}</span>
            </div>

            {/* Hires */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hires</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">{hiresCount}</span>
            </div>

            {/* Average Time to Hire */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time to Hire</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 font-poppins">
                {hiresCount > 0 ? "12 days" : "0"}
              </span>
            </div>
          </div>
        </section>

        {/* Recruitment Pipeline Status Grid */}
        <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-poppins">Recruitment Funnel Progress</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Pipeline status mapping across candidate pools.</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-[#013CF1] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-poppins">Pipeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { label: "Applied", count: pipelineCounts.applied, key: "applied", color: "bg-blue-600" },
              { label: "Screening", count: pipelineCounts.screening, key: "screening", color: "bg-indigo-600" },
              { label: "Shortlisted", count: pipelineCounts.shortlisted, key: "shortlisted", color: "bg-emerald-600" },
              { label: "Interview", count: pipelineCounts.interview, key: "interview", color: "bg-amber-600" },
              { label: "Assessment", count: pipelineCounts.assessment, key: "assessment", color: "bg-purple-600" },
              { label: "Offer", count: pipelineCounts.offered, key: "offered", color: "bg-pink-600" },
              { label: "Hired", count: pipelineCounts.hired, key: "hired", color: "bg-teal-600" },
              { label: "Rejected", count: pipelineCounts.rejected, key: "rejected", color: "bg-red-600" }
            ].map((stage) => {
              const total = applicantsCount || 1;
              const percentage = Math.round((stage.count / total) * 100);
              return (
                <div key={stage.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{stage.label}</span>
                    <span>{stage.count} <span className="text-[10px] text-slate-400 font-semibold">({applicantsCount > 0 ? percentage : 0}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${applicantsCount > 0 ? percentage : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${stage.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notifications list alerts */}
        {notifications.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle size={14} />
              <span>Pending Action Alerts</span>
            </h4>
            <div className="space-y-2">
              {notifications.map((msg, i) => (
                <p key={i} className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                  <span>{msg}</span>
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Active Jobs Control Center Table */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-poppins">Jobs Management</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Control panel to duplicate, edit, archive, or delete listings.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={jobsStatusFilter}
                onChange={(e) => { setJobsStatusFilter(e.target.value); setJobsPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={jobsTypeFilter}
                onChange={(e) => { setJobsTypeFilter(e.target.value); setJobsPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 outline-none"
              >
                <option value="">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setJobsSearchQuery("");
                    setJobsStatusFilter("");
                    setJobsTypeFilter("");
                    setJobsModeFilter("");
                    setJobsPage(1);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                  title="Clear Active Filters"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Quick search inside jobs list */}
          <div className="relative max-w-xs">
            <input
              type="text"
              placeholder="Filter listed jobs..."
              value={jobsSearchQuery}
              onChange={(e) => { setJobsSearchQuery(e.target.value); setJobsPage(1); }}
              className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#013CF1] text-xs bg-slate-50/50"
            />
            <Search size={12} className="text-slate-400 absolute left-2.5 top-2.5 select-none" />
          </div>

          {paginatedJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">Job Details</th>
                    <th className="py-2.5 px-2">Type / Mode</th>
                    <th className="py-2.5 px-2">Applications</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => {
                    // Count candidate applications for this specific job
                    const jobAppsCount = applications.filter(a => String(a.jobId) === String(job.id)).length;
                    const statusColors: Record<string, string> = {
                      Published: "bg-emerald-50 text-emerald-700 border-emerald-100",
                      Draft: "bg-slate-50 text-slate-600 border-slate-100",
                      Closed: "bg-red-50 text-red-700 border-red-100",
                      Archived: "bg-amber-50 text-amber-700 border-amber-100"
                    };
                    const badgeClass = statusColors[job.job_status] || "bg-slate-50 text-slate-600";

                    return (
                      <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all">
                        <td className="py-3.5 px-2">
                          <span className="font-bold text-slate-800 block text-xs hover:text-[#013CF1] cursor-pointer">
                            {job.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{job.location || "Remote"}</span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-semibold text-slate-700 block">{job.employment_type}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">{job.work_mode}</span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-black text-slate-800 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">
                            {jobAppsCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${badgeClass}`}>
                            {job.job_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicateJob(job)}
                              disabled={actionLoading === `dup-${job.id}`}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              title="Duplicate job listing"
                            >
                              {actionLoading === `dup-${job.id}` ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
                            </button>

                            {/* Archive */}
                            {job.job_status !== "Archived" && (
                              <button
                                onClick={() => handleArchiveJob(job.id)}
                                disabled={actionLoading === `arch-${job.id}`}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                title="Archive job"
                              >
                                {actionLoading === `arch-${job.id}` ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={actionLoading === `del-${job.id}`}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete listing"
                            >
                              {actionLoading === `del-${job.id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>

                            <Link
                              href="/dashboard/recruiter/jobs"
                              className="text-[10px] font-bold text-slate-600 hover:text-[#013CF1] px-2.5 py-1 border border-slate-200 rounded-lg hover:border-[#013CF1] transition-all ml-1 bg-white whitespace-nowrap"
                            >
                              Manage
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Inbox className="text-slate-300 w-10 h-10" />
              <p className="text-xs font-semibold text-slate-500">No active job listings found.</p>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Clear filters or post a new job opening to begin candidate acquisitions.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalJobsPages > 1 && (
            <div className="flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="text-[10px] font-bold text-slate-400">Page {jobsPage} of {totalJobsPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setJobsPage(prev => Math.max(prev - 1, 1))}
                  disabled={jobsPage === 1}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => setJobsPage(prev => Math.min(prev + 1, totalJobsPages))}
                  disabled={jobsPage === totalJobsPages}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>


        {/* Recent Applications Listing Redesign */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-poppins">Recent Applicant Submissions</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Live reviews and shortlist pipeline triggers.</p>
            </div>
            {filteredApplications.length > 0 && (
              <Link
                href="/dashboard/recruiter/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
              >
                Manage Openings <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.slice(0, 5).map((app) => {
                const colorsMap: Record<string, string> = {
                  applied: "bg-blue-50 text-blue-700 border-blue-100",
                  screening: "bg-indigo-50 text-indigo-700 border-indigo-100",
                  shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  interview: "bg-amber-50 text-amber-700 border-amber-100",
                  hired: "bg-teal-50 text-teal-700 border-teal-100",
                  rejected: "bg-red-50 text-red-700 border-red-100"
                };
                const statusBadge = colorsMap[app.status] || "bg-slate-50 text-slate-600 border-slate-150";

                return (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-4">
                      {app.candidatePhoto ? (
                        <img
                          src={app.candidatePhoto}
                          alt={app.candidateName}
                          className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-slate-100">
                          {app.candidateName?.charAt(0).toUpperCase() || "C"}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs leading-none hover:text-[#013CF1]">
                            {app.candidateName}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${statusBadge}`}>
                            {app.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-bold leading-none">{app.university}</p>

                        <div className="flex items-center gap-x-2.5 gap-y-0.5 flex-wrap text-[10px] text-slate-400 font-medium pt-0.5">
                          <span>Applied: <strong className="text-slate-500 font-semibold">{app.jobTitle}</strong></span>
                          <span>•</span>
                          <span>{formatRelativeDate(app.appliedAt) || "Recently"}</span>
                          <span>•</span>
                          <span>{app.candidateLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                      {app.status !== "shortlisted" && app.status !== "hired" && (
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, "shortlisted")}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer select-none"
                        >
                          <Check size={12} />
                          <span>Shortlist</span>
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, "rejected")}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer select-none"
                        >
                          <X size={12} />
                          <span>Reject</span>
                        </button>
                      )}
                      {app.candidateId ? (
                        <Link
                          href={`/candidate/${app.candidateId}`}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                        >
                          View Profile
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">No Profile</span>
                      )}
                      <Link
                        href={app.candidateId ? `/dashboard/messages?chat=${app.candidateId}` : "/dashboard/messages"}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all"
                        title="Direct Message Candidate"
                      >
                        <MessageSquare size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Users className="text-slate-300 w-10 h-10" />
              <p className="text-xs font-semibold text-slate-500">No applicant submissions received.</p>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Active submissions will appear here once candidates apply to your published job listings.
              </p>
            </div>
          )}
        </section>

        {/* Quick Nav actions panel */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-poppins">Recruiter Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <Link
              href={isProfileCompleteEnough ? "/dashboard/recruiter/post-job" : "/dashboard/recruiter/profile"}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between h-28 group"
              onClick={(e) => {
                if (!isProfileCompleteEnough) {
                  e.preventDefault();
                  router.push("/dashboard/recruiter/profile");
                }
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#013CF1] flex items-center justify-center group-hover:bg-[#013CF1] group-hover:text-white transition-all">
                <PlusCircle size={16} />
              </div>
              <span className="text-xs font-bold text-slate-800">Post Opportunity</span>
            </Link>

            <Link
              href="/dashboard/recruiter/jobs"
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between h-28 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Briefcase size={16} />
              </div>
              <span className="text-xs font-bold text-slate-800">Manage Jobs</span>
            </Link>

            <Link
              href="/dashboard/recruiter/search"
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between h-28 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Search size={16} />
              </div>
              <span className="text-xs font-bold text-slate-800">Browse Candidates</span>
            </Link>

            <Link
              href="/dashboard/messages"
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between h-28 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                <MessageSquare size={16} />
              </div>
              <span className="text-xs font-bold text-slate-800">Messages Inbox</span>
            </Link>

          </div>
        </section>

      </section>
    </div>
  );
}

// Days in month list helper
function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDayDate = new Date(year, month + 1, 0).getDate();

  const days = [];
  // padding for previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ day: 0, date: null });
  }
  for (let i = 1; i <= lastDayDate; i++) {
    const d = new Date(year, month, i);
    days.push({ day: i, date: d });
  }
  return days;
}
