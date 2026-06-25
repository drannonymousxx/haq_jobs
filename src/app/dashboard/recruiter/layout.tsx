"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, LogOut, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuthAndRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Fetch profiles table row
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile check query error:", profileError.message);
        }

        if (userProfile) {
          if (userProfile.role !== "recruiter") {
            router.push("/dashboard");
            return;
          }
          setProfile(userProfile);
        } else {
          // Fallback to auth metadata role check
          const metaRole = session.user.user_metadata?.role;
          if (metaRole && metaRole !== "recruiter") {
            router.push("/dashboard");
            return;
          }
          
          setProfile({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || "Recruiter User",
            email: session.user.email,
            role: "recruiter"
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Recruiter layout initialization failed:", err);
        router.push("/login");
      }
    }

    checkAuthAndRole();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500">Securing recruiter session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Recruiter Shared Topbar Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
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

          {/* Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Recruiter Panel Badge */}
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider select-none">
              Recruiter Panel
            </span>

            {/* Navigation links */}
            <Link 
              href="/dashboard/recruiter/jobs" 
              className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <Briefcase size={14} />
              <span>Manage Jobs</span>
            </Link>

            {/* Sign Out Action */}
            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* Nested Route Pages */}
      <div className="flex-grow w-full flex flex-col">
        {children}
      </div>

    </div>
  );
}
