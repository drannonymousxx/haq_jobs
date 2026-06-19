"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Shield, Save, Briefcase, GraduationCap, MapPin, Award, Loader2 } from "lucide-react";

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (userProfile) {
            setProfile(userProfile);
            setFullName(userProfile.full_name || "");
            // Fallback location
            setLocation(userProfile.company_name || "Kolkata, West Bengal");
          }
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            company_name: location // using company_name column to hold location for candidate
          })
          .eq("id", session.user.id);

        if (error) throw error;
        setMessage("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error("Profile save error:", err);
      setMessage("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Candidate Profile</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Manage your personal details, academic history, and resume uploads.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          message.startsWith("Error") 
            ? "bg-red-50 border-red-100 text-red-700" 
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }`}>
          {message}
        </div>
      )}

      {/* Profile form */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg">
            {fullName.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm font-poppins">{fullName || "User Name"}</h3>
            <p className="text-xs text-slate-400 font-medium">Candidate Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
              <User size={14} className="text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
              <MapPin size={14} className="text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 bg-slate-50 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <Mail size={14} className="text-slate-400 absolute left-3 top-3.5" />
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
            <Shield size={10} /> Contact system admin to change your registered email address.
          </span>
        </div>

        <div className="border-t border-slate-50 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 bg-[#013CF1] hover:bg-[#012cc4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/15"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
