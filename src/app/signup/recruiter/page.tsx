"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuthCallbackUrl, redirectAfterLogin, handleSessionMountCheck } from "@/lib/auth";
import GoogleAuthButton from "@/components/common/GoogleAuthButton";
import { convertRecruiterLead } from "@/lib/leadService";
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Scale, 
  Briefcase, 
  Award, 
  BookOpen, 
  Building2, 
  ArrowUpRight 
} from "lucide-react";

function RecruiterAuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");

  // Auth mode state: "signup" or "login"
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mismatchRole, setMismatchRole] = useState<"candidate" | null>(null);

  // Sync mode parameter with authMode state
  useEffect(() => {
    if (queryMode === "login") {
      setAuthMode("login");
    } else if (queryMode === "signup") {
      setAuthMode("signup");
    }
  }, [queryMode]);

  // Clear states on mount
  useEffect(() => {
    setError(null);
    setSuccess(null);
    handleSessionMountCheck(router, setCheckingAuth, "recruiter").then((status) => {
      if (status === "mismatch") {
        // Active session is a candidate — stay on this page, show banner
        setMismatchRole("candidate");
      }
    });
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-brand-text-muted">Checking authentication status...</p>
      </div>
    );
  }

  // Handle email/password sign up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validations
    if (!fullName || !email || !companyName || !designation || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up the user via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "recruiter",
            company_name: companyName,
            designation: designation,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data && data.user) {
        // 2. Create the profile record in profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: "recruiter",
            company_name: companyName,
            designation: designation,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Profile db insert failed:", profileError.message);
        }

        // 3. Convert and link any pre-existing lead for this email
        try {
          await convertRecruiterLead(email, data.user.id);
        } catch (leadErr) {
          console.error("Failed to link recruiter lead during signup:", leadErr);
        }

        setSuccess("Recruiter account created successfully! Redirecting...");
        setTimeout(() => {
          if (data.user && data.session) {
            redirectAfterLogin(data.user, data.session, router, "recruiter");
          } else {
            router.push("/dashboard/recruiter");
          }
        }, 1500);
      } else {
        setSuccess("Success! Please check your email to verify your recruiter account.");
        setLoading(false);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Handle email/password log in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
      } else {
         setSuccess("Success! Welcome back to HAQJobs.");
        setTimeout(() => {
          if (data.user && data.session) {
            redirectAfterLogin(data.user, data.session, router, "recruiter");
          } else {
            router.push("/dashboard/recruiter");
          }
        }, 1500);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Handle Google Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl("recruiter"),
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError("Failed to initiate Google Authentication.");
      setLoading(false);
    }
  };

  const isSignup = authMode === "signup";

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-brand-card">
      
      {/* LEFT COLUMN: Marketing Panel */}
      <div className="lg:col-span-7 bg-brand-bg/50 border-r border-brand-border hidden lg:flex flex-col justify-center items-center p-12 xl:p-16 relative overflow-hidden min-h-screen">
        
        {/* Playful Geometric Grid */}
        <div className="relative w-full max-w-[480px] mb-12 flex justify-center z-10">
          <div className="grid grid-cols-4 gap-4 w-full aspect-square max-w-[420px]">
            
            {/* Square 1: Emerald briefcase block */}
            <div className="bg-emerald-600 rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Briefcase className="text-white w-8 h-8 relative z-10" />
            </div>

            {/* Square 2: Portrait of candidate */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile5.avif" 
                alt="Law Graduate" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 3: Soft Amber Checkered shape */}
            <div className="bg-amber-100 rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <Building2 className="text-amber-600 w-8 h-8" />
            </div>

            {/* Square 4: Portrait of candidate */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile3.avif" 
                alt="Associate Candidate" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 5 & 6 (Col-span 2, Row-span 1): Yellow/Orange block */}
            <div className="col-span-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-card/10 rounded-full translate-x-12 -translate-y-12"></div>
              <div className="bg-brand-card/20 backdrop-blur-sm self-start px-3 py-1 rounded-full text-[10px] font-bold text-amber-950 uppercase tracking-widest">
                Talent Pipeline
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-extrabold text-amber-950 leading-tight">
                  Experienced Lawyers
                </span>
                <Scale className="text-amber-950/80 w-6 h-6" />
              </div>
            </div>

            {/* Square 7: Abstract badge */}
            <div className="bg-brand/10 border border-blue-100 rounded-2xl flex items-center justify-center p-4 shadow-sm group hover:scale-[1.02] transition-transform duration-300">
              <Award className="text-[#B63106] w-8 h-8" />
            </div>

            {/* Square 8: Portrait of professional */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile2.avif" 
                alt="Law Student Profile" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 9: Scale block */}
            <div className="bg-brand rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <Scale className="text-white w-8 h-8" />
            </div>

            {/* Square 10: Portrait */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile1.avif" 
                alt="Candidate Profile" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 11: Indigo block */}
            <div className="bg-indigo-900 rounded-2xl flex flex-col justify-between p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
              <div className="flex justify-between items-start">
                <ArrowUpRight className="text-indigo-200 w-5 h-5" />
                <BookOpen className="text-indigo-200 w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-white uppercase tracking-widest leading-none">
                Recruitment
              </span>
            </div>

            {/* Square 12: Portrait */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile4.avif" 
                alt="Student Profile" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

          </div>
        </div>

        {/* Large Marketing Headline & Subtext */}
        <div className="text-center relative z-10 max-w-lg">
          <h2 className="text-4xl font-black text-brand-text tracking-tight leading-[1.15] font-poppins mb-4">
            Hire Exceptional <br className="hidden xl:inline" />
            Legal Talent.
          </h2>
          <p className="text-sm font-medium text-brand-text-muted max-w-sm mx-auto leading-relaxed">
            Connect with ambitious law students, fresh graduates, and experienced legal professionals from across India.
          </p>
        </div>

        {/* Bottom Wavy Decoration */}
        <div className="absolute bottom-0 right-0 w-80 h-32 bg-gradient-to-tr from-[#B63106]/5 to-transparent rounded-tl-[100%] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-20 bg-gradient-to-br from-amber-400/5 to-transparent rounded-tr-[100%] pointer-events-none"></div>

      </div>

      {/* RIGHT COLUMN: Authentication Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:p-12 xl:p-16 bg-brand-card min-h-screen">
        
        {/* Top Header Logo */}
        <div className="w-full flex justify-between items-center mb-8 lg:mb-0">
          <Link href="/" className="flex items-center">
            <Image className="brightness-0 invert" 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={150} 
              height={39} 
              style={{ width: "150px", height: "auto" }}
              priority 
            />
          </Link>
        </div>

        {/* Center Signup Form */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10 lg:py-0">
          
          <div className="mb-6">
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
              For Recruiters & Firms
            </span>
            <h1 className="text-3xl font-extrabold text-brand-text tracking-tight font-poppins mt-3 mb-2">
              {isSignup ? "Create Recruiter Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-brand-text-muted font-medium">
              {isSignup ? "Start posting jobs and building your legal dream team." : "Log in to access your recruiter dashboard."}
            </p>
          </div>

          {/* Tab Selector Toggle */}
          <div className="flex bg-brand-bg/60 p-1 rounded-xl border border-brand-border mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                isSignup
                  ? "bg-black text-white shadow-sm"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                !isSignup
                  ? "bg-black text-white shadow-sm"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Log In
            </button>
          </div>

          {/* Mismatch Banner — shown when a candidate lands on the recruiter portal */}
          {mismatchRole === "candidate" && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="font-bold mb-1">You're signed in as a Candidate</p>
              <p className="text-amber-700 leading-snug">
                Your active session belongs to a candidate account. You can log in with a different
                recruiter account below, or{" "}
                <Link href="/dashboard" className="underline font-semibold hover:text-amber-900">
                  go to your Candidate Dashboard
                </Link>.
              </p>
            </div>
          )}

          {/* Alert Banners */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 animate-fadeIn">
              <p className="font-semibold">{isSignup ? "Sign Up Failed" : "Login Failed"}</p>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-700 animate-fadeIn">
              <p className="font-semibold">Success</p>
              <p>{success}</p>
            </div>
          )}

          {/* Google Button */}
          <GoogleAuthButton
            label={isSignup ? "Sign up with Google" : "Log in with Google"}
            onClick={handleGoogleAuth}
            disabled={loading}
          />

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <span className="relative px-3 bg-brand-card text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
              {isSignup ? "or Sign up with Email" : "or Log in with Email"}
            </span>
          </div>

          {/* Forms */}
          {isSignup ? (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Partner / HR Manager Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Work Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="companyName" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                    Company / Firm
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="e.g. Khaitan & Co"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                  />
                </div>
                <div>
                  <label htmlFor="designation" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <input
                    id="designation"
                    type="text"
                    placeholder="e.g. HR Partner"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-secondary transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-secondary transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4 min-h-[46px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Recruiter Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="loginEmail" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="loginPassword" className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#B63106] hover:underline font-semibold transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-secondary transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-5 min-h-[46px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
              </button>
            </form>
          )}

          {/* Alternative Role Switcher */}
          <div className="mt-5 text-center text-sm font-medium text-brand-text-muted">
            Are you looking for legal jobs instead?{" "}
            <Link 
              href={authMode === "login" ? "/signup/candidate?mode=login" : "/signup/candidate"} 
              className="text-[#B63106] hover:underline font-semibold transition-all"
            >
              {authMode === "login" ? "Log in as Candidate" : "Join as Candidate"}
            </Link>
          </div>
          
          {/* Internal mode switcher links */}
          <div className="mt-3 text-center text-sm font-medium text-brand-text-muted">
            {isSignup ? (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-brand-text hover:underline font-semibold transition-all cursor-pointer bg-transparent border-none p-0"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New to HAQJobs?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="text-brand-text hover:underline font-semibold transition-all cursor-pointer bg-transparent border-none p-0"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

        </div>

        {/* Bottom footer text (Desktop only) */}
        <div className="hidden lg:block text-xs text-brand-text-muted font-medium mt-8">
          &copy; {new Date().getFullYear()} HAQJobs. All rights reserved.
        </div>
      </div>

    </div>
  );
}

export default function RecruiterSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-brand-text-muted">Loading recruiter authentication...</p>
      </div>
    }>
      <RecruiterAuthComponent />
    </Suspense>
  );
}
