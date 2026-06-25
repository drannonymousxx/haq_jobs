"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculateRecruiterStrength } from "@/lib/profileUtils";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Calendar,
  Users,
  Award,
  Save,
  ShieldCheck,
  Loader2,
  Trash2,
  Plus
} from "lucide-react";

// Helper to extract storage path from public URL
function getStoragePathFromUrl(url: string, bucketName: string = "haqjobs"): string | null {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.substring(index + marker.length));
}

function RecruiterProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabQuery = searchParams ? searchParams.get("tab") : null;

  // Active Tab state
  const [activeTab, setActiveTab] = useState(tabQuery || "personal");

  // Page States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // holds tab name being saved
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Recruiter Profile state
  const [profile, setProfile] = useState<any>(null);

  // Strength score
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Basic");

  // Form States - Personal
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState(""); // readonly

  // Form States - Company
  const [firmName, setFirmName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");

  // Form States - Verification
  const [regNumber, setRegNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  // Sync tabQuery with activeTab
  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // Load recruiter profile
  const loadRecruiterProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading recruiter profile:", error.message);
      }

      let profileObj = userProfile;
      if (!profileObj) {
        profileObj = {
          id: userId,
          full_name: session.user.user_metadata?.full_name || "Recruiter User",
          email: session.user.email,
          role: "recruiter"
        };
      }

      setProfile(profileObj);

      // Populate personal info
      setFullName(profileObj.full_name || "");
      setDesignation(profileObj.designation || "");
      setContactNumber(profileObj.contact_number || "");
      setEmail(profileObj.email || "");

      // Populate company info
      setFirmName(profileObj.company_name || "");
      setWebsite(profileObj.company_website || "");
      setLinkedin(profileObj.linkedin_url || "");
      setAddress(profileObj.office_address || "");
      setCity(profileObj.city || "");
      setState(profileObj.state || "");
      setCountry(profileObj.country || "");
      setFoundedYear(profileObj.founded_year ? String(profileObj.founded_year) : "");
      setTeamSize(profileObj.team_size || "");
      setAboutCompany(profileObj.about_company || "");

      // Populate verification info
      setRegNumber(profileObj.company_reg_number || "");
      setGstNumber(profileObj.gst_number || "");
      setEmailDomain(profileObj.official_email_domain || "");

      // Strength calculations
      const strength = calculateRecruiterStrength(profileObj);
      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);

    } catch (err) {
      console.error("Failed to load recruiter profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterProfile();
  }, []);

  const triggerMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  // Safe Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "profile_photo_url" | "firm_logo_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Image only
    if (!file.type.startsWith("image/")) {
      triggerMessage("Please select an image file (JPEG, PNG, etc.)", "error");
      return;
    }

    // Validation: Size Max 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      triggerMessage("Image file must be under 2MB", "error");
      return;
    }

    try {
      setSaving(fieldName);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      const userId = session.user.id;

      // Prepare storage parameters
      const fileExt = file.name.split(".").pop();
      const prefix = fieldName === "profile_photo_url" ? "avatar" : "logo";
      const timestamp = Date.now();
      const storagePath = `profile-images/${userId}/${prefix}-${timestamp}.${fileExt}`;

      // Upload new file first
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("haqjobs")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadErr) {
        throw new Error(`File upload failed: ${uploadErr.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("haqjobs")
        .getPublicUrl(storagePath);

      // Record old url
      const oldUrl = profile[fieldName];

      // Update database reference
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ [fieldName]: publicUrl })
        .eq("id", userId);

      if (dbErr) {
        // If DB update fails, clean up the newly uploaded file to avoid orphan objects
        await supabase.storage.from("haqjobs").remove([storagePath]);
        throw new Error(`Database record update failed: ${dbErr.message}`);
      }

      // Refresh local state and load latest profile info
      const updatedProfile = { ...profile, [fieldName]: publicUrl };
      setProfile(updatedProfile);
      
      const strength = calculateRecruiterStrength(updatedProfile);
      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);

      triggerMessage(fieldName === "profile_photo_url" ? "Profile photo updated!" : "Firm logo updated!", "success");

      // Delete old file from storage only after successful DB update
      if (oldUrl) {
        const oldStoragePath = getStoragePathFromUrl(oldUrl, "haqjobs");
        if (oldStoragePath) {
          await supabase.storage.from("haqjobs").remove([oldStoragePath]);
        }
      }

    } catch (err: any) {
      console.error(err);
      triggerMessage(err.message || "Failed to upload image", "error");
    } finally {
      setSaving(null);
    }
  };

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving("personal");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          designation: designation,
          contact_number: contactNumber
        })
        .eq("id", profile.id);

      if (error) throw error;

      const updatedProfile = { ...profile, full_name: fullName, designation, contact_number: contactNumber };
      setProfile(updatedProfile);

      const strength = calculateRecruiterStrength(updatedProfile);
      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);

      triggerMessage("Personal details saved successfully!", "success");
    } catch (err: any) {
      triggerMessage(err.message || "Failed to save personal info", "error");
    } finally {
      setSaving(null);
    }
  };

  // URL Helper Validation
  const isValidUrl = (urlStr: string): boolean => {
    if (!urlStr) return true;
    try {
      const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
      return url.host.includes(".");
    } catch (e) {
      return false;
    }
  };

  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validate website
    if (website && !isValidUrl(website)) {
      triggerMessage("Please provide a valid company website URL.", "error");
      return;
    }

    // Validate LinkedIn
    if (linkedin && !isValidUrl(linkedin)) {
      triggerMessage("Please provide a valid LinkedIn URL.", "error");
      return;
    }

    setSaving("company");

    const cleanWebsite = website && !website.startsWith("http") ? `https://${website}` : website;
    const cleanLinkedin = linkedin && !linkedin.startsWith("http") ? `https://${linkedin}` : linkedin;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: firmName,
          company_website: cleanWebsite,
          linkedin_url: cleanLinkedin,
          office_address: address,
          city: city,
          state: state,
          country: country,
          founded_year: foundedYear ? parseInt(foundedYear) : null,
          team_size: teamSize,
          about_company: aboutCompany
        })
        .eq("id", profile.id);

      if (error) throw error;

      const updatedProfile = {
        ...profile,
        company_name: firmName,
        company_website: cleanWebsite,
        linkedin_url: cleanLinkedin,
        office_address: address,
        city,
        state,
        country,
        founded_year: foundedYear ? parseInt(foundedYear) : null,
        team_size: teamSize,
        about_company: aboutCompany
      };
      setProfile(updatedProfile);

      const strength = calculateRecruiterStrength(updatedProfile);
      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);

      triggerMessage("Company branding profile saved!", "success");
    } catch (err: any) {
      triggerMessage(err.message || "Failed to save company details", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleVerificationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving("verification");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_reg_number: regNumber,
          gst_number: gstNumber,
          official_email_domain: emailDomain
        })
        .eq("id", profile.id);

      if (error) throw error;

      const updatedProfile = {
        ...profile,
        company_reg_number: regNumber,
        gst_number: gstNumber,
        official_email_domain: emailDomain
      };
      setProfile(updatedProfile);

      const strength = calculateRecruiterStrength(updatedProfile);
      setStrengthScore(strength.score);
      setStrengthLabel(strength.label);

      triggerMessage("Verification settings updated!", "success");
    } catch (err: any) {
      triggerMessage(err.message || "Failed to save verification info", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold text-slate-500">Loading recruiter profile editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full space-y-8">
      
      {/* Alert Messaging */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-red-50 border-red-100 text-red-800"
        } shadow-sm transition-all duration-300`}>
          {message.text}
        </div>
      )}

      {/* Page Header Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-poppins tracking-tight">Recruiter Profile</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Configure your recruiter identity and company branding parameters.
          </p>
        </div>

        {/* Profile completion tracking */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Branding Strength</span>
              <span className="text-xs font-black text-amber-600">{strengthScore}%</span>
            </div>
            <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: `${strengthScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 border-b md:border-b-0 border-slate-100">
          <button
            onClick={() => handleTabChange("personal")}
            className={`px-4 py-3 text-left rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "personal" 
                ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/30" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <User size={14} /> Personal details
          </button>
          <button
            onClick={() => handleTabChange("company")}
            className={`px-4 py-3 text-left rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "company" 
                ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/30" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Building2 size={14} /> Company Profile
          </button>
          <button
            onClick={() => handleTabChange("verification")}
            className={`px-4 py-3 text-left rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "verification" 
                ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/30" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck size={14} /> Identity Verification
          </button>
        </div>

        {/* Tab Forms Panel */}
        <div className="md:col-span-9">
          
          {/* TAB 1: PERSONAL */}
          {activeTab === "personal" && (
            <form onSubmit={handlePersonalSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
                Personal details
              </h3>

              {/* Photo Upload area */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                {profile?.profile_photo_url ? (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="Recruiter Photo" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || "R"}
                  </div>
                )}
                
                <div className="space-y-1 text-center sm:text-left flex-grow">
                  <h4 className="text-xs font-bold text-slate-800">Recruiter Photo</h4>
                  <p className="text-[10px] text-slate-400 font-medium">JPEG, PNG formats only. Max size 2MB.</p>
                  
                  <div className="pt-2">
                    <label className="text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1">
                      {saving === "profile_photo_url" ? (
                        <>
                          <Loader2 size={10} className="animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Plus size={10} /> Choose Photo
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, "profile_photo_url")} 
                        disabled={!!saving} 
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruiter Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Talent Acquisition Lead"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={!!saving}
                  className="px-5 py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {saving === "personal" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={12} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: COMPANY PROFILE */}
          {activeTab === "company" && (
            <form onSubmit={handleCompanySave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
                Company Details
              </h3>

              {/* Logo Upload area */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                {profile?.firm_logo_url ? (
                  <img 
                    src={profile.firm_logo_url} 
                    alt="Firm Logo" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-xl">
                    <Building2 size={24} />
                  </div>
                )}
                
                <div className="space-y-1 text-center sm:text-left flex-grow">
                  <h4 className="text-xs font-bold text-slate-800">Firm Logo / Brand Display Image</h4>
                  <p className="text-[10px] text-slate-400 font-medium">JPEG, PNG formats only. Max size 2MB.</p>
                  
                  <div className="pt-2">
                    <label className="text-[10px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1">
                      {saving === "firm_logo_url" ? (
                        <>
                          <Loader2 size={10} className="animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Plus size={10} /> Choose Logo
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, "firm_logo_url")} 
                        disabled={!!saving} 
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Firm / Company Name</label>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. www.haqjobs.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                    />
                    <Globe size={13} className="text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LinkedIn Company Page</label>
                  <input
                    type="text"
                    placeholder="e.g. linkedin.com/company/firmname"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Founded Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2018"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  >
                    <option value="">Select Team Size</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Office Address</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Suite 501, Maker Chambers, Nariman Point"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white resize-none"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">About Company</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your firm's practice areas, legacy, and corporate values..."
                    value={aboutCompany}
                    onChange={(e) => setAboutCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white resize-y min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={!!saving}
                  className="px-5 py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {saving === "company" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={12} /> Save Company branding
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: VERIFICATION */}
          {activeTab === "verification" && (
            <form onSubmit={handleVerificationSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
                Identity & Company Verification
              </h3>

              <div className="p-4 bg-amber-50/50 border border-amber-100 text-slate-600 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-amber-800">Verification Policy</p>
                <p className="text-[11px] leading-relaxed font-semibold">
                  Providing a Company Registration number, GST details, or verifying your official corporate email domain will increase your brand status to "Verified Recruiter" and build candidate trust.
                </p>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Registration Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. U12345MH2018PTC123456"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GSTIN details (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official corporate Email Domain (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. firmname.com (exclude @ prefix)"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-xs text-slate-800 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Used to automatically whitelist recruiters joining from the same firm.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={!!saving}
                  className="px-5 py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {saving === "verification" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={12} /> Save Verification info
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}

export default function RecruiterProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile editor...</p>
      </div>
    }>
      <RecruiterProfileContent />
    </Suspense>
  );
}
