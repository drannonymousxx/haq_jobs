"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut, setAuthCookies } from "@/lib/auth";
import { Loader2, LogOut, Briefcase, MessageSquare, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          if (isMounted) router.push("/login");
          return;
        }

        // Keep cookies in sync
        setAuthCookies(session);
        if (isMounted) setUser(session.user);

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
            if (isMounted) router.push("/dashboard");
            return;
          }
          if (isMounted) setProfile(userProfile);
        } else {
          // Fallback to auth metadata role check
          const metaRole = session.user.user_metadata?.role;
          if (metaRole && metaRole !== "recruiter") {
            if (isMounted) router.push("/dashboard");
            return;
          }
          
          // Read-only state fallback for missing profile (no DB mutation)
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Recruiter User";
          if (isMounted) {
            setProfile({
              id: session.user.id,
              full_name: fullName,
              email: session.user.email || "",
              role: "recruiter",
              company_name: session.user.user_metadata?.company_name || null,
              designation: session.user.user_metadata?.designation || null,
            });
          }
        }
        
        if (isMounted) setLoading(false);
      } catch (err) {
        console.error("Recruiter layout initialization failed:", err);
        if (isMounted) router.push("/login");
      }
    }

    checkAuthAndRole();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      } else if (session) {
        setAuthCookies(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await signOut(router);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-brand-text-muted">Securing recruiter session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg/50 flex flex-col">
      {/* Recruiter Shared Topbar Header */}
      <header className="bg-brand-card border-b border-brand-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/dashboard/recruiter" className="flex items-center">
            <Image 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={130} 
              height={34} 
              style={{ width: "130px", height: "auto" }}
              className="brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop Controls (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
            
            {/* Recruiter Panel Badge */}
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider select-none">
              Recruiter Panel
            </span>

            {/* Navigation links */}
            <Link 
              href="/dashboard/recruiter/jobs" 
              className="text-xs font-bold text-brand-text-muted hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <Briefcase size={14} />
              <span>Manage Jobs</span>
            </Link>

            <Link 
              href="/dashboard/messages" 
              className="text-xs font-bold text-brand-text-muted hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              <MessageSquare size={14} />
              <span>Messages</span>
            </Link>

            {/* Sign Out Action */}
            <button
              onClick={handleSignOut}
              className="text-brand-text-muted hover:text-red-600 p-2 rounded-lg hover:bg-brand-bg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

          {/* Mobile Menu Trigger Button (visible only on mobile) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-brand-text-muted hover:text-amber-600 hover:bg-brand-bg rounded-lg transition-colors cursor-pointer w-10 h-10 flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

        </div>
      </header>

      {/* Mobile Drawer (visible only on mobile when open) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#0B0B0B]/85 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer container */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-brand-card border-l border-brand-border p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between">
                <Image 
                  src="/logofull.png" 
                  alt="HAQJobs Logo" 
                  width={110} 
                  height={28} 
                  style={{ width: "110px", height: "auto" }}
                  className="brightness-0 invert"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-brand-text-muted hover:text-amber-600 hover:bg-brand-bg rounded-lg transition-colors cursor-pointer w-10 h-10 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Recruiter Panel Badge */}
              <div className="pt-2">
                <span className="inline-block text-[10px] font-extrabold text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider select-none">
                  Recruiter Panel
                </span>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-2 pt-4">
                <Link 
                  href="/dashboard/recruiter/jobs" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${
                    pathname === "/dashboard/recruiter/jobs"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "text-brand-text-muted hover:text-amber-600 hover:bg-brand-bg"
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Manage Jobs</span>
                </Link>

                <Link 
                  href="/dashboard/messages" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${
                    pathname === "/dashboard/messages"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "text-brand-text-muted hover:text-amber-600 hover:bg-brand-bg"
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Messages</span>
                </Link>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-brand-border">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Route Pages */}
      <div className="flex-grow w-full flex flex-col">
        {children}
      </div>

    </div>
  );
}
