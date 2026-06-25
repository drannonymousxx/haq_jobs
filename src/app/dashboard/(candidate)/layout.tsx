"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  Loader2 
} from "lucide-react";

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  // Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Authenticate & Verify Role
  useEffect(() => {
    async function checkAuthAndRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Fetch profile
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile query error:", profileError.message);
        }

        if (userProfile) {
          // Recruiter intercept
          if (userProfile.role !== "candidate") {
            router.push("/dashboard/recruiter");
            return;
          }
          setProfile(userProfile);
        } else {
          // Fallback to auth metadata
          const metaRole = session.user.user_metadata?.role;
          if (metaRole && metaRole !== "candidate") {
            router.push("/dashboard/recruiter");
            return;
          }
          
          setProfile({
            full_name: session.user.user_metadata?.full_name || "Candidate User",
            email: session.user.email,
            role: "candidate",
            job_search_status: "Open to Opportunities"
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Layout authorization check failed:", err);
        router.push("/login");
      }
    }

    checkAuthAndRole();
  }, [router]);

  // Handle Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#013CF1]" />
        <p className="text-sm font-semibold text-slate-500">Securing dashboard session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50/50 flex overflow-hidden">
      
      {/* Reusable left sidebar */}
      <Sidebar 
        links={candidateLinks} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        roleBadgeText="Candidate"
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
        />

        {/* Scrollable content wrapper */}
        <main className="flex-grow overflow-y-auto p-6 sm:p-8 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>

    </div>
  );
}
