"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculateRecruiterStrength } from "@/lib/profileUtils";
import { mapSupabaseError } from "@/lib/errorUtils";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  Lock,
  ArrowRight,
  Sparkles,
  ListPlus
} from "lucide-react";
import Link from "next/link";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "Draft" or "Published"
  const [profile, setProfile] = useState<any>(null);
  const [strengthScore, setStrengthScore] = useState(0);

  // Form Fields
  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("Full Time");
  const [workMode, setWorkMode] = useState("On Site");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  
  // Dynamic lists
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState("");
  
  const [eligibility, setEligibility] = useState<string[]>([]);
  const [newElig, setNewElig] = useState("");

  // Skills Tag Input
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [openings, setOpenings] = useState(1);

  // Selection process steps
  const [selectionSteps, setSelectionSteps] = useState<string[]>([
    "Application Review",
    "Resume Shortlisting",
    "Interview Round",
    "Final Selection"
  ]);
  const [newStep, setNewStep] = useState("");

  // Error/Success state
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadRecruiterProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (userProfile) {
          setProfile(userProfile);
          const strength = calculateRecruiterStrength(userProfile);
          setStrengthScore(strength.score);
        } else {
          setStrengthScore(0);
        }
      } catch (err) {
        console.error("Failed to load recruiter profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRecruiterProfile();
  }, [router]);

  // Responsibility operations
  const addResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities(prev => [...prev, newResp.trim()]);
      setNewResp("");
    }
  };

  const removeResponsibility = (idx: number) => {
    setResponsibilities(prev => prev.filter((_, i) => i !== idx));
  };

  // Eligibility operations
  const addEligibility = () => {
    if (newElig.trim()) {
      setEligibility(prev => [...prev, newElig.trim()]);
      setNewElig("");
    }
  };

  const removeEligibility = (idx: number) => {
    setEligibility(prev => prev.filter((_, i) => i !== idx));
  };

  // Tag skill operations
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim().replace(/,$/, "");
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (tag: string) => {
    setSkills(prev => prev.filter(t => t !== tag));
  };

  // Selection process operations
  const addSelectionStep = () => {
    if (newStep.trim() && !selectionSteps.includes(newStep.trim())) {
      setSelectionSteps(prev => [...prev, newStep.trim()]);
      setNewStep("");
    }
  };

  const removeSelectionStep = (idx: number) => {
    setSelectionSteps(prev => prev.filter((_, i) => i !== idx));
  };

  // Save / Publish submit handler
  const handleSubmit = async (statusVal: "Draft" | "Published") => {
    if (!profile) return;
    setFormError("");

    // Form validations
    if (!title.trim()) {
      setFormError("Job Title is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Job Description is required.");
      return;
    }

    setSaving(statusVal);

    try {
      // Snapshot current recruiter company branding
      const firmNameSnapshot = profile.company_name || "Unknown Firm";
      const firmLogoSnapshot = profile.firm_logo_url || "";

      const jobData = {
        recruiter_id: profile.id,
        title: title.trim(),
        employment_type: employmentType,
        work_mode: workMode,
        location: location.trim() || "Remote",
        description: description.trim(),
        responsibilities,
        eligibility_criteria: eligibility,
        required_skills: skills,
        salary: salary.trim() || "Not Disclosed",
        deadline: deadline || null,
        working_hours: workingHours.trim() || null,
        openings: openings || 1,
        selection_process: selectionSteps,
        job_status: statusVal,
        firm_name: firmNameSnapshot,
        firm_logo_url: firmLogoSnapshot
      };

      const { error } = await supabase
        .from("jobs")
        .insert(jobData)
        .select();

      if (error) throw error;

      // Redirect on successful publish or draft
      router.push("/dashboard/recruiter/jobs");
    } catch (err: any) {
      console.error("Job posting error:", err);
      setFormError(mapSupabaseError(err, "An error occurred while publishing the job."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(null);
    }
  };

  const isProfileCompleteEnough = strengthScore >= 50;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold text-slate-500">Evaluating profile credentials...</p>
      </div>
    );
  }

  // Intercept: If profile is incomplete, render Lock Warning screen
  if (!isProfileCompleteEnough) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto shadow-sm">
          <Lock size={28} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800 font-poppins">Post Opportunity Locked</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            To maintain high-quality listings on HAQJobs, recruiters must complete at least 50% of their profile details before posting.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Your Current Strength</span>
            <span className="text-[#013CF1]">{strengthScore}% / 50%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
            <div className="bg-amber-500 h-full" style={{ width: `${strengthScore}%` }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/dashboard/recruiter"
            className="flex-1 text-center text-xs font-bold text-slate-600 hover:text-black bg-white border border-slate-200 py-3 rounded-xl transition-all"
          >
            Cancel
          </Link>
          <Link
            href="/dashboard/recruiter/profile"
            className="flex-1 text-center text-xs font-bold text-white bg-black hover:bg-slate-900 py-3 rounded-xl shadow-sm transition-all"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 w-full space-y-8">
      
      {formError && (
        <div className="p-4 rounded-2xl border border-red-100 bg-red-50 text-red-800 text-xs font-bold shadow-sm">
          {formError}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-poppins tracking-tight">Post New Opportunity</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Publish clerkships, associate vacancies, or internships for law graduates.
          </p>
        </div>
        <Link 
          href="/dashboard/recruiter/jobs" 
          className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
        >
          Cancel
        </Link>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: BASIC INFORMATION */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-2">
            <Briefcase size={16} className="text-[#013CF1]" /> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Title / Position Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Corporate Law Intern, Legal Associate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
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
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
              >
                <option value="On Site">On Site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Office Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Delhi (leave blank for Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={workMode === "Remote"}
                  className={`w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white ${
                    workMode === "Remote" ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""
                  }`}
                />
                <MapPin size={13} className="text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DETAILS & DESCRIPTION */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
            Job Description & Content
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">About the Role (Overview)</label>
              <textarea
                rows={5}
                required
                placeholder="Provide a comprehensive introduction to this role, its context in the firm, and what makes it exciting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white resize-y min-h-[120px]"
              />
            </div>

            {/* Dynamic Responsibilities */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Responsibilities</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Conduct legal research on arbitration precedents"
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                  className="flex-grow px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {responsibilities.length > 0 && (
                <ul className="space-y-2 pt-2">
                  {responsibilities.map((resp, i) => (
                    <li key={i} className="flex justify-between items-start gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs text-slate-700">
                      <span className="leading-relaxed font-semibold">{resp}</span>
                      <button
                        type="button"
                        onClick={() => removeResponsibility(i)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dynamic Eligibility Criteria */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligibility Criteria</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Final year law students or fresh LLB graduates"
                  value={newElig}
                  onChange={(e) => setNewElig(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEligibility())}
                  className="flex-grow px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={addEligibility}
                  className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {eligibility.length > 0 && (
                <ul className="space-y-2 pt-2">
                  {eligibility.map((elig, i) => (
                    <li key={i} className="flex justify-between items-start gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs text-slate-700">
                      <span className="leading-relaxed font-semibold">{elig}</span>
                      <button
                        type="button"
                        onClick={() => removeEligibility(i)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Required Skills Tag Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Skills & Expertise</label>
              
              <div className="border border-slate-200 rounded-xl p-2 bg-white flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:border-amber-500">
                {skills.map((tag) => (
                  <span key={tag} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-150 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeSkill(tag)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                
                <input
                  type="text"
                  placeholder={skills.length === 0 ? "Type skill and press Enter (e.g. Legal Writing, Tax Law)" : ""}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  className="flex-grow px-2 py-1 outline-none text-xs text-slate-800 bg-transparent min-w-[120px]"
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: SALARY, DATES & OPENINGS */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
            Compensation & Timeline
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary / Monthly Stipend</label>
              <input
                type="text"
                placeholder="e.g. ₹25,000 / month, ₹10L - ₹12L PA"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Deadline</label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                />
                <Calendar size={13} className="text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Working Hours</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 9:30 AM - 6:30 PM, Mon-Fri"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                />
                <Clock size={13} className="text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Number of Openings</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={openings}
                  onChange={(e) => setOpenings(parseInt(e.target.value) || 1)}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                />
                <Users size={13} className="text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: SELECTION PROCESS CHAIN */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-2">
            <ListPlus size={16} className="text-amber-500" /> Selection Process Steps
          </h3>

          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Design the custom ordered hiring stages. Aspiring candidates will view this sequence of steps.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Assessment Test, HR screening"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSelectionStep())}
                className="flex-grow px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
              />
              <button
                type="button"
                onClick={addSelectionStep}
                className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Step
              </button>
            </div>

            {/* Visual Steps Chain */}
            {selectionSteps.length > 0 ? (
              <div className="flex flex-col gap-2 pt-2 max-w-md">
                {selectionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-grow flex justify-between items-center px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectionStep(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    {idx !== selectionSteps.length - 1 && (
                      <div className="text-slate-300 font-bold text-center self-center pl-4 py-0.5">
                        ↓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No hiring stages defined yet.</p>
            )}
          </div>
        </section>

        {/* SUBMIT CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div className="text-[10px] text-slate-400 font-semibold select-none text-center sm:text-left">
            * Snapshots of firm branding name & logo will be saved permanently for this job publication.
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={!!saving}
              onClick={() => handleSubmit("Draft")}
              className="flex-1 sm:flex-none text-center text-xs font-bold text-slate-600 hover:text-black bg-white border border-slate-200 px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving === "Draft" ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </>
              ) : (
                <>Save as Draft</>
              )}
            </button>
            <button
              type="button"
              disabled={!!saving}
              onClick={() => handleSubmit("Published")}
              className="flex-grow sm:flex-none text-center text-xs font-bold text-white bg-black hover:bg-slate-900 px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving === "Published" ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Sparkles size={12} /> Publish Opportunity
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
