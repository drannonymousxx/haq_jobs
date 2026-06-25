"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculateProfileStrength } from "@/lib/profileUtils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Star,
  Save,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Eye,
  Globe,
  Lock,
  PlusCircle,
  X,
  Loader2,
  FileCheck
} from "lucide-react";

// List of all 15 legal domains
const LEGAL_DOMAINS = [
  "Criminal Law",
  "Civil Law",
  "Corporate Law",
  "Consumer Law",
  "Divorce Law",
  "Family Law",
  "Cyber Law",
  "Intellectual Property",
  "Labour Law",
  "Taxation",
  "Arbitration",
  "Banking Law",
  "Real Estate Law",
  "Constitutional Law",
  "Environmental Law"
];

// Helper to extract storage path from public URL
function getStoragePathFromUrl(url: string, bucketName: string = "haqjobs"): string | null {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.substring(index + marker.length));
}

const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1]) - 1;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

function CandidateProfileContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams ? searchParams.get("tab") : null;

  // Active Tab state
  const [activeTab, setActiveTab] = useState(tabQuery || "personal");

  // Page States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // holds tab name being saved
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Database Models
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  // Profile Strength & Checklist
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState<string>("Basic Profile");
  const [checklist, setChecklist] = useState<any[]>([]);

  // Form States - Personal Info
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Form States - Career Preferences & Specialization
  const [careerPrefs, setCareerPrefs] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Form States - Experience Editor
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expFirmName, setExpFirmName] = useState("");
  const [expPosition, setExpPosition] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expCurrentlyWorking, setExpCurrentlyWorking] = useState(false);
  const [expDescription, setExpDescription] = useState("");

  // Form States - Education Editor
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduUniversity, setEduUniversity] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduSpecialization, setEduSpecialization] = useState("");
  const [eduPassingYear, setEduPassingYear] = useState("");
  const [eduCgpa, setEduCgpa] = useState("");
  const [eduCertUrl, setEduCertUrl] = useState("");
  const [eduCertFile, setEduCertFile] = useState<File | null>(null);

  // Form States - Skills
  const [newSkillText, setNewSkillText] = useState("");

  // Form States - Bar Verification
  const [barNumber, setBarNumber] = useState("");
  const [barCouncil, setBarCouncil] = useState("");
  const [barYear, setBarYear] = useState("");
  const [tribunal, setTribunal] = useState("");

  // Sync tabQuery with activeTab
  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // Load candidate profile details
  const loadProfileDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      const userId = session.user.id;

      // 1. Get Profile Row
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      let profileObj = userProfile;
      if (!profileObj) {
        // Create profiles fallback
        profileObj = {
          id: userId,
          full_name: session.user.user_metadata?.full_name || "Candidate User",
          email: session.user.email,
          job_search_status: "Open to Opportunities"
        };
      }
      setProfile(profileObj);
      setFullName(profileObj.full_name || "");
      setContactNumber(profileObj.contact_number || "");
      setCity(profileObj.city || "");
      setState(profileObj.state || "");
      setBio(profileObj.bio || "");
      setVisibility(profileObj.visibility || "public");
      setCareerPrefs(profileObj.career_preferences || []);
      setSpecializations(profileObj.legal_specializations || []);
      setBarNumber(profileObj.bar_enrollment_number || "");
      setBarCouncil(profileObj.state_bar_council || "");
      setBarYear(profileObj.enrollment_year ? String(profileObj.enrollment_year) : "");
      setTribunal(profileObj.tribunal_details || "");

      // 2. Load relational collections
      const [expRes, eduRes, skillRes, reviewsRes, recsRes] = await Promise.all([
        supabase.from("experiences").select("*").eq("profile_id", userId).order("start_date", { ascending: false }),
        supabase.from("educations").select("*").eq("profile_id", userId).order("passing_year", { ascending: false }),
        supabase.from("candidate_skills").select("*").eq("profile_id", userId),
        supabase.from("reviews").select("id").eq("candidate_id", userId),
        supabase.from("recommendations").select("id").eq("candidate_id", userId)
      ]);

      const loadedExperiences = expRes.data || [];
      const loadedEducations = eduRes.data || [];
      const loadedSkills = skillRes.data || [];
      const loadedReviewsCount = reviewsRes.data?.length || 0;
      const loadedRecsCount = recsRes.data?.length || 0;

      setExperiences(loadedExperiences);
      setEducations(loadedEducations);
      setSkills(loadedSkills);

      // Recalculate Strength
      const strength = calculateProfileStrength(
        profileObj,
        loadedExperiences,
        loadedEducations,
        loadedSkills,
        loadedReviewsCount,
        loadedRecsCount
      );

      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);
      setChecklist(strength.checklist);

    } catch (err) {
      console.error("Error loading candidate profile metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, []);

  const flashMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  // Upload helper with delete-on-replace cleanup
  const uploadToStorage = async (file: File, folder: string, existingUrl?: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Delete previous file if URL exists
    if (existingUrl) {
      const oldPath = getStoragePathFromUrl(existingUrl);
      if (oldPath) {
        await supabase.storage.from("haqjobs").remove([oldPath]);
      }
    }

    // 2. Perform upload
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `${folder}/${userId}/${Date.now()}_${cleanFileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("haqjobs")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadErr) throw uploadErr;

    // 3. Retrieve Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("haqjobs")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // 1. Save Personal Info Form (with photo upload)
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("personal");
    try {
      let finalPhotoUrl = profile?.profile_photo_url || "";

      // Handle photo upload
      if (photoFile) {
        // Validate type & size
        if (!["image/jpeg", "image/jpg", "image/png"].includes(photoFile.type)) {
          throw new Error("Only PNG, JPG, or JPEG images are accepted.");
        }
        if (photoFile.size > 2 * 1024 * 1024) {
          throw new Error("Photo exceeds maximum size of 2 MB.");
        }

        finalPhotoUrl = await uploadToStorage(
          photoFile,
          "profile-images",
          profile?.profile_photo_url
        );
        setPhotoFile(null);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          contact_number: contactNumber,
          city: city,
          state: state,
          bio: bio,
          visibility: visibility,
          profile_photo_url: finalPhotoUrl
        })
        .eq("id", profile.id);

      if (error) throw error;

      flashMessage("Personal information updated successfully!");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to save personal details.", "error");
    } finally {
      setSaving(null);
    }
  };

  // 2. Save Career Preferences & Specialization Form
  const handlePreferencesSave = async () => {
    setSaving("preferences");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          career_preferences: careerPrefs,
          legal_specializations: specializations
        })
        .eq("id", profile.id);

      if (error) throw error;

      flashMessage("Career preferences & specializations saved successfully!");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to save preferences.", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleTogglePref = (pref: string) => {
    setCareerPrefs(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleToggleSpec = (domain: string) => {
    setSpecializations(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  // 3. Experiences Form CRUD Actions
  const handleAddOrEditExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("experience");
    try {
      const payload = {
        profile_id: profile.id,
        firm_name: expFirmName,
        position: expPosition,
        start_date: expStartDate,
        end_date: expCurrentlyWorking ? null : expEndDate,
        currently_working: expCurrentlyWorking,
        description: expDescription
      };

      if (editingExpId) {
        // Edit mode
        const { error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", editingExpId);
        if (error) throw error;
        flashMessage("Experience updated successfully!");
      } else {
        // Add mode
        const { error } = await supabase
          .from("experiences")
          .insert(payload);
        if (error) throw error;
        flashMessage("Experience added successfully!");
      }

      // Reset Form
      setShowExpForm(false);
      setEditingExpId(null);
      setExpFirmName("");
      setExpPosition("");
      setExpStartDate("");
      setExpEndDate("");
      setExpCurrentlyWorking(false);
      setExpDescription("");

      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to save experience details.", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleEditExpClick = (exp: any) => {
    setEditingExpId(exp.id);
    setExpFirmName(exp.firm_name);
    setExpPosition(exp.position);
    setExpStartDate(exp.start_date);
    setExpEndDate(exp.end_date || "");
    setExpCurrentlyWorking(exp.currently_working);
    setExpDescription(exp.description || "");
    setShowExpForm(true);
  };

  const handleDeleteExp = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this experience record?")) return;
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);
      if (error) throw error;
      flashMessage("Experience deleted.");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to delete experience.", "error");
    }
  };

  // 4. Educations Form CRUD Actions
  const handleAddOrEditEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("education");
    try {
      let finalCertUrl = eduCertUrl;

      // Handle certificate upload
      if (eduCertFile) {
        // Validate type & size
        if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(eduCertFile.type)) {
          throw new Error("Only PDF, PNG, JPG, or JPEG certificates are accepted.");
        }
        if (eduCertFile.size > 5 * 1024 * 1024) {
          throw new Error("Certificate file size exceeds maximum limit of 5 MB.");
        }

        finalCertUrl = await uploadToStorage(
          eduCertFile,
          "education-certificates",
          eduCertUrl
        );
        setEduCertFile(null);
      }

      const payload = {
        profile_id: profile.id,
        university_name: eduUniversity,
        degree: eduDegree,
        specialization: eduSpecialization,
        passing_year: parseInt(eduPassingYear),
        cgpa_percentage: eduCgpa,
        certificate_url: finalCertUrl
      };

      if (editingEduId) {
        const { error } = await supabase
          .from("educations")
          .update(payload)
          .eq("id", editingEduId);
        if (error) throw error;
        flashMessage("Education record updated successfully!");
      } else {
        const { error } = await supabase
          .from("educations")
          .insert(payload);
        if (error) throw error;
        flashMessage("Education record added successfully!");
      }

      // Reset
      setShowEduForm(false);
      setEditingEduId(null);
      setEduUniversity("");
      setEduDegree("");
      setEduSpecialization("");
      setEduPassingYear("");
      setEduCgpa("");
      setEduCertUrl("");
      setEduCertFile(null);

      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to save education details.", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleEditEduClick = (edu: any) => {
    setEditingEduId(edu.id);
    setEduUniversity(edu.university_name);
    setEduDegree(edu.degree);
    setEduSpecialization(edu.specialization || "");
    setEduPassingYear(String(edu.passing_year));
    setEduCgpa(edu.cgpa_percentage || "");
    setEduCertUrl(edu.certificate_url || "");
    setShowEduForm(true);
  };

  const handleDeleteEdu = async (edu: any) => {
    if (!window.confirm("Are you sure you want to delete this education record?")) return;
    try {
      // Delete certificate from storage first if exists
      if (edu.certificate_url) {
        const oldPath = getStoragePathFromUrl(edu.certificate_url);
        if (oldPath) {
          await supabase.storage.from("haqjobs").remove([oldPath]);
        }
      }

      const { error } = await supabase
        .from("educations")
        .delete()
        .eq("id", edu.id);
      if (error) throw error;

      flashMessage("Education record deleted.");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to delete education record.", "error");
    }
  };

  // 5. Skills tag list manager
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = newSkillText.trim();
    if (!cleanSkill) return;

    try {
      const { error } = await supabase
        .from("candidate_skills")
        .insert({
          profile_id: profile.id,
          skill: cleanSkill
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already added this skill.");
        }
        throw error;
      }

      setNewSkillText("");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to add skill.", "error");
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from("candidate_skills")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to delete skill.", "error");
    }
  };

  // 6. Professional Documents (Resume Upload)
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;
    setSaving("documents");

    try {
      // Validate PDF only & max 5MB
      if (resumeFile.type !== "application/pdf") {
        throw new Error("Resume must be in PDF format only.");
      }
      if (resumeFile.size > 5 * 1024 * 1024) {
        throw new Error("Resume exceeds maximum size of 5 MB.");
      }

      // Replace file in Supabase storage and get new URL
      const finalUrl = await uploadToStorage(
        resumeFile,
        "resumes",
        profile?.resume_url
      );

      // Save document link to profiles table
      const { error } = await supabase
        .from("profiles")
        .update({
          resume_url: finalUrl
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Track document in relational candidate_documents table as well
      await supabase
        .from("candidate_documents")
        .insert({
          profile_id: profile.id,
          name: resumeFile.name,
          file_url: finalUrl,
          file_type: "resume"
        });

      setResumeFile(null);
      flashMessage("Resume uploaded and updated successfully!");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to upload resume.", "error");
    } finally {
      setSaving(null);
    }
  };

  // 7. Professional verification (Bar Council Details)
  const handleBarVerificationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("verification");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bar_enrollment_number: barNumber,
          state_bar_council: barCouncil,
          enrollment_year: barYear ? parseInt(barYear) : null,
          tribunal_details: tribunal
        })
        .eq("id", profile.id);

      if (error) throw error;

      flashMessage("Bar Council enrollment and verification details updated.");
      await loadProfileDetails();
    } catch (err: any) {
      flashMessage(err.message || "Failed to save verification details.", "error");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile portfolio...</p>
      </div>
    );
  }

  // Left Sidebar vertical tabs menu lists
  const navigationItems = [
    { key: "personal", label: "Personal Information", icon: User },
    { key: "preferences", label: "Preferences & Spec.", icon: Briefcase },
    { key: "experience", label: "Experiences", icon: Briefcase },
    { key: "education", label: "Education Records", icon: GraduationCap },
    { key: "skills", label: "Skills Tags", icon: Award },
    { key: "documents", label: "Professional Resume", icon: FileText },
    { key: "verification", label: "Bar Verification", icon: ShieldCheck },
    { key: "reviews", label: "Reviews & Recs", icon: Star }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Manage Profile</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Complete, verify, and present your credentials to prospective law firms and recruiters.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${message.type === "error"
          ? "bg-red-50 border-red-100 text-red-700"
          : "bg-emerald-50 border-emerald-100 text-emerald-700"
          }`}>
          {message.text}
        </div>
      )}

      {/* Main Multi-Column SaaS Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Profile Overview, Strength, Vertical Nav */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

          {/* Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">

            {/* Profile photo container */}
            <div className="relative group mb-4">
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-[#013CF1] font-bold text-2xl border border-blue-100 select-none">
                  {fullName?.charAt(0).toUpperCase() || "C"}
                </div>
              )}
            </div>

            <h3 className="font-extrabold text-slate-800 text-sm font-poppins">{fullName || "User Name"}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Candidate Profile</p>

            {/* Profile Strength Block */}
            <div className="w-full mt-6 space-y-2 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">Strength Rating</span>
                <span className="text-[#013CF1]">{strengthScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#013CF1] h-full transition-all duration-300" style={{ width: `${strengthScore}%` }} />
              </div>
              <p className="text-[9px] text-[#013CF1] font-extrabold text-left leading-none uppercase tracking-wide">
                {strengthLabel}
              </p>
            </div>
          </div>

          {/* Vertical Navigation Tabs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden py-3">
            <nav className="space-y-1 px-3">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${isActive
                      ? "bg-blue-50 text-[#013CF1]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                  >
                    <Icon size={14} className={isActive ? "text-[#013CF1]" : "text-slate-400"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* RIGHT COLUMN: Tab Panel Forms */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">

          {/* TAB 1: Personal Information */}
          {activeTab === "personal" && (
            <form onSubmit={handlePersonalSave} className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-poppins">Personal Details</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Basic contact information and biography settings.</p>
              </div>

              {/* Avatar Upload field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-slate-50 pb-6">
                {photoFile ? (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-dashed border-slate-300">
                    Selected
                  </div>
                ) : profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={fullName}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#013CF1] font-bold flex items-center justify-center text-lg">
                    {fullName?.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
                <div className="flex flex-col justify-center text-center sm:text-left">
                  <label className="inline-flex w-fit cursor-pointer items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900">
                    Upload New Photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-500">Accepted formats: PNG, JPG, JPEG (Max 2 MB)</p>
                  {photoFile && (
                    <span className="text-[10px] text-slate-600 font-bold block">
                      📁 Selected: {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white"
                    />
                    <User size={14} className="text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white"
                      placeholder="e.g. +91 98765 43210"
                    />
                    <Phone size={14} className="text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white"
                      placeholder="e.g. New Delhi"
                    />
                    <MapPin size={14} className="text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white"
                      placeholder="e.g. Delhi"
                    />
                    <MapPin size={14} className="text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address (Read-only)</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 bg-slate-50 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                  />
                  <Mail size={14} className="text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio / About Yourself</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Share a brief overview of your legal background, special interests, and career accomplishments..."
                  className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white leading-relaxed"
                />
              </div>

              {/* Visibility Setting Section */}
              <div className="space-y-2 border-t border-slate-50 pt-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Privacy Settings</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${visibility === "public"
                      ? "border-[#013CF1] bg-blue-50/20"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className={visibility === "public" ? "text-[#013CF1]" : "text-slate-400"} />
                      <span className="text-xs font-bold text-slate-800">Public</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Visible to all registered users and recruiters.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility("recruiters_only")}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${visibility === "recruiters_only"
                      ? "border-amber-500 bg-amber-50/10"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} className={visibility === "recruiters_only" ? "text-amber-500" : "text-slate-400"} />
                      <span className="text-xs font-bold text-slate-800">Recruiters Only</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Visible strictly to verified employer recruiters.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility("private")}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${visibility === "private"
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Lock size={14} className={visibility === "private" ? "text-slate-800" : "text-slate-400"} />
                      <span className="text-xs font-bold text-slate-800">Private</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Hidden from recruiter searches completely.</p>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving === "personal"}
                  className="px-5 py-3 bg-[#013CF1] hover:bg-[#012cc4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/15"
                >
                  {saving === "personal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Preferences & Specializations */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-poppins">Career Preferences & Domains</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Toggle job types and legal fields you want to match against.</p>
              </div>

              {/* Job Preferences Selection */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desired Job Types</h4>
                <div className="flex flex-wrap gap-2">
                  {["Internship", "Full-Time Job", "Freelance", "Contract", "Part-Time"].map(pref => {
                    const selected = careerPrefs.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => handleTogglePref(pref)}
                        className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all ${selected
                          ? "bg-[#013CF1] border-[#013CF1] text-white"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legal domains multi-select list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Domains & Specialization</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEGAL_DOMAINS.map(domain => {
                    const selected = specializations.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleToggleSpec(domain)}
                        className={`p-3 text-left text-xs font-bold border rounded-xl transition-all flex items-center justify-between ${selected
                          ? "bg-blue-50/50 border-[#013CF1] text-[#013CF1]"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                      >
                        <span>{domain}</span>
                        {selected && <span className="text-[#013CF1] text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6 flex justify-end">
                <button
                  onClick={handlePreferencesSave}
                  disabled={saving === "preferences"}
                  className="px-5 py-3 bg-[#013CF1] hover:bg-[#012cc4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {saving === "preferences" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Experiences */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-poppins">Work History</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your legal internships and associate positions.</p>
                </div>
                {!showExpForm && (
                  <button
                    onClick={() => {
                      setEditingExpId(null);
                      setExpFirmName("");
                      setExpPosition("");
                      setExpStartDate("");
                      setExpEndDate("");
                      setExpCurrentlyWorking(false);
                      setExpDescription("");
                      setShowExpForm(true);
                    }}
                    className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Experience
                  </button>
                )}
              </div>

              {/* Experience list */}
              {!showExpForm ? (
                <div className="space-y-4 pt-2">
                  {experiences.length > 0 ? (
                    experiences.map((exp: any) => (
                      <div key={exp.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4 hover:border-slate-200 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800">{exp.position}</h4>
                          <p className="text-xs font-bold text-[#013CF1]">{exp.firm_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {formatDateString(exp.start_date)} - {
                              exp.currently_working ? "Present" : exp.end_date ? formatDateString(exp.end_date) : "N/A"
                            }
                          </p>
                          {exp.description && (
                            <p className="text-xs text-slate-500 font-semibold pt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleEditExpClick(exp)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteExp(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 italic text-xs">
                      No experiences added yet. Click "Add Experience" to list your law internships or roles.
                    </div>
                  )}
                </div>
              ) : (
                /* Experience subform editing */
                <form onSubmit={handleAddOrEditExperience} className="space-y-4 bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {editingExpId ? "Edit Experience Details" : "Add New Experience Record"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Law Firm / Company Name</label>
                      <input
                        type="text"
                        value={expFirmName}
                        onChange={(e) => setExpFirmName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="Smith & Partners"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Position / Role</label>
                      <input
                        type="text"
                        value={expPosition}
                        onChange={(e) => setExpPosition(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="Legal Research Intern"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                      <input
                        type="date"
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-700"
                      />
                    </div>

                    {!expCurrentlyWorking && (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                        <input
                          type="date"
                          value={expEndDate}
                          onChange={(e) => setExpEndDate(e.target.value)}
                          required={!expCurrentlyWorking}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="currentlyWorking"
                      checked={expCurrentlyWorking}
                      onChange={(e) => setExpCurrentlyWorking(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-200 rounded"
                    />
                    <label htmlFor="currentlyWorking" className="text-xs font-bold text-slate-600 select-none">
                      I am currently working in this role
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Responsibilities</label>
                    <textarea
                      value={expDescription}
                      onChange={(e) => setExpDescription(e.target.value)}
                      rows={3}
                      placeholder="Conducted legal research, prepared briefs for trials, drafted summaries for contract compliance..."
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none bg-white leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowExpForm(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving === "experience"}
                      className="px-4 py-2 bg-[#013CF1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow"
                    >
                      {saving === "experience" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Record"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: Educations */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-poppins">Education History</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">List colleges, universities, and upload certificates.</p>
                </div>
                {!showEduForm && (
                  <button
                    onClick={() => {
                      setEditingEduId(null);
                      setEduUniversity("");
                      setEduDegree("");
                      setEduSpecialization("");
                      setEduPassingYear("");
                      setEduCgpa("");
                      setEduCertUrl("");
                      setEduCertFile(null);
                      setShowEduForm(true);
                    }}
                    className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Education
                  </button>
                )}
              </div>

              {!showEduForm ? (
                <div className="space-y-4 pt-2">
                  {educations.length > 0 ? (
                    educations.map((edu: any) => (
                      <div key={edu.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4 hover:border-slate-200 transition-all">
                        <div className="space-y-1 w-full">
                          <h4 className="text-xs font-black text-slate-800">{edu.degree}</h4>
                          {edu.specialization && (
                            <p className="text-xs font-semibold text-slate-500">{edu.specialization}</p>
                          )}
                          <p className="text-xs font-bold text-[#013CF1]">{edu.university_name}</p>
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[10px] font-bold text-slate-400">
                            <span>Passing Year: {edu.passing_year}</span>
                            {edu.cgpa_percentage && <span>CGPA/Score: {edu.cgpa_percentage}</span>}
                            {edu.certificate_url && (
                              <a
                                href={edu.certificate_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#013CF1] hover:underline"
                              >
                                View Certificate ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleEditEduClick(edu)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteEdu(edu)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 italic text-xs">
                      No educational records added yet. Click "Add Education" to list certificates.
                    </div>
                  )}
                </div>
              ) : (
                /* Education subform editing */
                <form onSubmit={handleAddOrEditEducation} className="space-y-4 bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {editingEduId ? "Edit Education Record" : "Add New Education Record"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">University / College Name</label>
                      <input
                        type="text"
                        value={eduUniversity}
                        onChange={(e) => setEduUniversity(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="National Law School of India University"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree</label>
                      <input
                        type="text"
                        value={eduDegree}
                        onChange={(e) => setEduDegree(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="B.A. LL.B (Hons.)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch / Specialization</label>
                      <input
                        type="text"
                        value={eduSpecialization}
                        onChange={(e) => setEduSpecialization(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="Business Law"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Passing Year</label>
                      <input
                        type="number"
                        value={eduPassingYear}
                        onChange={(e) => setEduPassingYear(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="2025"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={eduCgpa}
                        onChange={(e) => setEduCgpa(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                        placeholder="e.g. 8.4 CGPA or 84%"
                      />
                    </div>
                  </div>

                  {/* Certificate Upload Field */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate Document Upload</label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all select-none">
                        Choose Document File
                        <input
                          type="file"
                          accept="application/pdf, image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEduCertFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[9px] text-slate-400 font-semibold">Accepted formats: PDF, PNG, JPG (Max 5 MB)</span>
                    </div>
                    {eduCertFile && (
                      <p className="text-[10px] text-slate-700 font-bold">
                        📁 Selected File: {eduCertFile.name} ({(eduCertFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {eduCertUrl && !eduCertFile && (
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Existing document uploaded: <a href={eduCertUrl} target="_blank" rel="noreferrer" className="text-[#013CF1] underline">View Certificate</a>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEduForm(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving === "education"}
                      className="px-4 py-2 bg-[#013CF1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow"
                    >
                      {saving === "education" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Record"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: Skills Tags */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-poppins">Skills & Expertise</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Add skills keywords that recruiters look up in search queries.</p>
              </div>

              {/* Skill Input Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  placeholder="e.g. Legal Drafting, Litigation support..."
                  className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                >
                  <PlusCircle size={14} /> Add Skill
                </button>
              </form>

              {/* Skills Tags List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Skills</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.length > 0 ? (
                    skills.map((s: any) => (
                      <span
                        key={s.id}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 group/chip"
                      >
                        <span>{s.skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors select-none"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <div className="text-slate-400 italic text-xs py-2">No skills tags specified yet.</div>
                  )}
                </div>
              </div>

              {/* Suggestions Quick Add */}
              <div className="space-y-2 border-t border-slate-50 pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Legal Skills</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Legal Drafting", "Legal Research", "Negotiation", "Contract Review", "Litigation", "Corporate Compliance"].map(suggested => {
                    // Check if already added
                    const alreadyAdded = skills.some(s => s.skill.toLowerCase() === suggested.toLowerCase());
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={suggested}
                        type="button"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from("candidate_skills")
                              .insert({ profile_id: profile.id, skill: suggested });
                            if (error) throw error;
                            await loadProfileDetails();
                          } catch (err: any) {
                            flashMessage(err.message, "error");
                          }
                        }}
                        className="text-[10px] font-bold text-[#013CF1] bg-blue-50 border border-blue-100 hover:bg-[#013CF1] hover:text-white px-3 py-1.5 rounded-xl transition-all"
                      >
                        + {suggested}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Professional Documents (Resume Upload) */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-poppins">Professional Documents</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Upload resumes and portfolios visible to prospective employers.</p>
              </div>

              <form onSubmit={handleResumeUpload} className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Resume / CV File</label>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Upload your latest CV in PDF format. Relational index mapping automatically replaces any existing resume in storage folder.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer text-xs font-bold text-white bg-black hover:bg-slate-900 px-4 py-2.5 rounded-xl transition-all select-none">
                    Select Resume PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold">Accepted formats: PDF only (Max 5 MB)</span>
                </div>

                {resumeFile && (
                  <p className="text-[10px] text-slate-800 font-bold">
                    📁 Selected File: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}

                {profile?.resume_url && !resumeFile && (
                  <div className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <FileText size={14} className="text-[#013CF1]" />
                      <span>Current CV / Resume</span>
                    </div>
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#013CF1] hover:underline"
                    >
                      View Uploaded Resume ↗
                    </a>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving === "documents" || !resumeFile}
                    className="px-5 py-2.5 bg-[#013CF1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === "documents" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Upload Document"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: Bar Council Details */}
          {activeTab === "verification" && (
            <form onSubmit={handleBarVerificationSave} className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-poppins">Professional Verification</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Add Bar council enrollment info. Verification status defaults to Pending.</p>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                  Verification: Pending
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Bar Council Enrollment Number</label>
                  <input
                    type="text"
                    value={barNumber}
                    onChange={(e) => setBarNumber(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white font-medium"
                    placeholder="e.g. MAH/1234/2025"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">State Bar Council</label>
                  <input
                    type="text"
                    value={barCouncil}
                    onChange={(e) => setBarCouncil(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white font-medium"
                    placeholder="e.g. Bar Council of Maharashtra & Goa"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Year</label>
                  <input
                    type="number"
                    value={barYear}
                    onChange={(e) => setBarYear(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white font-medium"
                    placeholder="e.g. 2025"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tribunal / Court Details</label>
                  <input
                    type="text"
                    value={tribunal}
                    onChange={(e) => setTribunal(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 bg-white font-medium"
                    placeholder="e.g. Bombay High Court"
                  />
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving === "verification"}
                  className="px-5 py-3 bg-[#013CF1] hover:bg-[#012cc4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {saving === "verification" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                  Save Verification
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: Reviews & Recommendations */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-poppins">Reviews & Recommendations</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Feedback and approvals verified by clients or partners.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center py-4">
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                  <Star className="text-amber-500 mx-auto w-6 h-6" />
                  <h4 className="text-xs font-black text-slate-700">Client Reviews</h4>
                  <p className="text-xs text-slate-400 font-semibold">No Reviews Yet</p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                  <Star className="text-amber-500 mx-auto w-6 h-6" />
                  <h4 className="text-xs font-black text-slate-700">Peer Recommendations</h4>
                  <p className="text-xs text-slate-400 font-semibold">No Recommendations Yet</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile portfolio...</p>
      </div>
    }>
      <CandidateProfileContent />
    </Suspense>
  );
}
