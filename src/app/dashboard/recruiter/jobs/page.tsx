"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Trash2, 
  Edit, 
  Eye, 
  Loader2, 
  Plus, 
  X,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Award,
  Users
} from "lucide-react";
import Link from "next/link";

// Inferred practice area helper based on title/description keywords
const getPracticeArea = (job: any): string => {
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  if (title.includes("corporate") || desc.includes("corporate")) return "Corporate Law";
  if (title.includes("litigation") || desc.includes("litigation") || title.includes("advocate")) return "Litigation & Dispute";
  if (title.includes("tax") || desc.includes("tax")) return "Tax Law";
  if (title.includes("ip") || title.includes("patent") || title.includes("intellectual")) return "Intellectual Property";
  if (title.includes("arbitration") || desc.includes("mediation")) return "Arbitration & ADR";
  if (title.includes("employment") || title.includes("labor")) return "Labor & Employment";
  return "General Legal Practice";
};

export default function ManageJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  
  // Edit Form Fields
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("Full Time");
  const [editMode, setEditMode] = useState("On Site");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editOpenings, setEditOpenings] = useState(1);
  const [editStatus, setEditStatus] = useState("Published");
  const [editError, setEditError] = useState("");

  const loadPostedJobs = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      const { data: jobsData, error: jobsErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", session.user.id)
        .order("created_at", { ascending: false });

      if (jobsErr) throw jobsErr;
      const loadedJobs = jobsData || [];
      setJobs(loadedJobs);

      if (loadedJobs.length > 0) {
        const jobIds = loadedJobs.map(j => String(j.id));
        const { data: appsData, error: appsErr } = await supabase
          .from("job_applications")
          .select("id, job_id")
          .in("job_id", jobIds);

        if (!appsErr && appsData) {
          const counts: Record<string, number> = {};
          appsData.forEach(app => {
            const jid = String(app.job_id);
            counts[jid] = (counts[jid] || 0) + 1;
          });
          setAppCounts(counts);
        }
      }
    } catch (err) {
      console.error("Failed to load recruiter jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostedJobs();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ job_status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      // Update local state
      setJobs(prev => 
        prev.map(j => j.id === jobId ? { ...j, job_status: newStatus } : j)
      );
    } catch (err) {
      console.error("Failed to change job status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to permanently delete this job listing?")) return;
    setActionLoading(jobId);
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      // Update local state
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title || "");
    setEditType(job.employment_type || "Full Time");
    setEditMode(job.work_mode || "On Site");
    setEditLocation(job.location || "");
    setEditDescription(job.description || "");
    setEditSalary(job.salary || "");
    setEditDeadline(job.deadline || "");
    setEditOpenings(job.openings || 1);
    setEditStatus(job.job_status || "Published");
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Job Title is required.");
      return;
    }
    if (!editDescription.trim()) {
      setEditError("Job Description is required.");
      return;
    }

    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: editTitle.trim(),
          employment_type: editType,
          work_mode: editMode,
          location: editLocation.trim(),
          description: editDescription.trim(),
          salary: editSalary.trim(),
          deadline: editDeadline || null,
          openings: editOpenings,
          job_status: editStatus
        })
        .eq("id", editingJob.id);

      if (error) throw error;

      // Reload jobs
      setIsEditModalOpen(false);
      loadPostedJobs();
    } catch (err: any) {
      setEditError(mapSupabaseError(err, "Failed to update job details."));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Draft": return "bg-slate-50 text-slate-500 border-slate-100";
      case "Closed": return "bg-red-50 text-red-700 border-red-100";
      case "Archived": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500 font-poppins">Loading posted jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full space-y-8 font-poppins">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Posted Jobs</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Click on any job opening to review applications, schedule interviews, and send offer letters.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/post-job"
          className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} /> Create Opportunity
        </Link>
      </div>

      {/* Jobs list grid */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const practiceArea = getPracticeArea(job);
            const totalApps = appCounts[String(job.id)] || 0;

            return (
              <div 
                key={job.id} 
                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all duration-300 relative group"
              >
                <div className="space-y-2 flex-grow">
                  {/* Status and Title */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider select-none ${getStatusColor(job.job_status)}`}>
                      {job.job_status}
                    </span>
                    <Link 
                      href={`/dashboard/recruiter/jobs/${job.id}`}
                      className="text-base font-extrabold text-slate-800 hover:text-[#013CF1] transition-colors"
                    >
                      {job.title}
                    </Link>
                  </div>

                  {/* Job metadata fields */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <Award size={13} className="text-slate-400" />
                      <span>{practiceArea}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {job.employment_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {job.work_mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-50/50 text-[#013CF1] px-2 py-0.5 rounded-lg border border-blue-100/30">
                      <Users size={12} />
                      <span className="font-black">{totalApps} Applicants</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 justify-end">
                  
                  {/* Close / Reopen toggles */}
                  {job.job_status === "Published" && (
                    <button
                      onClick={() => handleStatusChange(job.id, "Closed")}
                      disabled={actionLoading === job.id}
                      className="px-3.5 py-2 border border-red-150 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Close Job
                    </button>
                  )}

                  {job.job_status === "Closed" && (
                    <button
                      onClick={() => handleStatusChange(job.id, "Published")}
                      disabled={actionLoading === job.id}
                      className="px-3.5 py-2 border border-emerald-150 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(job)}
                    disabled={actionLoading === job.id}
                    className="p-2 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    title="Edit details"
                  >
                    <Edit size={14} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={actionLoading === job.id}
                    className="p-2 border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    title="Permanently Delete"
                  >
                    {actionLoading === job.id ? (
                      <Loader2 size={14} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>

                  <Link
                    href={`/dashboard/recruiter/jobs/${job.id}`}
                    className="text-[10px] font-bold text-white bg-[#013CF1] hover:bg-blue-700 px-3.5 py-2.5 rounded-xl shadow-sm transition-all ml-1 whitespace-nowrap"
                  >
                    Review Applicants
                  </Link>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <FolderOpen size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-700 font-poppins">No Jobs Posted</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              You haven't posted any legal vacancies or internship postings yet. Create one to get started.
            </p>
          </div>
          <Link
            href="/dashboard/recruiter/post-job"
            className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Create First Listing
          </Link>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-800 font-poppins">Edit Job details</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">Modify properties for the selected listing.</p>
            </div>

            {editError && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Mode</label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  >
                    <option value="On Site">On Site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={editMode === "Remote"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary / Stipend</label>
                  <input
                    type="text"
                    value={editSalary}
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={editOpenings}
                    onChange={(e) => setEditOpenings(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-xs bg-white text-slate-800 resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
