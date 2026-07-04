"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import { 
  ChevronLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  Loader2, 
  User, 
  Mail, 
  MessageSquare, 
  AlertCircle,
  Sparkles, 
  CheckCircle, 
  XCircle,
  CalendarDays,
  FileCheck,
  Send,
  Building,
  Info
} from "lucide-react";
import Link from "next/link";
import { triggerWorkflowEvent } from "@/lib/systemAccount";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobApplicantManagementPage({ params }: PageProps) {
  const router = useRouter();
  
  // Dynamic route ID
  const [jobId, setJobId] = useState<string | null>(null);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Data states
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);

  // Modal states
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);

  // Interview Form States
  const [interviewTitle, setInterviewTitle] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState("30 minutes");
  const [interviewType, setInterviewType] = useState<"online" | "offline" | "phone">("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Offer Form States
  const [offerPosition, setOfferPosition] = useState("");
  const [offerSalary, setOfferSalary] = useState("");
  const [offerJoiningDate, setOfferJoiningDate] = useState("");
  const [offerNotes, setOfferNotes] = useState("");

  // Await the params Promise in Next.js 15
  useEffect(() => {
    params.then((resolved) => {
      setJobId(resolved.id);
    });
  }, [params]);

  // Load Job and Applicants
  const loadJobData = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setErrorMessage("");

      // 1. Fetch Job Info
      const { data: jobData, error: jobErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (jobErr) throw jobErr;
      if (!jobData) {
        setErrorMessage("Job vacancy not found.");
        return;
      }
      setJob(jobData);

      // Default modal values based on Job Title
      setInterviewTitle(`Interview: ${jobData.title}`);
      setOfferPosition(jobData.title);

      // 2. Fetch Applications for this job
      const { data: appsData, error: appsErr } = await supabase
        .from("job_applications")
        .select(`
          id,
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
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (appsErr) throw appsErr;

      const rawApps = appsData || [];
      if (rawApps.length === 0) {
        setApplicants([]);
        return;
      }

      // Fetch candidate education, experience, and interview details
      const candidateIds = Array.from(new Set(rawApps.map((a: any) => a.profile_id).filter(Boolean)));
      const appIds = rawApps.map((a: any) => a.id);
      
      const [edusRes, expsRes, interviewsRes] = await Promise.all([
        supabase.from("educations").select("profile_id, university_name, degree").in("profile_id", candidateIds),
        supabase.from("experiences").select("profile_id, firm_name, position").in("profile_id", candidateIds),
        supabase.from("interviews").select("*").in("application_id", appIds)
      ]);

      const edus = edusRes.data;
      const exps = expsRes.data;
      const interviewsData = interviewsRes.data;

      const eduMap = new Map();
      if (edus) {
        edus.forEach((e: any) => {
          if (!eduMap.has(e.profile_id)) {
            eduMap.set(e.profile_id, `${e.degree}, ${e.university_name}`);
          }
        });
      }

      const expMap = new Map();
      if (exps) {
        exps.forEach((x: any) => {
          if (!expMap.has(x.profile_id)) {
            expMap.set(x.profile_id, `${x.position} at ${x.firm_name}`);
          }
        });
      }

      const formatted = rawApps.map((app: any) => {
        const interviewRecord = interviewsData?.find((i: any) => 
          i.application_id === app.id && 
          ["pending", "accepted", "reschedule_requested"].includes(i.status)
        );
        return {
          id: app.id,
          candidateId: app.profiles?.id,
          candidateName: app.profiles?.full_name || "Anonymous Candidate",
          candidateEmail: app.profiles?.email || "",
          candidatePhoto: app.profiles?.profile_photo_url,
          candidateLocation: app.profiles?.city && app.profiles?.state 
            ? `${app.profiles.city}, ${app.profiles.state}` 
            : "India",
          university: eduMap.get(app.profiles?.id) || "Law Graduate",
          latestJob: expMap.get(app.profiles?.id) || "Fresh Graduate",
          appliedAt: app.created_at,
          status: app.status || "applied",
          interview: interviewRecord || null
        };
      });

      setApplicants(formatted);
    } catch (err: any) {
      console.error("Job applicant review error:", err);
      setErrorMessage(mapSupabaseError(err, "Failed to load applicant pipeline records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  // General Notification Trigger Helper
  const createNotification = async (userId: string, title: string, content: string) => {
    try {
      await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title,
          content,
          is_read: false
        });
    } catch (e) {
      console.error("Notification logging failed:", e);
    }
  };

  // Status updates (Shortlist, Reject, etc.)
  const handleUpdateStatus = async (appId: string, candidateId: string, newStatus: string) => {
    try {
      const app = applicants.find(a => a.id === appId);
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

      if (error) throw error;

      // Update local state optimistically
      setApplicants(prev => 
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );

      // Create persistent notification & system message in sync
      const jobTitle = job ? job.title : "legal opening";
      const firmName = job ? job.firm_name || "the organization" : "the organization";
      
      if (candidateId) {
        if (newStatus === "shortlisted") {
          await triggerWorkflowEvent({
            userId: candidateId,
            title: "Application Shortlisted",
            content: `Congratulations! Your application for the position of "${jobTitle}" at "${firmName}" has been shortlisted.`,
            type: "shortlist",
            referenceId: appId,
            referenceType: "job_applications"
          });
        } else if (newStatus === "rejected") {
          await triggerWorkflowEvent({
            userId: candidateId,
            title: "Application Status Update",
            content: `Thank you for applying to "${firmName}".\n\nAfter careful consideration, we have decided not to move forward with your application.\n\nWe appreciate your interest and wish you success in your future opportunities.`,
            type: "rejection",
            referenceId: appId,
            referenceType: "job_applications"
          });
        }
      }
      
      await loadJobData();
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Interview
  const handleCancelInterview = async (appId: string, interviewId: string, candidateId: string) => {
    if (window.confirm("Are you sure you want to cancel this interview? This will revert the applicant stage to Shortlisted.")) {
      try {
        setActionLoading(appId);
        
        // 1. Cancel interview record (update status to cancelled instead of deleting)
        const { error: updateIntErr } = await supabase
          .from("interviews")
          .update({ status: "cancelled" })
          .eq("id", interviewId);
          
        if (updateIntErr) throw updateIntErr;

        // 2. Revert application status
        const { error: appErr } = await supabase
          .from("job_applications")
          .update({ status: "shortlisted" })
          .eq("id", appId);

        if (appErr) throw appErr;

        // 3. Trigger cancel workflow event
        const jobTitle = job ? job.title : "legal opening";
        const firmName = job ? job.firm_name || "the organization" : "the organization";
        await triggerWorkflowEvent({
          userId: candidateId,
          title: "Interview Cancelled",
          content: `Your scheduled interview for "${jobTitle}" at "${firmName}" has been cancelled.`,
          type: "cancelled",
          referenceId: appId,
          referenceType: "job_applications"
        });

        await loadJobData();
      } catch (err: any) {
        alert(mapSupabaseError(err, "Failed to cancel interview."));
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Schedule Interview Save (Handles insert and update)
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !job || actionLoading) return;
    
    // Validate state transition for new interview
    if (!editingInterviewId && selectedApp.status !== "shortlisted") {
      alert("Interviews can only be scheduled for shortlisted candidates.");
      return;
    }

    setActionLoading("interview-save");
    try {
      // Format combined ISO date-time
      let scheduledAtStr = "";
      try {
        if (/^\d{2}:\d{2}$/.test(interviewTime)) {
          scheduledAtStr = new Date(`${interviewDate}T${interviewTime}:00`).toISOString();
        } else {
          scheduledAtStr = new Date(`${interviewDate} ${interviewTime}`).toISOString();
        }
      } catch (err) {
        scheduledAtStr = new Date(interviewDate).toISOString();
      }

      if (editingInterviewId) {
        // Edit existing interview
        const { error: intErr } = await supabase
          .from("interviews")
          .update({
            title: interviewTitle,
            scheduled_at: scheduledAtStr,
            duration: interviewDuration,
            type: interviewType,
            meeting_link: interviewType === "online" ? meetingLink : null,
            location: interviewType === "offline" ? officeLocation : null,
            notes: interviewNotes
          })
          .eq("id", editingInterviewId);

        if (intErr) throw intErr;

        // Trigger rescheduled workflow event (notifying candidate)
        const contentStr = `Your interview for "${job.title}" has been rescheduled to ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime} (${interviewType}).\n\nNotes: ${interviewNotes || "None"}`;
        await triggerWorkflowEvent({
          userId: selectedApp.candidateId,
          title: "Interview Rescheduled",
          content: contentStr,
          type: "interview",
          referenceId: selectedApp.id,
          referenceType: "job_applications"
        });
      } else {
        // Create new interview
        const { error: intErr } = await supabase
          .from("interviews")
          .insert({
            application_id: selectedApp.id,
            title: interviewTitle,
            scheduled_at: scheduledAtStr,
            duration: interviewDuration,
            type: interviewType,
            meeting_link: interviewType === "online" ? meetingLink : null,
            location: interviewType === "offline" ? officeLocation : null,
            notes: interviewNotes,
            status: "pending"
          });

        if (intErr) throw intErr;

        // Update job_applications status
        const { error: appErr } = await supabase
          .from("job_applications")
          .update({ status: "interview" })
          .eq("id", selectedApp.id);

        if (appErr) throw appErr;

        // Update local applicant state stage
        setApplicants(prev => 
          prev.map(app => app.id === selectedApp.id ? { ...app, status: "interview" } : app)
        );

        // Trigger workflow event (notifying candidate)
        const contentStr = `Congratulations! You have been invited for an interview for "${job.title}".\n\nInterview Details:\nDate: ${new Date(interviewDate).toLocaleDateString()}\nTime: ${interviewTime}\nMeeting Link / Location: ${interviewType === "online" ? meetingLink : officeLocation}\n\nPlease join the meeting at the scheduled time.`;
        await triggerWorkflowEvent({
          userId: selectedApp.candidateId,
          title: "Interview Scheduled",
          content: contentStr,
          type: "interview",
          referenceId: selectedApp.id,
          referenceType: "job_applications"
        });
      }

      setIsInterviewModalOpen(false);
      setEditingInterviewId(null);
      
      // Clean states
      setInterviewNotes("");
      setMeetingLink("");
      setOfficeLocation("");
      await loadJobData();
    } catch (err: any) {
      alert(mapSupabaseError(err, "Failed to schedule interview."));
    } finally {
      setActionLoading(null);
    }
  };

  // Send Offer Letter Save
  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !job || actionLoading) return;

    // Validate state transition for offer extending
    if (selectedApp.status !== "shortlisted" && selectedApp.status !== "interview") {
      alert("Offers can only be extended to shortlisted or interviewed candidates.");
      return;
    }

    setActionLoading("offer-save");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const recruiterId = session?.user?.id;

      // 1. Insert into offers table
      const { error: offerErr } = await supabase
        .from("offers")
        .insert({
          application_id: selectedApp.id,
          position: offerPosition,
          salary: offerSalary,
          joining_date: offerJoiningDate,
          employment_type: job.employment_type || "Full Time",
          notes: offerNotes,
          status: "pending",
          created_by: recruiterId
        });

      if (offerErr) throw offerErr;

      // 2. Update application status
      const { error: appErr } = await supabase
        .from("job_applications")
        .update({ status: "offered" })
        .eq("id", selectedApp.id);

      if (appErr) throw appErr;

      // Update local applicant state
      setApplicants(prev => 
        prev.map(app => app.id === selectedApp.id ? { ...app, status: "offered" } : app)
      );

      // 3. Trigger offer workflow event
      const firmName = job.firm_name || "the organization";
      const contentStr = `Congratulations!\n\nWe are pleased to offer you the position of "${offerPosition}" at "${firmName}".\n\nOffer Details:\nSalary: ${offerSalary}\nJoining Date: ${new Date(offerJoiningDate).toLocaleDateString()}\nEmployment Type: ${job.employment_type || "Full Time"}\nNotes: ${offerNotes || "None"}\n\nPlease review and accept the offer details on your dashboard.`;
      
      await triggerWorkflowEvent({
        userId: selectedApp.candidateId,
        title: "Job Offer Extended 🎉",
        content: contentStr,
        type: "offer",
        referenceId: selectedApp.id,
        referenceType: "job_applications"
      });

      setIsOfferModalOpen(false);
      setOfferNotes("");
      setOfferSalary("");
      await loadJobData();
    } catch (err: any) {
      alert(mapSupabaseError(err, "Failed to send job offer."));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500 font-poppins">Loading candidate applications pipeline...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-800 font-poppins">Failed to load Pipeline</h2>
        <p className="text-xs text-slate-500 font-medium">{errorMessage}</p>
        <button onClick={() => router.push("/dashboard/recruiter/jobs")} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl shadow-sm">
          Return to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full space-y-8 font-poppins">
      
      {/* Back button and title info */}
      <div className="space-y-4">
        <button 
          onClick={() => router.push("/dashboard/recruiter/jobs")}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-all"
        >
          <ChevronLeft size={14} /> Back to Posted Jobs
        </button>

        {job && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] bg-blue-50 text-[#013CF1] border border-blue-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Applicant Pipeline
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold pt-1">
                <span>{job.employment_type}</span>
                <span>•</span>
                <span>{job.work_mode}</span>
                <span>•</span>
                <span>{job.location || "Remote"}</span>
                <span>•</span>
                <span className="text-slate-700 font-black">{applicants.length} Total Applicants</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">Openings Listed</span>
              <span className="text-2xl font-black text-slate-800 block mt-0.5">{job.openings}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline applicant cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest leading-none">Job Applicants</h3>
          <span className="text-[10px] text-slate-400 font-bold">Newest Submissions First</span>
        </div>

        {applicants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {applicants.map((app) => {
              const statusColors: Record<string, string> = {
                applied: "bg-blue-50 text-blue-700 border-blue-100",
                shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                interview: "bg-amber-50 text-amber-700 border-amber-100",
                offered: "bg-pink-50 text-pink-700 border-pink-100",
                hired: "bg-teal-50 text-teal-700 border-teal-100",
                rejected: "bg-red-50 text-red-700 border-red-100"
              };
              const statusBadge = statusColors[app.status] || "bg-slate-50 text-slate-600 border-slate-150";

              return (
                <div 
                  key={app.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  {/* Candidate Info Details */}
                  <div className="flex items-start gap-4">
                    {app.candidatePhoto ? (
                      <img 
                        src={app.candidatePhoto} 
                        alt={app.candidateName} 
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-base border border-blue-100 shadow-sm">
                        {app.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-800">{app.candidateName}</h4>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${statusBadge}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold">{app.university}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{app.latestJob}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] text-slate-400 font-medium">
                        <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{app.candidateLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 justify-end">
                    
                    {/* View Profile */}
                    {app.candidateId ? (
                      <Link
                        href={`/candidate/${app.candidateId}`}
                        className="px-3 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        View Profile
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No Profile</span>
                    )}

                    {/* Shortlist */}
                    {app.status !== "shortlisted" && app.status !== "interview" && app.status !== "offered" && app.status !== "hired" && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, app.candidateId, "shortlisted")}
                        disabled={actionLoading === app.id}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Shortlist
                      </button>
                    )}

                    {/* Reject */}
                    {app.status !== "rejected" && app.status !== "hired" && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, app.candidateId, "rejected")}
                        disabled={actionLoading === app.id}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}

                    {/* Schedule Interview */}
                    {app.status === "shortlisted" && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setEditingInterviewId(null);
                          setInterviewTitle(`Interview: ${job?.title || "Legal Position"}`);
                          setInterviewDate("");
                          setInterviewTime("");
                          setInterviewDuration("30 minutes");
                          setInterviewType("online");
                          setMeetingLink("");
                          setOfficeLocation("");
                          setInterviewNotes("");
                          setIsInterviewModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Schedule Interview
                      </button>
                    )}

                    {/* Edit Interview & Cancel Interview */}
                    {app.status === "interview" && app.interview && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setEditingInterviewId(app.interview.id);
                            setInterviewTitle(app.interview.title);
                            try {
                              const d = new Date(app.interview.scheduled_at);
                              const dateStr = d.toISOString().split('T')[0];
                              const hours = d.getHours();
                              const mins = d.getMinutes();
                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              const formattedHours = hours % 12 || 12;
                              const formattedMins = mins < 10 ? `0${mins}` : mins;
                              setInterviewDate(dateStr);
                              setInterviewTime(`${formattedHours}:${formattedMins} ${ampm}`);
                            } catch (e) {
                              setInterviewDate("");
                              setInterviewTime("");
                            }
                            setInterviewDuration(app.interview.duration);
                            setInterviewType(app.interview.type);
                            setMeetingLink(app.interview.meeting_link || "");
                            setOfficeLocation(app.interview.location || "");
                            setInterviewNotes(app.interview.notes || "");
                            setIsInterviewModalOpen(true);
                          }}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-150 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Edit Interview
                        </button>
                        <button
                          onClick={() => handleCancelInterview(app.id, app.interview.id, app.candidateId)}
                          disabled={actionLoading === app.id}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          Cancel Interview
                        </button>
                      </>
                    )}

                    {/* Send Offer Letter */}
                    {(app.status === "interview" || app.status === "shortlisted") && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsOfferModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-[#013CF1] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Send Offer
                      </button>
                    )}

                    {/* Direct Chat message link */}
                    <Link
                      href={`/dashboard/messages?chat=${app.candidateId}`}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl"
                      title="Send instant message"
                    >
                      <MessageSquare size={13} />
                    </Link>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Users size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-700 font-poppins">No Candidates Yet</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                No candidates have applied for this legal opening yet. Applications will show up here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isInterviewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button 
              onClick={() => {
                setIsInterviewModalOpen(false);
                setEditingInterviewId(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <XCircle size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-800 font-poppins flex items-center gap-1.5">
                <CalendarDays size={18} className="text-amber-500" />
                {editingInterviewId ? "Reschedule Interview" : "Schedule Interview"}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {editingInterviewId ? "Rescheduling for: " : "Inviting applicant: "}
                <span className="text-slate-700 font-black">{selectedApp.candidateName}</span>
              </p>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interview Title</label>
                <input
                  type="text"
                  required
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 minutes"
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e: any) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  >
                    <option value="online">Online / Video Call</option>
                    <option value="offline">In-person Office Visit</option>
                    <option value="phone">Telephonic Call</option>
                  </select>
                </div>
              </div>

              {interviewType === "online" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                    required
                  />
                </div>
              ) : interviewType === "offline" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Office Location Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Corporate Office, Barakhamba Road, Delhi"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                    required
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruiter Notes / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Include any specific details or agenda for the interview round..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsInterviewModalOpen(false);
                    setEditingInterviewId(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "interview-save"}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === "interview-save" ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <Send size={12} />
                  )}
                  <span>{editingInterviewId ? "Update & Reschedule" : "Send Interview Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND OFFER MODAL */}
      {isOfferModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button 
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <XCircle size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-800 font-poppins flex items-center gap-1.5">
                <FileCheck size={18} className="text-[#013CF1]" />
                Send Offer Letter
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">Extending offer to: <span className="text-slate-700 font-black">{selectedApp.candidateName}</span></p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  value={offerPosition}
                  onChange={(e) => setOfferPosition(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Offered Annual Salary / Stipend</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12,00,000 INR p.a."
                    value={offerSalary}
                    onChange={(e) => setOfferSalary(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerJoiningDate}
                    onChange={(e) => setOfferJoiningDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Offer Terms / Notes</label>
                <textarea
                  rows={4}
                  placeholder="Specify key parameters like probation duration, reporting structure, or documents to submit..."
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "offer-save"}
                  className="px-5 py-2.5 bg-[#013CF1] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === "offer-save" ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <CheckCircle size={12} />
                  )}
                  <span>Extend Job Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
