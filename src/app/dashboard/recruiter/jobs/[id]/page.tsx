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
import { generateICSDataURI } from "@/lib/ics";

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
  const [interviewRound, setInterviewRound] = useState("HR Screening");

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
      const interviewsData = interviewsRes.data || [];

      // Fetch scorecards for all retrieved interviews
      const interviewIds = interviewsData.map((i: any) => i.id);
      let scorecardsData: any[] = [];
      if (interviewIds.length > 0) {
        const { data: scData } = await supabase
          .from("interview_scorecards")
          .select(`
            *,
            recruiter:recruiter_id (
              full_name
            )
          `)
          .in("interview_id", interviewIds);
        scorecardsData = scData || [];
      }

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
        const interviewRecord = interviewsData.find((i: any) => 
          i.application_id === app.id && 
          ["pending", "accepted", "reschedule_requested"].includes(i.status)
        );
        
        // Enrich all interviews for this application with scorecards
        const myInterviews = interviewsData
          .filter((i: any) => i.application_id === app.id)
          .map((i: any) => {
            const scorecard = scorecardsData.find((sc: any) => sc.interview_id === i.id);
            return {
              ...i,
              scorecard
            };
          })
          .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

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
          interview: interviewRecord || null,
          allInterviews: myInterviews
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
    if (!editingInterviewId && !["shortlisted", "interview", "interview_completed"].includes(selectedApp.status)) {
      alert("Interviews can only be scheduled for shortlisted or active pipeline candidates.");
      return;
    }

    setActionLoading("interview-save");
    try {
      // 1. Get current recruiter info for the ICS invitation
      const { data: { session } } = await supabase.auth.getSession();
      const recruiterUser = session?.user;
      let recruiterName = "Recruiter";
      let recruiterEmail = "";

      if (recruiterUser) {
        const { data: recProfile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", recruiterUser.id)
          .single();
        if (recProfile) {
          recruiterName = recProfile.full_name;
          recruiterEmail = recProfile.email;
        } else {
          recruiterName = recruiterUser.user_metadata?.full_name || "Recruiter";
          recruiterEmail = recruiterUser.email || "";
        }
      }

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

      let interviewIdToUse = editingInterviewId;
      const isEdit = !!editingInterviewId;

      if (isEdit) {
        // Edit existing interview
        const { error: intErr } = await supabase
          .from("interviews")
          .update({
            title: interviewTitle,
            round: interviewRound,
            scheduled_at: scheduledAtStr,
            duration: interviewDuration,
            type: interviewType,
            meeting_link: interviewType === "online" ? `/interview/${editingInterviewId}` : null,
            location: interviewType === "offline" ? officeLocation : null,
            notes: interviewNotes,
            // Reset reminder flags when rescheduled so new notifications get triggered
            reminder_24h_sent: false,
            reminder_1h_sent: false,
            reminder_15m_sent: false
          })
          .eq("id", editingInterviewId);

        if (intErr) throw intErr;
      } else {
        // Create new interview
        const { data: newInt, error: intErr } = await supabase
          .from("interviews")
          .insert({
            application_id: selectedApp.id,
            job_id: job.id,
            recruiter_id: job.recruiter_id,
            candidate_id: selectedApp.candidateId,
            round: interviewRound,
            title: interviewTitle,
            scheduled_at: scheduledAtStr,
            duration: interviewDuration,
            type: interviewType,
            meeting_link: interviewType === "online" ? "HAQJobs Video Calling" : null,
            location: interviewType === "offline" ? officeLocation : null,
            notes: interviewNotes,
            status: "pending"
          })
          .select()
          .single();

        if (intErr) throw intErr;
        interviewIdToUse = newInt.id;

        if (newInt && interviewType === "online") {
          await supabase
            .from("interviews")
            .update({ meeting_link: `/interview/${newInt.id}` })
            .eq("id", newInt.id);
        }

        // Update job_applications status to 'interview'
        const { error: appErr } = await supabase
          .from("job_applications")
          .update({ status: "interview" })
          .eq("id", selectedApp.id);

        if (appErr) throw appErr;

        // Update local applicant state stage
        setApplicants(prev => 
          prev.map(app => app.id === selectedApp.id ? { ...app, status: "interview" } : app)
        );
      }

      // 2. Generate the ICS Data URI
      const meetingLinkToUse = interviewType === "online" && interviewIdToUse 
        ? `${window.location.origin}/interview/${interviewIdToUse}` 
        : undefined;

      const icsUrl = generateICSDataURI({
        id: interviewIdToUse!,
        title: `${interviewRound} - ${interviewTitle}`,
        scheduledAt: scheduledAtStr,
        duration: interviewDuration,
        type: interviewType,
        meetingLink: meetingLinkToUse,
        location: interviewType === "offline" ? officeLocation : undefined,
        notes: interviewNotes,
        recruiterName,
        recruiterEmail,
        candidateName: selectedApp.candidateName,
        candidateEmail: selectedApp.candidateEmail
      });

      // 3. Notify Candidate
      const candidateContent = isEdit 
        ? `Your interview for "${job.title}" has been rescheduled to ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime} (${interviewType}).\n\nNotes: ${interviewNotes || "None"}\n\nPlease import the attached calendar invite.`
        : `Congratulations! You have been invited for an interview for "${job.title}".\n\nInterview Details:\nDate: ${new Date(interviewDate).toLocaleDateString()}\nTime: ${interviewTime}\nMeeting Link / Location: ${interviewType === "online" ? meetingLinkToUse : officeLocation}\n\nPlease accept the round on your dashboard. Calendar invite attached.`;
      
      await triggerWorkflowEvent({
        userId: selectedApp.candidateId,
        title: isEdit ? "Interview Rescheduled" : "Interview Scheduled",
        content: candidateContent,
        type: "interview",
        referenceId: selectedApp.id,
        referenceType: "job_applications",
        attachmentUrl: icsUrl
      });

      // 4. Notify Recruiter (Send reminder/alert to daily dashboard context)
      if (recruiterUser) {
        const recruiterContent = isEdit
          ? `You rescheduled the interview for "${selectedApp.candidateName}" (Round: ${interviewRound}) to ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}.\n\nCalendar invite attached.`
          : `You scheduled an interview round for "${selectedApp.candidateName}" (Round: ${interviewRound}) on ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}.\n\nCalendar invite attached.`;

        await triggerWorkflowEvent({
          userId: recruiterUser.id,
          title: isEdit ? "Interview Rescheduled (Confirmed)" : "Interview Scheduled (Confirmed)",
          content: recruiterContent,
          type: "interview",
          referenceId: selectedApp.id,
          referenceType: "job_applications",
          attachmentUrl: icsUrl
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg/50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted font-poppins">Loading candidate applications pipeline...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-brand-text font-poppins">Failed to load Pipeline</h2>
        <p className="text-xs text-brand-text-muted font-medium">{errorMessage}</p>
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
          className="text-xs font-bold text-brand-text-muted hover:text-brand-text-secondary flex items-center gap-1 cursor-pointer transition-all"
        >
          <ChevronLeft size={14} /> Back to Posted Jobs
        </button>

        {job && (
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] bg-brand/10 text-[#B63106] border border-blue-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Applicant Pipeline
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight mt-1">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-text-muted font-semibold pt-1">
                <span>{job.employment_type}</span>
                <span>•</span>
                <span>{job.work_mode}</span>
                <span>•</span>
                <span>{job.location || "Remote"}</span>
                <span>•</span>
                <span className="text-brand-text-secondary font-black">{applicants.length} Total Applicants</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-brand-text-muted block font-bold">Openings Listed</span>
              <span className="text-2xl font-black text-brand-text block mt-0.5">{job.openings}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline applicant cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <h3 className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest leading-none">Job Applicants</h3>
          <span className="text-[10px] text-brand-text-muted font-bold">Newest Submissions First</span>
        </div>

        {applicants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {applicants.map((app) => {
              const statusColors: Record<string, string> = {
                applied: "bg-brand/10 text-brand-hover border-blue-100",
                shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                interview: "bg-amber-50 text-amber-700 border-amber-100",
                offered: "bg-pink-50 text-pink-700 border-pink-100",
                hired: "bg-teal-50 text-teal-700 border-teal-100",
                rejected: "bg-red-50 text-red-700 border-red-100"
              };
              const statusBadge = statusColors[app.status] || "bg-brand-bg text-brand-text-secondary border-slate-150";

              return (
                <div 
                  key={app.id}
                  className="bg-brand-card border border-brand-border rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  {/* Candidate Info Details */}
                  <div className="flex items-start gap-4">
                    {app.candidatePhoto ? (
                      <img 
                        src={app.candidatePhoto} 
                        alt={app.candidateName} 
                        className="w-12 h-12 rounded-2xl object-cover border border-brand-border shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand font-black flex items-center justify-center text-base border border-blue-100 shadow-sm">
                        {app.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-brand-text">{app.candidateName}</h4>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${statusBadge}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted font-bold">{app.university}</p>
                      <p className="text-[11px] text-brand-text-muted font-semibold">{app.latestJob}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] text-brand-text-muted font-medium">
                        <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{app.candidateLocation}</span>
                      </div>

                      {/* Chronological Interview Timeline */}
                      {app.allInterviews && app.allInterviews.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-brand-border/40 space-y-2.5 max-w-xl">
                          <h5 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Interview History & Rounds</h5>
                          <div className="space-y-3 relative pl-2 pt-1">
                            {/* Vertical timeline line */}
                            <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-brand-border/60" />
                            {app.allInterviews.map((i: any) => {
                              const scheduledDate = new Date(i.scheduled_at);
                              const formattedTime = scheduledDate.toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              });
                              const statusColorMap: Record<string, string> = {
                                pending: "bg-amber-55 text-amber-700 border-amber-100",
                                accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                declined: "bg-red-50 text-red-700 border-red-150",
                                reschedule_requested: "bg-amber-50 text-amber-700 border-amber-150",
                                cancelled: "bg-slate-50 text-slate-600 border-slate-200",
                                completed: "bg-emerald-50 text-emerald-700 border-emerald-150",
                                no_show: "bg-rose-50 text-rose-700 border-rose-150"
                              };
                              const dotColorMap: Record<string, string> = {
                                pending: "bg-amber-400",
                                accepted: "bg-emerald-400",
                                declined: "bg-red-400",
                                reschedule_requested: "bg-amber-400",
                                cancelled: "bg-slate-300",
                                completed: "bg-emerald-600",
                                no_show: "bg-rose-600"
                              };
                              return (
                                <div key={i.id} className="relative pl-5 text-[11px] leading-normal font-semibold">
                                  {/* Timeline marker */}
                                  <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-200 ${dotColorMap[i.status] || "bg-slate-300"}`} />
                                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                    <span className="text-brand-text font-black">{i.round || "Round"}</span>
                                    <span className="text-brand-text-muted font-bold">({formattedTime})</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${statusColorMap[i.status] || "bg-brand-bg text-brand-text-secondary"}`}>
                                      {i.status === "no_show" ? "No Show" : i.status === "reschedule_requested" ? "Reschedule Req" : i.status}
                                    </span>
                                    {i.type === "online" && i.status === "accepted" && (
                                      <Link 
                                        href={`/interview/${i.id}`}
                                        className="text-[9px] font-bold bg-[#B63106]/10 text-[#B63106] px-1.5 py-0.5 rounded border border-[#B63106]/20 hover:bg-[#B63106]/20 transition-all cursor-pointer"
                                      >
                                        Join call
                                      </Link>
                                    )}
                                  </div>
                                  {/* Render scorecard feedback if completed */}
                                  {i.scorecard && (
                                    <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl max-w-md">
                                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                                        <Award size={10} className="text-[#B63106]" />
                                        <span className="text-brand-text-secondary">Grade:</span>
                                        <span className={`uppercase font-black ${
                                          i.scorecard.recommendation.includes("strong_hire") || i.scorecard.recommendation === "hire"
                                            ? "text-emerald-700"
                                            : "text-red-700"
                                        }`}>
                                          {i.scorecard.recommendation.replace("_", " ")}
                                        </span>
                                        <span className="text-brand-text-muted text-[8px] font-medium">by {i.scorecard.recruiter?.full_name || "Interviewer"}</span>
                                      </div>
                                      {i.scorecard.feedback_notes && (
                                        <p className="text-[10px] text-brand-text-muted font-medium italic mt-1 pl-1 border-l-2 border-slate-200 line-clamp-2">
                                          "{i.scorecard.feedback_notes}"
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 justify-end">
                    
                    {/* View Profile */}
                    {app.candidateId ? (
                      <Link
                        href={`/candidate/${app.candidateId}`}
                        className="px-3 py-2 border border-brand-border hover:border-slate-350 hover:bg-brand-bg text-brand-text-secondary font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        View Profile
                      </Link>
                    ) : (
                      <span className="text-brand-text-muted italic text-[11px]">No Profile</span>
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
                    {["shortlisted", "interview", "interview_completed"].includes(app.status) && !app.interview && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setEditingInterviewId(null);
                          setInterviewTitle(`Interview: ${job?.title || "Legal Position"}`);
                          setInterviewRound("HR Screening");
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
                            setInterviewRound(app.interview.round || "HR Screening");
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
                        className="px-3.5 py-2 bg-[#B63106] hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Send Offer
                      </button>
                    )}

                    {/* Direct Chat message link */}
                    <Link
                      href={`/dashboard/messages?chat=${app.candidateId}`}
                      className="p-2 border border-brand-border hover:bg-brand-bg text-brand-text-muted hover:text-brand-text-secondary rounded-xl"
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
          <div className="bg-brand-card rounded-3xl border border-brand-border shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-text-muted">
              <Users size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-text-secondary font-poppins">No Candidates Yet</h4>
              <p className="text-xs text-brand-text-muted font-semibold leading-relaxed">
                No candidates have applied for this legal opening yet. Applications will show up here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isInterviewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-brand-card rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button 
              onClick={() => {
                setIsInterviewModalOpen(false);
                setEditingInterviewId(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-bg cursor-pointer"
            >
              <XCircle size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-brand-text font-poppins flex items-center gap-1.5">
                <CalendarDays size={18} className="text-amber-500" />
                {editingInterviewId ? "Reschedule Interview" : "Schedule Interview"}
              </h3>
              <p className="text-[11px] text-brand-text-muted font-bold mt-0.5">
                {editingInterviewId ? "Rescheduling for: " : "Inviting applicant: "}
                <span className="text-brand-text-secondary font-black">{selectedApp.candidateName}</span>
              </p>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Interview Title</label>
                <input
                  type="text"
                  required
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Interview Round</label>
                <select
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  className="w-full px-3 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                >
                  <option value="HR Screening">HR Screening</option>
                  <option value="Technical Round">Technical Round</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Partner Round">Partner Round</option>
                  <option value="Final HR">Final HR</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 minutes"
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e: any) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  >
                    <option value="online">Online / Video Call</option>
                    <option value="offline">In-person Office Visit</option>
                    <option value="phone">Telephonic Call</option>
                  </select>
                </div>
              </div>

              {interviewType === "online" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                    required
                  />
                </div>
              ) : interviewType === "offline" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Office Location Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Corporate Office, Barakhamba Road, Delhi"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                    required
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Recruiter Notes / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Include any specific details or agenda for the interview round..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsInterviewModalOpen(false);
                    setEditingInterviewId(null);
                  }}
                  className="px-4 py-2.5 bg-brand-bg hover:bg-slate-200 text-brand-text-secondary font-bold text-xs rounded-xl cursor-pointer"
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
          <div className="bg-brand-card rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button 
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-bg cursor-pointer"
            >
              <XCircle size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-brand-text font-poppins flex items-center gap-1.5">
                <FileCheck size={18} className="text-[#B63106]" />
                Send Offer Letter
              </h3>
              <p className="text-[11px] text-brand-text-muted font-bold mt-0.5">Extending offer to: <span className="text-brand-text-secondary font-black">{selectedApp.candidateName}</span></p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  value={offerPosition}
                  onChange={(e) => setOfferPosition(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Offered Annual Salary / Stipend</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12,00,000 INR p.a."
                    value={offerSalary}
                    onChange={(e) => setOfferSalary(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerJoiningDate}
                    onChange={(e) => setOfferJoiningDate(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Offer Terms / Notes</label>
                <textarea
                  rows={4}
                  placeholder="Specify key parameters like probation duration, reporting structure, or documents to submit..."
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs bg-brand-card text-brand-text resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2.5 bg-brand-bg hover:bg-slate-200 text-brand-text-secondary font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "offer-save"}
                  className="px-5 py-2.5 bg-[#B63106] hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
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
