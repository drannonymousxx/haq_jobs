"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear states on load
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Handle traditional email & password sign in
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        setSuccess("Success! Welcome back to HAQJobs.");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError("Failed to initiate Google Sign In.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-white">
      
      {/* LEFT COLUMN: Authentication Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:p-12 xl:p-16 bg-white min-h-screen">
        
        {/* Top: Logo */}
        <div className="w-full flex justify-between items-center mb-8 lg:mb-0">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={150} 
              height={39} 
              style={{ width: "150px", height: "auto" }}
              priority 
            />
          </Link>
        </div>

        {/* Center: Auth Form */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10 lg:py-0">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#191D20] tracking-tight font-poppins mb-2">
              Login
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Step into your next legal opportunity!
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 animate-fadeIn">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-700 animate-fadeIn">
              <p className="font-semibold">Success</p>
              <p>{success}</p>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38C16.88,16.03,14.77,17.4,12,17.4c-3.14,0-5.8-2.24-6.76-5.26a7.252,7.252,0,0,1,0-4.28C6.2,4.84,8.86,2.6,12,2.6c1.78,0,3.37.64,4.63,1.84l3.12-3.12A11.961,11.961,0,0,0,12,0,11.967,11.967,0,0,0,.76,6.88a11.854,11.854,0,0,0,0,10.24A11.967,11.967,0,0,0,12,24c3.24,0,5.97-1.08,7.96-2.92l-3.07-2.38c-.84.56-1.93.9-3.29.9-2.53,0-4.67-1.71-5.43-4.01a7.218,7.218,0,0,1,0-2.34C8.93,12.91,11.07,11.2,13.6,11.2A5.993,5.993,0,0,1,18.4,13.2l2.95-2.1Z" fill="#ea4335" className="group-hover:opacity-90 transition-opacity" />
              </g>
            </svg>
            <span className="text-sm font-semibold text-slate-700">Log in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-xs font-semibold text-slate-400 uppercase tracking-wider">
              or Login with Email
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#013CF1]/20 focus:border-[#013CF1] placeholder:text-slate-400 bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="#"
                  onClick={() => alert("Password reset functionality is handled through Supabase. Contact admin or check your email verification for details.")}
                  className="text-xs font-semibold text-slate-600 hover:text-[#013CF1] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#013CF1]/20 focus:border-[#013CF1] placeholder:text-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-6 min-h-[46px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Not registered?{" "}
            <Link href="/signup" className="text-[#013CF1] hover:underline font-semibold transition-all">
              Create an Account
            </Link>
          </div>
        </div>

        {/* Bottom footer text (Desktop only) */}
        <div className="hidden lg:block text-xs text-slate-400 font-medium mt-8">
          &copy; {new Date().getFullYear()} HAQJobs. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Marketing Panel */}
      <div className="lg:col-span-7 bg-slate-50/50 border-l border-slate-100 hidden lg:flex flex-col justify-center items-center p-12 xl:p-16 relative overflow-hidden min-h-screen">
        
        {/* Playful Geometric Grid inspired by the reference but Legal & Career themed */}
        <div className="relative w-full max-w-[480px] mb-12 flex justify-center z-10">
          <div className="grid grid-cols-4 gap-4 w-full aspect-square max-w-[420px]">
            
            {/* Square 1: Blue geometric scales pattern */}
            <div className="bg-[#013CF1] rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Scale className="text-white w-8 h-8 relative z-10" />
            </div>

            {/* Square 2: Portrait of female candidate */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile1.avif" 
                alt="Legal Professional" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 3: Soft Amber Checkered shape */}
            <div className="bg-amber-100 rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 border-4 border-dashed border-amber-500 rounded-full animate-[spin_20s_linear_infinite]"></div>
            </div>

            {/* Square 4: Portrait of male candidate */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile2.avif" 
                alt="Law Student" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 5 & 6 (Col-span 2, Row-span 1): Yellow/Orange arch block representation of legal structures */}
            <div className="col-span-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
              <div className="bg-white/20 backdrop-blur-sm self-start px-3 py-1 rounded-full text-[10px] font-bold text-amber-950 uppercase tracking-widest">
                Firm partners
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-extrabold text-amber-950 leading-tight">
                  Tier-1 Law Firms
                </span>
                <Building2 className="text-amber-950/80 w-6 h-6" />
              </div>
            </div>

            {/* Square 7: Abstract Blue star/circle grid */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center p-4 shadow-sm group hover:scale-[1.02] transition-transform duration-300">
              <Award className="text-[#013CF1] w-8 h-8" />
            </div>

            {/* Square 8: Portrait of professional */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile3.avif" 
                alt="Legal Associate" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 9: Briefcase block for Internship opportunities */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center p-4 shadow-sm group hover:scale-[1.02] transition-transform duration-300">
              <Briefcase className="text-emerald-600 w-8 h-8" />
            </div>

            {/* Square 10: Portrait of female law student */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile4.avif" 
                alt="Law Clerk" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Square 11: Indigo Growth block */}
            <div className="bg-indigo-900 rounded-2xl flex flex-col justify-between p-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
              <div className="flex justify-between items-start">
                <ArrowUpRight className="text-indigo-200 w-5 h-5" />
                <BookOpen className="text-indigo-200 w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-white uppercase tracking-widest leading-none">
                Clerkships
              </span>
            </div>

            {/* Square 12: Portrait of candidate */}
            <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/profile/profile5.avif" 
                alt="Corporate Counsel" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

          </div>
        </div>

        {/* Large Marketing Headline & Subtext */}
        <div className="text-center relative z-10 max-w-lg">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.15] font-poppins mb-4">
            Find the legal career <br className="hidden xl:inline" />
            made for you.
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
            Explore premier internships, clerkships, and associate roles at leading law firms and corporate legal departments.
          </p>
        </div>

        {/* Bottom Wavy Shape Overlay */}
        <div className="absolute bottom-0 right-0 w-80 h-32 bg-gradient-to-tr from-[#013CF1]/5 to-transparent rounded-tl-[100%] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-20 bg-gradient-to-br from-amber-400/5 to-transparent rounded-tr-[100%] pointer-events-none"></div>

      </div>

    </div>
  );
}
