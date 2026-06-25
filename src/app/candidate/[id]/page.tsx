"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FileText, 
  Star, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  ShieldAlert,
  Home,
  MessageSquare,
  Compass,
  Gift,
  LogOut,
  FileCheck
} from "lucide-react";

const candidateLinks = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Applied", href: "/dashboard/applied", icon: FileCheck },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Discover", href: "/dashboard/discover", icon: Compass },
  { name: "Refer a Friend", href: "/dashboard/refer", icon: Gift }
];

// Hydration-safe date formatter
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1]) - 1;
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export default function CandidatePublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [viewer, setViewer] = useState<any>(null);
  
  // Layout States for Candidate view frame
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!candidateId) return;

    async function loadPublicData() {
      try {
        setLoading(true);
        
        // Fetch viewer session
        const { data: { session } } = await supabase.auth.getSession();
        let currentViewer: any = null;

        if (session && session.user) {
          const { data: viewerProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          
          currentViewer = viewerProfile;
          setViewer(viewerProfile);
        } else {
          // Force login for candidate public profiles access
          router.push("/login");
          return;
        }

        // Fetch candidate profile
        const { data: candidateProfile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", candidateId)
          .maybeSingle();

        if (profileErr || !candidateProfile) {
          console.error("Profile not found or error:", profileErr);
          setLoading(false);
          return;
        }

        setProfile(candidateProfile);

        // Fetch relational data
        const [expRes, eduRes, skillRes] = await Promise.all([
          supabase.from("experiences").select("*").eq("profile_id", candidateId).order("start_date", { ascending: false }),
          supabase.from("educations").select("*").eq("profile_id", candidateId).order("passing_year", { ascending: false }),
          supabase.from("candidate_skills").select("*").eq("profile_id", candidateId)
        ]);

        if (expRes.data) setExperiences(expRes.data);
        if (eduRes.data) setEducations(eduRes.data);
        if (skillRes.data) setSkills(skillRes.data);

        // Profile View Logging
        // Log view if viewer is a recruiter AND it is not the candidate viewing their own profile
        if (currentViewer && currentViewer.role === "recruiter" && currentViewer.id !== candidateId) {
          // Check access visibility setting
          const isVisible = candidateProfile.visibility === "public" || candidateProfile.visibility === "recruiters_only";
          
          if (isVisible) {
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            
            // Deduplicate: check if this recruiter viewed this candidate today
            const { data: existingView } = await supabase
              .from("profile_views")
              .select("id")
              .eq("candidate_id", candidateId)
              .eq("viewer_id", currentViewer.id)
              .gte("viewed_at", `${today}T00:00:00.000Z`)
              .lte("viewed_at", `${today}T23:59:59.999Z`)
              .maybeSingle();

            if (!existingView) {
              await supabase.from("profile_views").insert({
                candidate_id: candidateId,
                viewer_id: currentViewer.id
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading candidate public profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, [candidateId, router]);

  // Handle status toggle if candidate is viewing
  const handleSearchStatusChange = async (newStatus: string) => {
    if (!viewer) return;
    setViewer((prev: any) => prev ? { ...prev, job_search_status: newStatus } : null);
    try {
      await supabase
        .from("profiles")
        .update({ job_search_status: newStatus })
        .eq("id", viewer.id);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#013CF1]" />
        <p className="text-sm font-semibold text-slate-500">Loading profile portfolio...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          The candidate profile you are trying to view does not exist or has been removed.
        </p>
        <button 
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  // Privacy Access Control Check
  const canAccess = 
    profile.visibility === "public" || 
    (profile.visibility === "recruiters_only" && viewer?.role === "recruiter") ||
    viewer?.id === candidateId;

  if (!canAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800">Private Profile</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          This profile's visibility has been restricted by the candidate.
        </p>
        <button 
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  // Read-only candidate layout rendering
  const profileDetailsContent = (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      
      {/* Back navigation & Edit block */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
        >
          <ArrowLeft size={14} /> Back
        </button>
        
        {viewer?.id === candidateId && (
          <Link 
            href="/dashboard/profile"
            className="text-xs font-bold text-[#013CF1] hover:text-white bg-blue-50/50 hover:bg-[#013CF1] border border-blue-100 hover:border-[#013CF1] px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Edit My Profile
          </Link>
        )}
      </div>

      {/* 1. Header Card */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative overflow-hidden">
        {profile.profile_photo_url ? (
          <img 
            src={profile.profile_photo_url} 
            alt={profile.full_name} 
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-100 shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#013CF1]/10 to-blue-200/30 rounded-2xl flex items-center justify-center font-bold text-3xl text-[#013CF1] border border-blue-100">
            {profile.full_name?.charAt(0).toUpperCase() || "C"}
          </div>
        )}

        <div className="space-y-2 flex-grow">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 font-poppins tracking-tight">
            {profile.full_name}
          </h1>
          <p className="text-xs text-slate-400 font-bold flex items-center justify-center sm:justify-start gap-1 select-none">
            <MapPin size={12} className="text-slate-400" />
            {profile.city && profile.state ? `${profile.city}, ${profile.state}` : profile.company_name || "Location Not Added"}
          </p>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 pt-2 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Mail size={13} className="text-slate-400" /> {profile.email}
            </span>
            {profile.contact_number && (
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-slate-400" /> {profile.contact_number}
              </span>
            )}
          </div>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-bold bg-blue-50 text-[#013CF1] px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
              Candidate
            </span>
            <span className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider select-none capitalize">
              Status: {profile.job_search_status || "Open to Opportunities"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Bio / About */}
      {profile.bio && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">About Me</h3>
          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap font-medium">
            {profile.bio}
          </p>
        </section>
      )}

      {/* 3. Career Preferences & Specialization */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Career Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile.career_preferences) && profile.career_preferences.length > 0 ? (
              profile.career_preferences.map((pref: string) => (
                <span key={pref} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                  {pref}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 font-medium">No preferences selected</span>
            )}
          </div>
        </div>

        {/* Legal Specializations */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Legal Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile.legal_specializations) && profile.legal_specializations.length > 0 ? (
              profile.legal_specializations.map((domain: string) => (
                <span key={domain} className="text-xs font-bold text-[#013CF1] bg-blue-50/50 border border-blue-50 px-3 py-1.5 rounded-xl">
                  {domain}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 font-medium">No domains specified</span>
            )}
          </div>
        </div>
      </section>

      {/* 4. Experience */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Briefcase className="text-[#013CF1]" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Experience</h3>
        </div>

        <div className="space-y-6">
          {experiences.length > 0 ? (
            experiences.map((exp: any, index: number) => (
              <div key={exp.id} className={`relative flex gap-4 ${index !== experiences.length - 1 ? "border-l-2 border-slate-50 pb-6 ml-4 pl-6" : "ml-4 pl-6"}`}>
                <div className="absolute w-3 h-3 bg-[#013CF1] rounded-full -left-[7px] top-1.5 shadow-sm" />
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{exp.position}</h4>
                  <p className="text-xs font-bold text-[#013CF1]">{exp.firm_name}</p>
                  
                  <p className="text-[10px] font-bold text-slate-400">
                    {formatDateString(exp.start_date)} - {
                      exp.currently_working 
                        ? "Present" 
                        : exp.end_date 
                          ? formatDateString(exp.end_date)
                          : "N/A"
                    }
                  </p>

                  {exp.description && (
                    <p className="text-xs text-slate-500 font-medium pt-2 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 font-medium text-center py-4">No professional experience listed</p>
          )}
        </div>
      </section>

      {/* 5. Education */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <GraduationCap className="text-[#013CF1]" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Education</h3>
        </div>

        <div className="space-y-6">
          {educations.length > 0 ? (
            educations.map((edu: any, index: number) => (
              <div key={edu.id} className={`relative flex gap-4 ${index !== educations.length - 1 ? "border-l-2 border-slate-50 pb-6 ml-4 pl-6" : "ml-4 pl-6"}`}>
                <div className="absolute w-3 h-3 bg-[#013CF1] rounded-full -left-[7px] top-1.5 shadow-sm" />

                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{edu.degree}</h4>
                      {edu.specialization && (
                        <p className="text-xs font-semibold text-slate-500">{edu.specialization}</p>
                      )}
                      <p className="text-xs font-bold text-[#013CF1]">{edu.university_name}</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-slate-50 text-slate-600 px-2 py-1 rounded-lg">
                      Passing: {edu.passing_year}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {edu.cgpa_percentage && (
                      <p className="text-xs text-slate-500 font-bold">
                        Score: <span className="text-slate-800 font-black">{edu.cgpa_percentage}</span>
                      </p>
                    )}
                    
                    {edu.certificate_url && (
                      <a 
                        href={edu.certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#013CF1] hover:underline"
                      >
                        View Certificate <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 font-medium text-center py-4">No educational history listed</p>
          )}
        </div>
      </section>

      {/* 6. Skills Tags */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Award className="text-[#013CF1]" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Skills & Expertise</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.length > 0 ? (
            skills.map((s: any) => (
              <span key={s.id} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                {s.skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-400 font-medium">No skills tags specified</p>
          )}
        </div>
      </section>

      {/* 7. Bar Enrollment details */}
      {profile.bar_enrollment_number && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Award className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Professional Verification</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bar Enrollment Number</span>
              <span className="text-slate-800 font-bold">{profile.bar_enrollment_number}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">State Bar Council</span>
              <span className="text-slate-800 font-bold">{profile.state_bar_council || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Enrollment Year</span>
              <span className="text-slate-800 font-bold">{profile.enrollment_year || "N/A"}</span>
            </div>
            {profile.tribunal_details && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tribunal Details</span>
                <span className="text-slate-800 font-bold">{profile.tribunal_details}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. Resume & Files */}
      {profile.resume_url && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <FileText className="text-[#013CF1]" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Documents Portfolio</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#013CF1] flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Resume / Curriculum Vitae</h4>
                <p className="text-[10px] text-slate-400 font-semibold">PDF File Format</p>
              </div>
            </div>
            
            <a 
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-white bg-black hover:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              View Resume <ExternalLink size={12} />
            </a>
          </div>
        </section>
      )}

      {/* 9. Reviews & Recommendations */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Star className="text-amber-500" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Reviews & Recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center py-4">
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700">Client Reviews</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">No Reviews Yet</p>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700">Peer Recommendations</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">No Recommendations Yet</p>
          </div>
        </div>
      </section>

    </div>
  );

  // Wrap public profile view based on the viewer's role
  if (viewer?.role === "recruiter") {
    // Recruiter panel style header layout wrapper
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        {/* Recruiter Topbar */}
        <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard/recruiter" className="flex items-center">
              <Image 
                src="/logofull.png" 
                alt="HAQJobs Logo" 
                width={130} 
                height={34} 
                style={{ width: "130px", height: "auto" }}
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Recruiter Panel
              </span>
              <button
                onClick={handleSignOut}
                className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic content */}
        <main className="flex-grow overflow-y-auto px-4 sm:px-6 py-6 w-full">
          {profileDetailsContent}
        </main>
      </div>
    );
  }

  // Candidate panel style sidebar layout wrapper (default fallback)
  return (
    <div className="h-screen w-full bg-slate-50/50 flex overflow-hidden">
      
      {/* Left Sidebar */}
      <Sidebar 
        links={candidateLinks} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        roleBadgeText="Candidate"
      />

      {/* Main content body */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Top bar navigation */}
        <TopNav 
          userName={viewer?.full_name || "User"}
          userEmail={viewer?.email || ""}
          userAvatarUrl={viewer?.profile_photo_url || ""}
          searchStatus={viewer?.job_search_status || "Open to Opportunities"}
          onSearchStatusChange={handleSearchStatusChange}
          onMenuToggle={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Scrollable content */}
        <main className="flex-grow overflow-y-auto p-6 sm:p-8 w-full">
          {profileDetailsContent}
        </main>
        
      </div>

    </div>
  );
}
