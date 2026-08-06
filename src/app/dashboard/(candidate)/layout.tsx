"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut, setAuthCookies } from "@/lib/auth";
import Sidebar, { SidebarLink } from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { 
  Home, 
  User, 
  Briefcase, 
  FileCheck, 
  MessageSquare, 
  Compass, 
  Gift, 
  Loader2,
  Info,
  X
} from "lucide-react";

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showNoticeBanner, setShowNoticeBanner] = useState(false);

  // Check for notice query parameter on mount
  useEffect(() => {
    if (searchParams.get("notice") === "role_redirect") {
      setShowNoticeBanner(true);
      // Clean query parameter from URL bar immediately without reload
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  // Authenticate & Verify Role
  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndRole() {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Dashboard session check timed out after 8000ms")), 8000)
        );

        const authTask = (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || !session.user) return { status: "no_session" as const };

          setAuthCookies(session);

          const { data: userProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile query error:", profileError.message);
          }

          return { status: "ok" as const, session, userProfile };
        })();

        const res = await Promise.race([authTask, timeoutPromise]);

        if (res.status === "no_session") {
          if (isMounted) { setLoading(false); router.replace("/login"); }
          return;
        }

        const { session, userProfile } = res;
        if (isMounted) setUser(session.user);

        if (userProfile) {
          // Recruiter intercept: wrong role for this dashboard
          if (userProfile.role !== "candidate") {
            if (isMounted) { setLoading(false); router.replace("/dashboard/recruiter"); }
            return;
          }
          if (isMounted) setProfile(userProfile);
        } else {
          // Fallback to auth metadata role check
          const metaRole = session.user.user_metadata?.role;
          if (metaRole && metaRole !== "candidate") {
            if (isMounted) { setLoading(false); router.replace("/dashboard/recruiter"); }
            return;
          }
          
          // Read-only state fallback for missing profile (no DB mutation)
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Candidate User";
          if (isMounted) {
            setProfile({
              id: session.user.id,
              full_name: fullName,
              email: session.user.email || "",
              role: "candidate",
              job_search_status: "Open to Opportunities"
            });
          }
        }
        
        if (isMounted) setLoading(false);
      } catch (err) {
        console.error("Layout authorization check failed:", err);
        if (isMounted) { setLoading(false); router.replace("/login?error=timeout"); }
      }
    }

    checkAuthAndRole();

    // Subscribe to auth changes
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

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut(router);
  };

  // Persist Search Status Change in Supabase
  const handleSearchStatusChange = async (newStatus: string) => {
    if (!user) return;
    
    // Update local state first for instant responsiveness
    setProfile((prev: any) => prev ? { ...prev, job_search_status: newStatus } : null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ job_search_status: newStatus })
        .eq("id", user.id);

      if (error) {
        console.error("Failed to update status in Supabase profiles:", error.message);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const candidateLinks: SidebarLink[] = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Applied", href: "/dashboard/applied", icon: FileCheck },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Discover", href: "/dashboard/discover", icon: Compass },
    { name: "Refer a Friend", href: "/dashboard/refer", icon: Gift }
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#B63106]" />
        <p className="text-sm font-semibold text-brand-text-muted">Securing dashboard session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-brand-bg/50 flex overflow-hidden">
      
      {/* Reusable left sidebar */}
      <Sidebar 
        links={candidateLinks} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        roleBadgeText="Candidate"
        logoHref="/dashboard"
      />

      {/* Main dashboard content body */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Reusable top navigation */}
        <TopNav 
          userName={profile?.full_name || "User"}
          userEmail={profile?.email || ""}
          userAvatarUrl={profile?.profile_photo_url || ""}
          searchStatus={profile?.job_search_status || "Open to Opportunities"}
          onSearchStatusChange={handleSearchStatusChange}
          onMenuToggle={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
          onSearchClick={() => router.push("/dashboard/jobs?search=open")}
        />

        {/* Scrollable content wrapper */}
        <main className="flex-grow overflow-y-auto p-6 sm:p-8 w-full">
          <div className="max-w-7xl mx-auto space-y-4">
            {showNoticeBanner && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between text-blue-400 text-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 shrink-0 text-blue-400" />
                  <p className="font-medium">
                    You're registered as a Candidate — redirected directly to your Candidate Dashboard.
                  </p>
                </div>
                <button
                  onClick={() => setShowNoticeBanner(false)}
                  className="p-1 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer text-blue-400"
                  aria-label="Dismiss notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
        
      </div>

    </div>
  );
}
