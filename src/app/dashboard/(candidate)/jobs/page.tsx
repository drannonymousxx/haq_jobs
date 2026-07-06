"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import { triggerWorkflowEvent } from "@/lib/systemAccount";
import JobCard from "@/components/dashboard/JobCard";
import JobDetailsPanel from "@/components/dashboard/JobDetailsPanel";
import { 
  Search, 
  Compass, 
  Loader2, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  AlertCircle,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to format creation dates to relative text
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
  if (!name) return "bg-blue-100 text-[#B63106]";
  const colors = [
    "bg-blue-100 text-brand-hover",
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

// Main page content component
function CandidateJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenSearch = searchParams ? searchParams.get("search") === "open" : false;

  // DB States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Search & Filter Panel Toggle State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(shouldOpenSearch);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("");
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("");
  const [maxSalary, setMaxSalary] = useState(5000000); // 50 Lakhs default
  const [postedWithin, setPostedWithin] = useState(""); // hours/days
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Options generated dynamically from database
  const [dynamicLocations, setDynamicLocations] = useState<string[]>([]);
  const [dynamicCompanies, setDynamicCompanies] = useState<string[]>([]);

  // Load Data
  useEffect(() => {
    async function loadJobsData() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setCurrentUserId(session.user.id);
          
          // Fetch saved and applied job lists
          const [savedRes, appliedRes, jobsRes] = await Promise.all([
            supabase.from("saved_jobs").select("job_id").eq("profile_id", session.user.id),
            supabase.from("job_applications").select("job_id").eq("profile_id", session.user.id),
            supabase.from("jobs").select("*").eq("job_status", "Published").order("created_at", { ascending: false })
          ]);

          if (savedRes.data) {
            setSavedJobs(savedRes.data.map((item: any) => String(item.job_id)));
          }
          if (appliedRes.data) {
            setAppliedJobs(appliedRes.data.map((item: any) => String(item.job_id)));
          }
          if (jobsRes.data) {
            setRawJobs(jobsRes.data);

            // Generate dynamic location & company lists from db jobs
            const locs = Array.from(new Set(jobsRes.data.map((j: any) => j.location).filter(Boolean))) as string[];
            const comps = Array.from(new Set(jobsRes.data.map((j: any) => j.firm_name).filter(Boolean))) as string[];
            setDynamicLocations(locs);
            setDynamicCompanies(comps);
          }
        }
      } catch (err) {
        console.error("Explore Jobs load error:", err);
        setError(mapSupabaseError(err, "Failed to load opportunities. Please try again."));
      } finally {
        setLoading(false);
      }
    }

    loadJobsData();
  }, []);

  // Update open panel if query param changes
  useEffect(() => {
    if (shouldOpenSearch) {
      setIsFilterPanelOpen(true);
    }
  }, [shouldOpenSearch]);

  // Handle Save Bookmark
  const handleSaveToggle = async (jobId: string | number, isSaved: boolean) => {
    if (!currentUserId) return;
    const stringId = String(jobId);
    
    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .insert({ profile_id: currentUserId, job_id: stringId })
          .select();
        setSavedJobs(prev => [...prev, stringId]);
      } else {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("profile_id", currentUserId)
          .eq("job_id", stringId);
        setSavedJobs(prev => prev.filter(id => id !== stringId));
      }
    } catch (err) {
      console.error("Failed to bookmark job:", err);
      alert(mapSupabaseError(err, "Failed to update saved job."));
    }
  };

  // Handle Apply
  const handleApply = async (jobId: string | number) => {
    if (!currentUserId) return;
    const stringId = String(jobId);

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .insert({ profile_id: currentUserId, job_id: stringId, status: "applied" })
        .select()
        .single();

      if (!error) {
        setAppliedJobs(prev => [...prev, stringId]);

        // Find matching job info
        const jobInfo = rawJobs.find(j => String(j.id) === stringId);
        if (jobInfo && jobInfo.recruiter_id) {
          // Fetch candidate name dynamically
          const { data: candProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentUserId)
            .maybeSingle();

          const candName = candProfile?.full_name || "a candidate";

          await triggerWorkflowEvent({
            userId: jobInfo.recruiter_id,
            title: "New Application Received",
            content: `You have received a new application for the position of "${jobInfo.title}" from ${candName}. Review their profile in your dashboard.`,
            type: "applied",
            referenceId: data?.id,
            referenceType: "job_applications"
          });

          // Notify Candidate
          await triggerWorkflowEvent({
            userId: currentUserId,
            title: "Application Submitted Successfully",
            content: `Your application for "${jobInfo.title}" at "${jobInfo.firm_name || "the organization"}" has been successfully submitted.`,
            type: "applied",
            referenceId: data?.id,
            referenceType: "job_applications"
          });
        }
      } else {
        console.error("Apply error:", error.message);
        alert(mapSupabaseError(error, "Failed to apply for job."));
      }
    } catch (err) {
      console.error("Job application error:", err);
      alert(mapSupabaseError(err, "Failed to apply for job."));
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedEmploymentTypes([]);
    setSelectedPracticeArea("");
    setSelectedExperienceLevel("");
    setMaxSalary(5000000);
    setPostedWithin("");
    setSelectedWorkModes([]);
    setSelectedCompany("");
  };

  // Check if any filter is active
  const hasActiveFilters = 
    searchQuery !== "" ||
    selectedLocation !== "" ||
    selectedEmploymentTypes.length > 0 ||
    selectedPracticeArea !== "" ||
    selectedExperienceLevel !== "" ||
    maxSalary < 5000000 ||
    postedWithin !== "" ||
    selectedWorkModes.length > 0 ||
    selectedCompany !== "";

  // Intelligent Experience Matcher
  const matchExperience = (desc: string, reqs: string[], level: string): boolean => {
    const combinedText = `${desc} ${reqs.join(" ")}`.toLowerCase();
    
    if (level === "0-1 years") {
      return (
        combinedText.includes("0-1") ||
        combinedText.includes("fresh") ||
        combinedText.includes("intern") ||
        combinedText.includes("entry level") ||
        combinedText.includes("graduate") ||
        combinedText.includes("no experience")
      );
    }
    if (level === "1-3 years") {
      return (
        combinedText.includes("1-3") ||
        combinedText.includes("1 to 3") ||
        combinedText.includes("2 years") ||
        combinedText.includes("associate")
      );
    }
    if (level === "3-5 years") {
      return (
        combinedText.includes("3-5") ||
        combinedText.includes("3 to 5") ||
        combinedText.includes("4 years") ||
        combinedText.includes("senior associate")
      );
    }
    if (level === "5-8 years") {
      return (
        combinedText.includes("5-8") ||
        combinedText.includes("5 to 8") ||
        combinedText.includes("6 years") ||
        combinedText.includes("7 years") ||
        combinedText.includes("lead")
      );
    }
    if (level === "8+ years") {
      return (
        combinedText.includes("8+") ||
        combinedText.includes("8 or more") ||
        combinedText.includes("10 years") ||
        combinedText.includes("partner") ||
        combinedText.includes("director")
      );
    }
    return true;
  };

  // Safe Salary Parser
  const parseSalary = (salaryStr: string): number => {
    if (!salaryStr) return 0;
    const digits = salaryStr.replace(/[^\d]/g, "");
    if (!digits) return 0;
    const val = parseInt(digits, 10);
    // If the salary is labeled in lakhs or L (e.g. 6L, 10 Lakhs PA)
    if (salaryStr.toLowerCase().includes("lakh") || (salaryStr.toLowerCase().includes("l") && !salaryStr.toLowerCase().includes("month"))) {
      if (val < 100) return val * 100000;
    }
    return val;
  };

  // Safe Date filter
  const isWithinTimeRange = (createdDateStr: string, range: string): boolean => {
    if (!createdDateStr) return false;
    const diffMs = Date.now() - new Date(createdDateStr).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (range === "24h") return diffHours <= 24;
    if (range === "3d") return diffHours <= 72;
    if (range === "week") return diffHours <= 168; // 7 days
    if (range === "month") return diffHours <= 720; // 30 days
    return true;
  };

  // Perform filtering client-side for immediate responsiveness
  const filteredJobs = rawJobs.filter((job) => {
    // 1. Text Search Query (Title, Description, Skills, Law Firm, Location)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const skillsMatch = job.required_skills?.some((s: string) => s.toLowerCase().includes(q)) || false;
      const mainMatch = 
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.firm_name?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);
      
      if (!mainMatch && !skillsMatch) return false;
    }

    // 2. Location filter
    if (selectedLocation && job.location?.toLowerCase() !== selectedLocation.toLowerCase()) {
      return false;
    }

    // 3. Employment Type Filter (combined OR if multiple checked)
    if (selectedEmploymentTypes.length > 0 && !selectedEmploymentTypes.includes(job.employment_type)) {
      return false;
    }

    // 4. Practice Area Filter (scanning skills and title)
    if (selectedPracticeArea) {
      const q = selectedPracticeArea.toLowerCase();
      const match = 
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.required_skills?.some((s: string) => s.toLowerCase().includes(q)) ||
        job.eligibility_criteria?.some((s: string) => s.toLowerCase().includes(q));
      
      if (!match) return false;
    }

    // 5. Experience Level filter
    if (selectedExperienceLevel && !matchExperience(job.description, job.eligibility_criteria || [], selectedExperienceLevel)) {
      return false;
    }

    // 6. Salary Filter
    if (maxSalary < 5000000) {
      const parsed = parseSalary(job.salary);
      // Skip check if salary is not disclosed or unspecified in the db
      if (parsed > 0 && parsed > maxSalary) {
        return false;
      }
    }

    // 7. Posted Within
    if (postedWithin && !isWithinTimeRange(job.created_at, postedWithin)) {
      return false;
    }

    // 8. Work Mode
    if (selectedWorkModes.length > 0 && !selectedWorkModes.includes(job.work_mode)) {
      return false;
    }

    // 9. Company
    if (selectedCompany && job.firm_name?.toLowerCase() !== selectedCompany.toLowerCase()) {
      return false;
    }

    return true;
  });

  const practiceAreas = [
    "Corporate Law", "Civil Law", "Criminal Law", "Constitutional Law", 
    "Taxation", "Intellectual Property", "Labour Law", "Arbitration", 
    "Cyber Law", "Family Law", "Real Estate", "Environmental Law", 
    "Competition Law", "International Law", "Banking Law", "Startup Law", 
    "Data Privacy", "Legal Research"
  ];

  const experienceLevels = [
    { label: "0–1 years (Intern/Entry)", value: "0-1 years" },
    { label: "1–3 years (Junior)", value: "1-3 years" },
    { label: "3–5 years (Mid Level)", value: "3-5 years" },
    { label: "5–8 years (Senior)", value: "5-8 years" },
    { label: "8+ years (Partner/Lead)", value: "8+ years" }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted">Searching active opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h4 className="text-sm font-bold text-brand-text font-poppins">Load Failure</h4>
        <p className="text-xs text-brand-text-muted font-medium leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text font-poppins">Explore Jobs</h1>
          <p className="text-xs text-brand-text-muted font-semibold mt-1">
            Search clerkships, litigation opportunities, and legal counsel associate roles.
          </p>
        </div>

        {/* Search header controls */}
        <div className="flex items-center gap-2">
          {/* Main Quick Search */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search title, skills or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-[#B63106]/10 focus:border-[#B63106] text-xs bg-brand-card"
            />
            <Search size={14} className="text-brand-text-muted absolute left-3 top-3 select-none" />
          </div>

          {/* Toggle Filter Button */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer select-none ${
              isFilterPanelOpen 
                ? "bg-[#B63106] text-white border-[#B63106]" 
                : "bg-brand-card text-brand-text-secondary border-brand-border hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Expandable Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-brand-bg border border-brand-border rounded-3xl p-5 sm:p-6 space-y-6">
              
              {/* Grid Layout of Advanced Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Locations and Companies */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-secondary mb-2 font-poppins">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs outline-none focus:border-[#B63106]"
                    >
                      <option value="">Any Location</option>
                      {dynamicLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-secondary mb-2 font-poppins">Company / Law Firm</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs outline-none focus:border-[#B63106]"
                    >
                      <option value="">Any Organization</option>
                      {dynamicCompanies.map(comp => (
                        <option key={comp} value={comp}>{comp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Column 2: Practice Area & Experience */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-secondary mb-2 font-poppins">Practice Area</label>
                    <select
                      value={selectedPracticeArea}
                      onChange={(e) => setSelectedPracticeArea(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs outline-none focus:border-[#B63106]"
                    >
                      <option value="">Any Practice Area</option>
                      {practiceAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-secondary mb-2 font-poppins">Experience Level</label>
                    <select
                      value={selectedExperienceLevel}
                      onChange={(e) => setSelectedExperienceLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs outline-none focus:border-[#B63106]"
                    >
                      <option value="">Any Experience</option>
                      {experienceLevels.map(exp => (
                        <option key={exp.value} value={exp.value}>{exp.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Column 3: Work Mode, Time, and Salary */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-secondary mb-2 font-poppins">Posted Within</label>
                    <select
                      value={postedWithin}
                      onChange={(e) => setPostedWithin(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs outline-none focus:border-[#B63106]"
                    >
                      <option value="">Any Time</option>
                      <option value="24h">Last 24 hours</option>
                      <option value="3d">Last 3 days</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-brand-text-secondary font-poppins">Max Annual Salary (INR)</label>
                      <span className="text-[10px] font-bold text-[#B63106] bg-brand/10 px-2 py-0.5 rounded">
                        {maxSalary >= 5000000 ? "Any Salary" : `₹${(maxSalary / 100000).toFixed(1)} Lakhs`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={5000000}
                      step={50000}
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(Number(e.target.value))}
                      className="w-full accent-[#B63106] h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Pill Selectors Grid */}
              <div className="border-t border-brand-border/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Combined Pills for Employment Type & Workplace */}
                <div className="flex flex-wrap gap-4">
                  {/* Workplace options */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-poppins">Workplace Mode</span>
                    <div className="flex gap-2">
                      {["Remote", "Hybrid", "On Site"].map((mode) => {
                        const active = selectedWorkModes.includes(mode);
                        return (
                          <button
                            key={mode}
                            onClick={() => {
                              setSelectedWorkModes(prev => 
                                prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all select-none ${
                              active
                                ? "bg-[#B63106] text-white border-[#B63106]"
                                : "bg-brand-card text-brand-text-secondary border-brand-border hover:border-slate-300"
                            }`}
                          >
                            {mode}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Employment type options */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-poppins">Employment Type</span>
                    <div className="flex gap-2">
                      {["Internship", "Full Time", "Part Time", "Contract", "Freelance"].map((type) => {
                        const active = selectedEmploymentTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedEmploymentTypes(prev => 
                                prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all select-none ${
                              active
                                ? "bg-[#B63106] text-white border-[#B63106]"
                                : "bg-brand-card text-brand-text-secondary border-brand-border hover:border-slate-300"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Clear & Closing buttons */}
                <div className="flex items-center gap-2 self-end">
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-slate-200/50 hover:bg-slate-200 text-brand-text-secondary hover:text-brand-text rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Filters</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-2 bg-slate-200/50 hover:bg-slate-200 text-brand-text-secondary rounded-xl cursor-pointer"
                    title="Collapse Filters"
                  >
                    <X size={14} />
                  </button>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Listings Grid or Empty States */}
      <div className="space-y-4">
        {rawJobs.length === 0 ? (
          <div className="bg-brand-card rounded-3xl border border-brand-border shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-text-muted">
              <Briefcase size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-text-secondary font-poppins">No legal opportunities yet</h4>
              <p className="text-xs text-brand-text-muted font-semibold max-w-xs mx-auto leading-relaxed">
                No legal opportunities have been posted yet. Recruiters will appear here once they publish their openings.
              </p>
            </div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Job Cards List */}
            <div className={`space-y-4 ${expandedJobId ? "lg:col-span-5" : "lg:col-span-12 w-full"}`}>
              {filteredJobs.map((job) => {
                const initials = getCompanyInitials(job.firm_name);
                const bg = getCompanyBgColor(job.firm_name);
                const isExpanded = expandedJobId === String(job.id);
                return (
                  <div key={job.id} className="space-y-4">
                    <JobCard
                      id={job.id}
                      title={job.title}
                      company={job.firm_name}
                      location={job.location}
                      type={job.employment_type}
                      workplace={job.work_mode}
                      postedAt={formatPostedAt(job.created_at)}
                      logoText={initials}
                      logoBg={bg}
                      onSave={handleSaveToggle}
                      initialSaved={savedJobs.includes(String(job.id))}
                      onApply={handleApply}
                      initialApplied={appliedJobs.includes(String(job.id))}
                      onClick={() => setExpandedJobId(isExpanded ? null : String(job.id))}
                      isExpanded={isExpanded}
                    />
                    
                    {/* Inline Mobile Expanded Details */}
                    {isExpanded && (
                      <div className="block lg:hidden mt-2">
                        <JobDetailsPanel
                          job={job}
                          onClose={() => setExpandedJobId(null)}
                          isApplied={appliedJobs.includes(String(job.id))}
                          isSaved={savedJobs.includes(String(job.id))}
                          onApply={handleApply}
                          onSave={handleSaveToggle}
                          logoText={initials}
                          logoBg={bg}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Desktop Selected Job details panel */}
            {expandedJobId && (
              <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-24 max-h-[82vh] overflow-y-auto z-20">
                {(() => {
                  const selectedJob = filteredJobs.find(j => String(j.id) === expandedJobId);
                  if (!selectedJob) return null;
                  const initials = getCompanyInitials(selectedJob.firm_name);
                  const bg = getCompanyBgColor(selectedJob.firm_name);
                  return (
                    <JobDetailsPanel
                      job={selectedJob}
                      onClose={() => setExpandedJobId(null)}
                      isApplied={appliedJobs.includes(expandedJobId)}
                      isSaved={savedJobs.includes(expandedJobId)}
                      onApply={handleApply}
                      onSave={handleSaveToggle}
                      logoText={initials}
                      logoBg={bg}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          /* Empty Search results state */
          <div className="bg-brand-card rounded-3xl border border-brand-border shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-text-muted">
              <Compass size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-text-secondary font-poppins">No matching opportunities</h4>
              <p className="text-xs text-brand-text-muted font-semibold max-w-xs mx-auto leading-relaxed">
                No opportunities match your current filters. Clear filters or adjust your requirements.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-bold bg-black hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// Default export wrapping in Suspense boundary for Next.js compile safety
export default function CandidateJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted">Prerendering explore jobs...</p>
      </div>
    }>
      <CandidateJobsContent />
    </Suspense>
  );
}
