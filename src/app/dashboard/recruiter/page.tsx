"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Briefcase, 
  FileText, 
  Award, 
  LogOut, 
  Loader2, 
  Building2, 
  Calendar,
  PlusCircle, 
  Users,
  Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Fetch user profile to verify role
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching recruiter profile:", profileError.message);
        }

        if (userProfile) {
          // If the role is candidate, redirect to candidate dashboard
          if (userProfile.role !== "recruiter") {
            router.push("/dashboard");
            return;
          }
          setProfile(userProfile);
        } else {
          // Fallback to metadata
          const metaRole = session.user.user_metadata?.role;
          if (metaRole && metaRole !== "recruiter") {
            router.push("/dashboard");
            return;
          }
          // Fallback profile state from metadata
          setProfile({
            full_name: session.user.user_metadata?.full_name || "Recruiter User",
            email: session.user.email,
            role: "recruiter",
            company_name: session.user.user_metadata?.company_name || "My Firm",
            designation: session.user.user_metadata?.designation || "Recruiter"
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Dashboard auth check failed:", err);
        router.push("/login");
      }
    }

    checkAuth();
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
        <p className="text-sm font-semibold text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* Dashboard Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={130} 
              height={34} 
              style={{ width: "130px", height: "auto" }}
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

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600 font-black text-2xl">
              {profile?.company_name?.charAt(0).toUpperCase() || "R"}
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-poppins">{profile?.full_name}</h2>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              {profile?.designation} at <span className="text-slate-600 font-bold">{profile?.company_name}</span>
            </p>

            <div className="w-full space-y-3 text-left border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <User size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-700 capitalize">{profile?.role} Account</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700 truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Building2 size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{profile?.company_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">Joined June 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Statistics & Quick Actions */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-50 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
            
            <div className="relative z-10 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-poppins tracking-tight">
                Welcome, {profile?.full_name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-md">
                Find premier legal talent for your firm. Post job openings, internships, and clerkships in minutes.
              </p>
            </div>
            
            <Link 
              href="/post-job"
              className="px-6 py-3 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
            >
              <PlusCircle size={16} /> Post a Job
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Jobs</span>
              <span className="text-3xl font-black text-slate-800 font-poppins mt-2">0</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Applicants</span>
              <span className="text-3xl font-black text-slate-800 font-poppins mt-2">0</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Views</span>
              <span className="text-3xl font-black text-slate-800 font-poppins mt-2">0</span>
            </div>
          </div>

          {/* Quick Action Tiles */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-poppins mb-4">Recruiter Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <Link 
                href="/post-job"
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Post Opportunity</h4>
                  <p className="text-xs text-slate-400 mt-1">Create listings for associate lawyers, law clerks, and student interns.</p>
                </div>
              </Link>

              <Link 
                href="/for-companies"
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#013CF1] flex items-center justify-center flex-shrink-0 group-hover:bg-[#013CF1] group-hover:text-white transition-all">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#013CF1] transition-colors">Manage Candidates</h4>
                  <p className="text-xs text-slate-400 mt-1">Review resumes, applications, and shortlist aspiring lawyers.</p>
                </div>
              </Link>

              <Link 
                href="/pricing"
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Recruiter Pricing</h4>
                  <p className="text-xs text-slate-400 mt-1">Explore job posting limits, premium candidate search filters, and branding.</p>
                </div>
              </Link>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all group flex items-start gap-4 opacity-75">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Search size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Search Law Graduates</h4>
                  <p className="text-xs text-slate-400 mt-1">Directly search candidate profiles by NLU graduation year (Coming soon).</p>
                </div>
              </div>

            </div>
          </div>

        </section>
      </main>

    </div>
  );
}
