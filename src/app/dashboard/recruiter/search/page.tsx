"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  X,
  Sliders,
  UserCheck,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { triggerWorkflowEvent } from "@/lib/systemAccount";
import { mapSupabaseError } from "@/lib/errorUtils";

const PRACTICE_AREAS = [
  "Corporate Law",
  "Litigation",
  "Intellectual Property",
  "Family Law",
  "Criminal Law",
  "Taxation",
  "Arbitration & Mediation",
  "Real Estate Law",
  "Banking & Finance",
  "Labor & Employment"
];

const LOCATIONS = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Gurugram",
  "Noida",
  "Ahmedabad"
];

const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Freelance"
];

const JOB_STATUSES = [
  "Ready to Interview",
  "Open to Opportunities",
  "Not Looking"
];

export default function RecruiterSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read parameters directly from URL query
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1") || 1;
  const sortParam = searchParams.get("sort") || "relevant";

  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recruiterJobs, setRecruiterJobs] = useState<any[]>([]);

  // Search input state
  const [query, setQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  
  // Results & Pagination States
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const itemsPerPage = 10;

  // Sorting
  const [sortBy, setSortBy] = useState(sortParam);

  // Filters State
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>([]);
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Action Loading & Shortlist Dialog State
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [shortlistCandidate, setShortlistCandidate] = useState<any | null>(null);
  const [selectedJobForShortlist, setSelectedJobForShortlist] = useState("");

  // Placeholders for visual typing cycle effect
  const placeholders = [
    "Search lawyers...",
    "Search by specialization...",
    "Search by skills...",
    "Search by city...",
    "Search by law firm...",
    "Search by college...",
    "Search by designation..."
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Cycle placeholders
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current user and recruiter job postings
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        // Load recruiter's job openings for the shortlisting dropdown
        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, title, firm_name")
          .eq("recruiter_id", user.id)
          .eq("job_status", "Published");
        if (jobs) setRecruiterJobs(jobs);
      }
    };
    initUser();
  }, []);

  // 300ms Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch live autocomplete suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const { data, error } = await supabase.rpc("search_candidates", {
          p_query: debouncedQuery,
          p_limit: 5,
          p_offset: 0,
          p_practice_areas: [],
          p_locations: [],
          p_employment_types: [],
          p_job_statuses: [],
          p_skills: [],
          p_verified_only: false,
          p_sort_by: "relevant"
        });
        if (!error && data) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handle clicking outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main candidate search runner (single source of truth in DB layer)
  const performSearch = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const { data, error } = await supabase.rpc("search_candidates", {
        p_query: debouncedQuery,
        p_practice_areas: selectedPracticeAreas.length > 0 ? selectedPracticeAreas : [],
        p_locations: selectedLocations.length > 0 ? selectedLocations : [],
        p_employment_types: selectedEmpTypes.length > 0 ? selectedEmpTypes : [],
        p_job_statuses: selectedJobStatuses.length > 0 ? selectedJobStatuses : [],
        p_skills: selectedSkills.length > 0 ? selectedSkills : [],
        p_verified_only: verifiedOnly,
        p_sort_by: sortBy,
        p_limit: itemsPerPage,
        p_offset: offset
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCandidates(data);
        setTotalCount(parseInt(data[0].total_count) || 0);
      } else {
        setCandidates([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("Search failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQuery,
    selectedPracticeAreas,
    selectedLocations,
    selectedEmpTypes,
    selectedJobStatuses,
    selectedSkills,
    verifiedOnly,
    sortBy
  ]);

  // Synchronize state with URL search params changes (handles back/forward/deep links)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const sort = searchParams.get("sort") || "relevant";
    
    setQuery(q);
    setDebouncedQuery(q);
    setCurrentPage(page);
    setSortBy(sort);
  }, [searchParams]);

  // Trigger search on parameter / page modifications
  useEffect(() => {
    performSearch(currentPage);
  }, [currentPage, performSearch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedQuery,
    selectedPracticeAreas,
    selectedLocations,
    selectedEmpTypes,
    selectedJobStatuses,
    selectedSkills,
    verifiedOnly,
    sortBy
  ]);

  // Submit search query
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    params.set("page", "1"); // Reset to page 1
    router.push(`/dashboard/recruiter/search?${params.toString()}`);
  };

  // Clear filters utility
  const handleClearFilters = () => {
    setSelectedPracticeAreas([]);
    setSelectedLocations([]);
    setSelectedEmpTypes([]);
    setSelectedJobStatuses([]);
    setSelectedSkills([]);
    setVerifiedOnly(false);
    setQuery("");
    setDebouncedQuery("");
    
    router.push("/dashboard/recruiter/search");
  };

  // Helper for pagination routing
  const navigateToPage = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    router.push(`/dashboard/recruiter/search?${params.toString()}`);
  };

  // Browse all candidates utility
  const handleBrowseAll = () => {
    handleClearFilters();
  };

  // Skills tag filters
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  // Direct shortlisting handlers
  const handleInitiateShortlist = (candidate: any) => {
    setShortlistCandidate(candidate);
    if (recruiterJobs.length > 0) {
      setSelectedJobForShortlist(recruiterJobs[0].id);
    }
  };

  const handleConfirmShortlist = async () => {
    if (!shortlistCandidate || !selectedJobForShortlist) return;
    setActionLoading(shortlistCandidate.id);
    try {
      // 1. Check if application already exists
      const { data: existingApp } = await supabase
        .from("job_applications")
        .select("*")
        .eq("profile_id", shortlistCandidate.id)
        .eq("job_id", selectedJobForShortlist)
        .maybeSingle();

      if (existingApp) {
        // Update status of existing application to shortlisted
        const { error } = await supabase
          .from("job_applications")
          .update({ status: "shortlisted" })
          .eq("id", existingApp.id);
        if (error) throw error;
      } else {
        // Create new application row marked shortlisted
        const { error } = await supabase
          .from("job_applications")
          .insert({
            profile_id: shortlistCandidate.id,
            job_id: selectedJobForShortlist,
            status: "shortlisted"
          });
        if (error) throw error;
      }

      // 2. Dispatch persistent system notification & alert message
      const jobObject = recruiterJobs.find(j => j.id === selectedJobForShortlist);
      const jobTitle = jobObject ? jobObject.title : "legal opening";
      const firmName = jobObject ? jobObject.firm_name || "HAQJobs Recruiter" : "HAQJobs Recruiter";

      await triggerWorkflowEvent({
        userId: shortlistCandidate.id,
        title: "Application Shortlisted",
        content: `Congratulations! You have been shortlisted for the position of "${jobTitle}" at "${firmName}".`,
        type: "shortlist"
      });

      alert(`Successfully shortlisted ${shortlistCandidate.full_name}!`);
    } catch (err: any) {
      alert(mapSupabaseError(err, "Failed to shortlist candidate."));
    } finally {
      setActionLoading(null);
      setShortlistCandidate(null);
    }
  };

  // Calculations for pagination bounds
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex flex-col font-poppins min-h-screen text-brand-text">
      
      {/* 1. Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#B63106] uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>Talent Sourcing</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-brand-text leading-tight">
          Candidate Sourcing Engine
        </h1>
        <p className="text-sm font-medium text-brand-text-muted mt-1">
          Perform live, relevance-ranked searches and screen lawyers across cities, colleges, and specializations.
        </p>
      </div>

      {/* 2. Top Search Area with Auto-complete Dropdown */}
      <div className="relative w-full mb-8 z-30" ref={suggestionRef}>
        <form onSubmit={handleSearchSubmit} className="flex gap-3 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={placeholders[placeholderIdx]}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoFocus
              className="w-full pl-12 pr-4 py-4 border border-brand-border rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#B63106] text-sm bg-brand-card font-medium shadow-sm transition-all placeholder:text-brand-text-muted"
            />
            <Search className="text-brand-text-muted absolute left-4 top-4.5 select-none" size={18} />
          </div>
          <button
            type="submit"
            className="px-6 py-4 bg-[#B63106] hover:bg-brand-hover text-white rounded-2xl font-bold text-sm shadow-sm transition-all hover:shadow cursor-pointer select-none flex items-center gap-2"
          >
            <span>Search</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Live suggestions Autocomplete box */}
        <AnimatePresence>
          {showSuggestions && (query.trim() || suggestionsLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-0 right-0 mt-2 bg-brand-card border border-brand-border rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {suggestionsLoading ? (
                <div className="p-5 flex justify-center items-center text-xs font-bold text-brand-text-muted gap-2">
                  <div className="w-4 h-4 border-2 border-dashed border-[#B63106] rounded-full animate-spin"></div>
                  <span>Matching candidate database...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-brand-text-muted">
                  No matching candidates in suggestions. Press Enter to search.
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="px-4 py-2 border-b border-slate-50 text-[10px] font-black text-brand-text-muted uppercase tracking-widest bg-brand-bg/50">
                    Candidate Suggestions
                  </div>
                  {suggestions.map((cand) => (
                    <div
                      key={cand.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        router.push(`/candidate/${cand.id}`);
                      }}
                      className="flex items-center gap-3 p-3.5 hover:bg-brand-bg/70 border-b border-slate-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={cand.profile_photo_url || "/profile/profile1.avif"}
                        alt={cand.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-brand-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-brand-text truncate">{cand.full_name}</span>
                          {cand.bar_enrollment_number && (
                            <CheckCircle2 size={13} className="text-[#B63106] flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-brand-text-muted font-bold flex items-center gap-2 mt-0.5 truncate">
                          <span>{cand.designation || "Legal Counsel"}</span>
                          {cand.company_name && <span>•</span>}
                          {cand.company_name && <span>{cand.company_name}</span>}
                          <span>•</span>
                          <span>{cand.city}, {cand.state}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                  {totalCount > 5 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-3 hover:bg-brand-bg text-xs font-bold text-[#B63106] border-t border-brand-border flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Show all results</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Main Dashboard: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col lg:col-span-3 bg-brand-card border border-brand-border rounded-3xl p-5 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-sm text-brand-text flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-brand-text-muted" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-black text-brand-text-muted hover:text-[#B63106] transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Verified Only Check */}
          <div className="flex items-center justify-between py-1 bg-brand/10/50 p-2.5 rounded-xl border border-blue-100/50">
            <label htmlFor="verifiedOnly" className="text-xs font-extrabold text-blue-900 cursor-pointer select-none">
              Verified Candidates Only
            </label>
            <input
              id="verifiedOnly"
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 text-[#B63106] border-slate-300 rounded focus:ring-[#B63106] cursor-pointer"
            />
          </div>

          {/* Practice Area Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
              Practice Area
            </label>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {PRACTICE_AREAS.map(area => (
                <label key={area} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPracticeAreas.includes(area)}
                    onChange={() => {
                      if (selectedPracticeAreas.includes(area)) {
                        setSelectedPracticeAreas(selectedPracticeAreas.filter(a => a !== area));
                      } else {
                        setSelectedPracticeAreas([...selectedPracticeAreas, area]);
                      }
                    }}
                    className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded focus:ring-blue-500/10"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
              Location
            </label>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {LOCATIONS.map(loc => (
                <label key={loc} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(loc)}
                    onChange={() => {
                      if (selectedLocations.includes(loc)) {
                        setSelectedLocations(selectedLocations.filter(l => l !== loc));
                      } else {
                        setSelectedLocations([...selectedLocations, loc]);
                      }
                    }}
                    className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded focus:ring-blue-500/10"
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div className="space-y-2">
            <label htmlFor="skillInput" className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
              Required Skills
            </label>
            <input
              id="skillInput"
              type="text"
              placeholder="Type & press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="w-full px-3 py-2 border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#B63106] text-xs"
            />
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedSkills.map(sk => (
                  <span key={sk} className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-text-secondary bg-brand-bg px-2 py-0.5 rounded-full">
                    <span>{sk}</span>
                    <button onClick={() => handleRemoveSkill(sk)} className="text-brand-text-muted hover:text-brand-text-secondary"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Search Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
              Availability
            </label>
            <div className="space-y-1.5">
              {JOB_STATUSES.map(status => (
                <label key={status} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJobStatuses.includes(status)}
                    onChange={() => {
                      if (selectedJobStatuses.includes(status)) {
                        setSelectedJobStatuses(selectedJobStatuses.filter(s => s !== status));
                      } else {
                        setSelectedJobStatuses([...selectedJobStatuses, status]);
                      }
                    }}
                    className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded focus:ring-blue-500/10"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Preference */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
              Job Type Preference
            </label>
            <div className="space-y-1.5">
              {EMPLOYMENT_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmpTypes.includes(type)}
                    onChange={() => {
                      if (selectedEmpTypes.includes(type)) {
                        setSelectedEmpTypes(selectedEmpTypes.filter(t => t !== type));
                      } else {
                        setSelectedEmpTypes([...selectedEmpTypes, type]);
                      }
                    }}
                    className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded focus:ring-blue-500/10"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* RESULTS AREA */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Sorting and Summary header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-brand-card border border-brand-border rounded-3xl px-5 py-4 shadow-sm gap-4">
            <div className="text-xs font-bold text-brand-text-muted">
              {loading ? (
                <span>Loading candidates...</span>
              ) : (
                <span>Showing {showingFrom}–{showingTo} of {totalCount} candidates</span>
              )}
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 border border-brand-border rounded-xl text-xs font-bold text-brand-text-secondary bg-brand-bg hover:bg-brand-bg transition-all shadow-sm cursor-pointer"
              >
                <Sliders size={13} />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-text-muted whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("sort", e.target.value);
                    params.set("page", "1");
                    router.push(`/dashboard/recruiter/search?${params.toString()}`);
                  }}
                  className="px-3 py-2 border border-brand-border rounded-xl outline-none text-xs font-bold text-brand-text-secondary bg-brand-card focus:ring-2 focus:ring-blue-500/10 cursor-pointer shadow-sm"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="experience">Most Experienced</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {loading ? (
            <div className="bg-brand-card border border-brand-border rounded-3xl p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-3 border-dashed border-[#B63106] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-bold text-brand-text-muted">Querying database candidate indexes...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-brand-card border border-brand-border rounded-3xl p-12 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center mx-auto text-brand-text-muted shadow-inner">
                <Search size={28} />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-base font-extrabold text-brand-text">No candidates found</h3>
                <p className="text-xs font-medium text-brand-text-muted mt-1 leading-relaxed">
                  We couldn't find any profiles matching your search query or filters.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-brand-border hover:bg-brand-bg rounded-xl text-xs font-bold text-brand-text-secondary cursor-pointer transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleBrowseAll}
                  className="px-4 py-2 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Browse All Candidates
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((cand) => {
                const verified = !!cand.bar_enrollment_number;
                const statusColor = cand.job_search_status === "Ready to Interview" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : cand.job_search_status === "Open to Opportunities"
                  ? "bg-brand/10 text-[#B63106] border-blue-100"
                  : "bg-brand-bg text-brand-text-muted border-brand-border";
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={cand.id}
                    className="bg-brand-card border border-brand-border hover:border-brand-border/80 hover:shadow-md transition-all rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-5 relative overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-[#B63106]/20 to-transparent"></div>

                    {/* Candidate Photo */}
                    <div className="flex-shrink-0 self-start">
                      <img
                        src={cand.profile_photo_url || "/profile/profile1.avif"}
                        alt={cand.full_name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-brand-border shadow-sm"
                      />
                    </div>

                    {/* Profile details */}
                    <div className="flex-1 min-w-0 space-y-4">
                      
                      {/* Meta header */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-brand-text flex items-center gap-1.5 leading-tight">
                            {cand.full_name}
                          </h3>
                          
                          {verified && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-800 bg-brand/10 px-2 py-0.5 rounded-full border border-blue-100">
                              <FileCheck size={11} className="text-[#B63106]" />
                              <span>VERIFIED</span>
                            </span>
                          )}

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                            {cand.job_search_status || "Open to Opportunities"}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-brand-text-muted mt-1 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1"><Briefcase size={13} className="text-brand-text-muted" />{cand.designation || "Advocate"}</span>
                          {cand.current_organization && <span className="text-slate-300">•</span>}
                          {cand.current_organization && <span>{cand.current_organization}</span>}
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1"><MapPin size={13} className="text-brand-text-muted" />{cand.city}, {cand.state}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-extrabold text-[#B63106]">{cand.years_of_experience || 0} Yrs Exp</span>
                        </div>
                      </div>

                      {/* Bio preview */}
                      {cand.bio && (
                        <p className="text-xs font-medium text-brand-text-muted line-clamp-2 leading-relaxed">
                          {cand.bio}
                        </p>
                      )}

                      {/* Specializations & Skills */}
                      <div className="flex flex-col gap-2">
                        {cand.legal_specializations && cand.legal_specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.legal_specializations.slice(0, 3).map((spec: string) => (
                              <span key={spec} className="text-[9px] font-black text-brand-text-secondary bg-brand-bg px-2 py-0.5 rounded border border-brand-border uppercase">
                                {spec}
                              </span>
                            ))}
                            {cand.legal_specializations.length > 3 && (
                              <span className="text-[9px] font-black text-brand-text-muted px-1 py-0.5">
                                +{cand.legal_specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {cand.skills && cand.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 5).map((skill: string) => (
                              <span key={skill} className="text-[10px] font-bold text-[#B63106]/80 bg-brand/10/40 px-2.5 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {cand.skills.length > 5 && (
                              <span className="text-[9px] font-bold text-brand-text-muted px-1 py-0.5">
                                +{cand.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Profile Strength indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Profile Strength:</span>
                        <div className="w-24 bg-brand-bg h-1.5 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${cand.completion || 20}%` }}
                            className="bg-emerald-500 h-full rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600">{cand.completion || 20}%</span>
                      </div>

                    </div>

                    {/* CTA Actions */}
                    <div className="flex md:flex-col justify-end gap-2.5 md:w-36 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-50 md:pl-4">
                      <Link
                        href={`/candidate/${cand.id}`}
                        className="flex-1 md:flex-initial text-center px-3 py-2 bg-brand-bg hover:bg-brand-bg border border-brand-border text-xs font-bold text-brand-text-secondary rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <User size={13} />
                        <span>Open Profile</span>
                      </Link>
                      
                      <Link
                        href={`/dashboard/messages?recipient=${cand.id}`}
                        className="flex-1 md:flex-initial text-center px-3 py-2 bg-brand-bg hover:bg-brand-bg border border-brand-border text-xs font-bold text-brand-text-secondary rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare size={13} />
                        <span>Message</span>
                      </Link>

                      <button
                        onClick={() => handleInitiateShortlist(cand)}
                        disabled={actionLoading === cand.id}
                        className="flex-1 md:flex-initial text-center px-3 py-2 bg-black hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusCircle size={13} />
                        <span>Shortlist</span>
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalCount > itemsPerPage && (
            <div className="flex justify-between items-center bg-brand-card border border-brand-border rounded-3xl p-5 shadow-sm">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => navigateToPage(Math.max(currentPage - 1, 1))}
                className="flex items-center gap-1 px-4 py-2 border border-brand-border hover:bg-brand-bg rounded-xl text-xs font-bold text-brand-text-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => navigateToPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent 
                          ? "bg-[#B63106] text-white shadow" 
                          : "border border-brand-border hover:bg-brand-bg text-brand-text-secondary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage) || loading}
                onClick={() => navigateToPage(Math.min(currentPage + 1, Math.ceil(totalCount / itemsPerPage)))}
                className="flex items-center gap-1 px-4 py-2 border border-brand-border hover:bg-brand-bg rounded-xl text-xs font-bold text-brand-text-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 4. SHORTLIST DIALOG MODAL */}
      <AnimatePresence>
        {shortlistCandidate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-card rounded-3xl max-w-md w-full border border-brand-border shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShortlistCandidate(null)}
                className="absolute right-4 top-4 p-1 text-brand-text-muted hover:text-brand-text-secondary rounded bg-brand-bg"
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-black text-brand-text pr-8">
                Shortlist Candidate
              </h2>
              <p className="text-xs font-medium text-brand-text-muted mt-1 leading-relaxed">
                Shortlist <strong>{shortlistCandidate.full_name}</strong> for one of your active job listings.
              </p>

              {recruiterJobs.length === 0 ? (
                <div className="my-6 p-4 border border-amber-100 bg-amber-50 rounded-2xl text-center space-y-2">
                  <HelpCircle size={22} className="text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-amber-950">No published job postings</p>
                  <p className="text-[10px] text-amber-800">
                    You must publish a job posting before shortlisting candidates.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard/recruiter/post-job"
                      onClick={() => setShortlistCandidate(null)}
                      className="px-3 py-1.5 bg-black hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold inline-block"
                    >
                      Post a Job
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="my-6 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="jobSelect" className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                      Select Position
                    </label>
                    <select
                      id="jobSelect"
                      value={selectedJobForShortlist}
                      onChange={(e) => setSelectedJobForShortlist(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl outline-none text-xs font-bold text-brand-text-secondary bg-brand-card focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                      {recruiterJobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title} at {job.firm_name || "HAQJobs"}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleConfirmShortlist}
                    disabled={actionLoading === shortlistCandidate.id}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-black hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <PlusCircle size={14} />
                    <span>Confirm Shortlist</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MOBILE FILTERS OVERLAY */}
      <AnimatePresence>
        {showFiltersMobile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-brand-card w-80 h-full border-l border-brand-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <h3 className="font-extrabold text-sm text-brand-text flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-brand-text-muted" />
                    <span>Filters</span>
                  </h3>
                  <button onClick={() => setShowFiltersMobile(false)} className="p-1 text-brand-text-muted hover:text-brand-text-secondary bg-brand-bg rounded">
                    <X size={16} />
                  </button>
                </div>

                {/* Verified Only Check */}
                <div className="flex items-center justify-between py-1 bg-brand/10/50 p-2.5 rounded-xl border border-blue-100/50">
                  <label htmlFor="verifiedOnlyMobile" className="text-xs font-extrabold text-blue-900 cursor-pointer">
                    Verified Candidates
                  </label>
                  <input
                    id="verifiedOnlyMobile"
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-[#B63106] border-slate-300 rounded focus:ring-blue-500/10 cursor-pointer"
                  />
                </div>

                {/* Practice Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                    Practice Area
                  </label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {PRACTICE_AREAS.map(area => (
                      <label key={area} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPracticeAreas.includes(area)}
                          onChange={() => {
                            if (selectedPracticeAreas.includes(area)) {
                              setSelectedPracticeAreas(selectedPracticeAreas.filter(a => a !== area));
                            } else {
                              setSelectedPracticeAreas([...selectedPracticeAreas, area]);
                            }
                          }}
                          className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded"
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                    Location
                  </label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {LOCATIONS.map(loc => (
                      <label key={loc} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(loc)}
                          onChange={() => {
                            if (selectedLocations.includes(loc)) {
                              setSelectedLocations(selectedLocations.filter(l => l !== loc));
                            } else {
                              setSelectedLocations([...selectedLocations, loc]);
                            }
                          }}
                          className="w-3.5 h-3.5 text-[#B63106] border-slate-300 rounded"
                        />
                        <span>{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label htmlFor="skillInputMobile" className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">
                    Skills
                  </label>
                  <input
                    id="skillInputMobile"
                    type="text"
                    placeholder="Type & press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full px-3 py-2 border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#B63106] text-xs"
                  />
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSkills.map(sk => (
                        <span key={sk} className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-text-secondary bg-brand-bg px-2 py-0.5 rounded-full">
                          <span>{sk}</span>
                          <button onClick={() => handleRemoveSkill(sk)} className="text-brand-text-muted hover:text-brand-text-secondary"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-2">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 border border-brand-border rounded-xl text-xs font-bold text-brand-text-secondary bg-brand-bg hover:bg-brand-bg text-center transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="flex-1 py-3 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
