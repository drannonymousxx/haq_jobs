"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  Loader2, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  UserPlus, 
  Briefcase, 
  Award, 
  DollarSign 
} from "lucide-react";

// Left illustrated arm and open hand SVG
const LeftHand = () => (
  <svg 
    width="160" 
    height="100" 
    viewBox="0 0 160 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-90 transition-transform duration-300 pointer-events-none select-none filter drop-shadow-lg"
  >
    {/* Sleeve / Wrist cuff */}
    <path 
      d="M0 65 L70 60 C80 58, 85 52, 90 48 L90 75 L0 80 Z" 
      fill="url(#sleeveGrad)" 
    />
    {/* Watch Strap Accent */}
    <rect x="72" y="47" width="6" height="24" rx="1" fill="#1E293B" transform="rotate(-5 72 47)" />
    <circle cx="75" cy="59" r="2.5" fill="#60A5FA" />
    
    {/* Wrist and Open Palm */}
    <path 
      d="M86 52 
         C95 48, 102 44, 108 40
         C112 36, 116 38, 115 44
         C114 50, 122 45, 126 40
         C129 36, 133 38, 131 44
         C130 50, 136 46, 140 42
         C143 38, 147 40, 145 46
         C141 54, 146 54, 150 48
         C154 44, 158 46, 154 52
         C145 70, 125 78, 110 76
         C98 75, 90 70, 86 64 Z" 
      fill="#F8FAFC" 
      stroke="#E2E8F0" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    
    {/* Thumb details */}
    <path 
      d="M94 54 C100 52, 106 48, 112 47 C115 46, 116 49, 113 52 C108 58, 100 62, 96 62 Z" 
      fill="#F1F5F9" 
      stroke="#CBD5E1" 
      strokeWidth="1" 
    />
    
    <defs>
      <linearGradient id="sleeveGrad" x1="0" y1="72" x2="75" y2="65" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

// Right illustrated arm and open hand SVG
const RightHand = () => (
  <svg 
    width="160" 
    height="100" 
    viewBox="0 0 160 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-90 transition-transform duration-300 pointer-events-none select-none filter drop-shadow-lg"
  >
    {/* Sleeve / Wrist cuff */}
    <path 
      d="M160 65 L90 60 C80 58, 75 52, 70 48 L70 75 L160 80 Z" 
      fill="url(#sleeveGradRight)" 
    />
    {/* Watch Strap Accent */}
    <rect x="82" y="47" width="6" height="24" rx="1" fill="#1E293B" transform="rotate(5 82 47)" />
    <circle cx="85" cy="59" r="2.5" fill="#60A5FA" />
    
    {/* Wrist and Open Palm */}
    <path 
      d="M74 52 
         C65 48, 58 44, 52 40
         C48 36, 44 38, 45 44
         C46 50, 38 45, 34 40
         C31 36, 27 38, 29 44
         C30 50, 24 46, 20 42
         C17 38, 13 40, 15 46
         C19 54, 14 54, 10 48
         C6 44, 2 46, 6 52
         C15 70, 35 78, 50 76
         C62 75, 70 70, 74 64 Z" 
      fill="#F8FAFC" 
      stroke="#E2E8F0" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    
    {/* Thumb details */}
    <path 
      d="M66 54 C60 52, 54 48, 48 47 C45 46, 44 49, 47 52 C52 58, 60 62, 64 62 Z" 
      fill="#F1F5F9" 
      stroke="#CBD5E1" 
      strokeWidth="1" 
    />
    
    <defs>
      <linearGradient id="sleeveGradRight" x1="160" y1="72" x2="85" y2="65" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

const WhatsAppIcon = () => (
  <svg 
    width="15" 
    height="15" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path d="M12.012 2c-5.506 0-9.97 4.463-9.97 9.97 0 1.919.544 3.714 1.488 5.25l-1.53 4.587 4.708-1.5c1.472.88 3.176 1.385 5.01 1.385 5.506 0 9.97-4.463 9.97-9.97S17.518 2 12.012 2zm6.27 13.914c-.256.726-1.503 1.334-2.072 1.4-.525.06-1.22.096-1.956-.134-2.827-.88-4.665-3.83-4.805-4.02-.14-.19-1.127-1.498-1.127-2.859 0-1.36.711-2.03.966-2.31.256-.28.56-.35.748-.35.187 0 .374.004.536.012.17.008.398-.063.62.477.23.56.787 1.917.854 2.052.068.136.113.294.023.475-.09.18-.135.294-.27.452-.136.158-.287.35-.41.474-.135.136-.277.283-.12.553.158.27.7 1.15 1.502 1.865.803.715 1.48.937 1.752 1.072.27.135.428.113.586-.068.158-.18.68-.79.86-.1.18.18 1.135.536 1.316.626.18.09.3.136.347.215.047.079.047.46-.21.726z" />
  </svg>
);

export default function CandidateReferPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Framer Motion Values for Parallax 3D tilt
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  // Springs for 3D tilt rotations
  const rotateX = useSpring(useTransform(cardY, [-0.5, 0.5], [15, -15]), { stiffness: 120, damping: 15 });
  const rotateY = useSpring(useTransform(cardX, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 15 });
  const tiltScale = useSpring(1, { stiffness: 150, damping: 15 });

  // Handle Resize and Mobile Detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Fetch dynamic user profile data
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Referral page auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate dynamic referral code based on user profile initials and id hash
  const getReferralCode = () => {
    if (!userProfile) return "HAQ2026";
    const namePart = (userProfile.full_name || "MEMBER")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .substring(0, 4);
    const idHash = userProfile.id ? userProfile.id.substring(0, 4).toUpperCase() : "2026";
    return `${namePart}${idHash}`;
  };

  const referralCode = getReferralCode();
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup/candidate?ref=${referralCode}`
    : `https://haqjobs.com/signup/candidate?ref=${referralCode}`;

  const shareMessage = `Hey! I'm using HAQJobs to apply for top legal clerkships, courses, and internship openings. Sign up using my referral link and let's explore opportunities together! \n\nUse Referral Code: ${referralCode}\nReferral Link: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  // Mouse tilt tracking handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    cardX.set(mouseX / width);
    cardY.set(mouseY / height);
    tiltScale.set(1.04);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
    tiltScale.set(1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500 font-poppins">Loading your referral portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl font-poppins pb-10">
      
      {/* 1. Header Row */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins flex items-center gap-2 select-none">
          Refer a Friend
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Share HAQJobs with your law school classmates or legal colleagues and unlock premium perks.
        </p>
      </div>

      {/* 2. Visual Centerpiece: Animated 3D Glass Card + Supporting Hands */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#013CF1] via-blue-700 to-indigo-950 rounded-3xl p-6 sm:p-8 md:p-12 min-h-[380px] md:min-h-[440px] flex flex-col items-center justify-between shadow-lg select-none">
        
        {/* Soft Radial Gradients and Abstract Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-blue-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 right-10 w-[180px] h-[180px] bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-5 left-10 w-[150px] h-[150px] bg-sky-400/10 rounded-full blur-[50px] pointer-events-none" />

        {/* Campaign Label Badge */}
        <div className="text-center space-y-1.5 z-10 max-w-sm">
          <span className="text-[9px] bg-white/10 backdrop-blur-md text-blue-200 border border-white/10 px-3.5 py-1 rounded-full font-black tracking-widest uppercase">
            ⚡ ACTIVE CAMPAIGN
          </span>
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight pt-1">
            Give the Key to Legal Success
          </h2>
        </div>

        {/* Dynamic Card & Hands Arena */}
        <div className="relative w-full flex items-center justify-center h-[210px] sm:h-[240px] z-10 mt-3">
          
          {/* Left Supporting Arm */}
          <div className="absolute left-[-25px] sm:left-2 md:left-12 bottom-0 select-none pointer-events-none hidden xs:block">
            <LeftHand />
          </div>

          {/* Floating Referral Card container */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute z-20"
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={{
                rotateX: isMobile ? 0 : rotateX,
                rotateY: isMobile ? 0 : rotateY,
                scale: tiltScale,
                transformStyle: "preserve-3d",
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-[280px] h-[165px] sm:w-[350px] sm:h-[195px] bg-gradient-to-tr from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col justify-between cursor-pointer select-none text-white relative overflow-hidden"
            >
              {/* Internal card glass reflection details */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/25 via-transparent to-indigo-500/15 pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
                <div>
                  <span className="text-[8px] font-black tracking-widest text-blue-300 uppercase block">REFERRAL PASS</span>
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-tight mt-0.5">HAQJobs Member</h3>
                </div>
                <div className="w-6.5 h-6.5 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
                  <img src="/logohalf.png" className="w-4 h-4 object-contain" alt="HAQ Logo" />
                </div>
              </div>

              {/* Card Middle Info */}
              <div className="space-y-1.5" style={{ transform: "translateZ(50px)" }}>
                <p className="text-[10px] text-white/80 font-semibold leading-relaxed">
                  Earn ₹100 for every classmate who registers and submits their first job application.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] bg-blue-500/30 text-blue-200 border border-blue-400/10 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                    CASHBACK ACTIVE
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end border-t border-white/10 pt-2" style={{ transform: "translateZ(40px)" }}>
                <div>
                  <span className="text-[8px] text-white/40 block font-bold">YOUR REFERRAL CODE</span>
                  <span className="text-xs font-black tracking-wider text-amber-300 font-mono">
                    {referralCode}
                  </span>
                </div>
                <div className="bg-amber-400 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                  ₹100 REWARD
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Supporting Arm */}
          <div className="absolute right-[-25px] sm:right-2 md:right-12 bottom-0 select-none pointer-events-none hidden xs:block">
            <RightHand />
          </div>

        </div>
      </div>

      {/* 3. CTA Action Row (WhatsApp Sharing and Clipboard copy link) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between max-w-2xl mx-auto">
        <div className="flex-grow w-full max-w-sm space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1 select-none">
            Your Personal Invite Link
          </label>
          <div className="w-full flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-150 rounded-xl">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-grow bg-transparent outline-none text-[11px] font-bold text-slate-500 pl-2 select-all cursor-text font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer select-none ${
                copied 
                  ? "bg-emerald-500 text-white shadow-sm" 
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleInviteWhatsApp}
          className="w-full sm:w-auto px-6 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm select-none border border-slate-950 uppercase"
        >
          <WhatsAppIcon />
          <span>Invite via WhatsApp</span>
        </button>
      </div>

      {/* 4. Reward Campaign Cards Grid (Cash vs Premium trial) */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest select-none pl-1">
          Referral Campaign Rewards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reward 1: Cash Reward (Active) */}
          <div className="relative bg-white rounded-3xl border-2 border-emerald-500 shadow-md p-6 flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200 overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[9px] tracking-widest px-3 py-1 rounded-bl-xl uppercase select-none">
              ACTIVE
            </div>

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
              <DollarSign size={20} />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-800">₹100 Cash Reward</h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Earn ₹100 cash reward credited directly to your registered UPI or bank account index for each successful student referral who submits their first internship application.
              </p>
              <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold select-none pt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Primary Campaign Goal Reward</span>
              </div>
            </div>
          </div>

          {/* Reward 2: Premium (Alternate/Upcoming) */}
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200 overflow-hidden opacity-75">
            <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 font-black text-[9px] tracking-widest px-3 py-1 rounded-bl-xl uppercase select-none">
              UPCOMING
            </div>

            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#013CF1] shadow-sm flex-shrink-0">
              <Award size={20} />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-800">One Month HAQJobs Premium</h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Unlock full access to curated mock tests, legal drafting templates, and direct application boosts to recruiter mailboxes for one month.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block pt-1 select-none">
                Unlocked during seasonal law school events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Stepper: How it works */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest select-none pl-1">
          How it works
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "1",
              title: "Share Invite Link",
              desc: "Copy your custom referral link or send invites directly via WhatsApp.",
              icon: Share2,
              bg: "bg-blue-50 text-[#013CF1] border-blue-100",
            },
            {
              step: "2",
              title: "Friend Joins",
              desc: "Your legal classmate registers a candidate account using your link.",
              icon: UserPlus,
              bg: "bg-purple-50 text-purple-750 border-purple-100",
            },
            {
              step: "3",
              title: "First Application",
              desc: "They apply to any legal job or internship role on the platform.",
              icon: Briefcase,
              bg: "bg-amber-50 text-amber-700 border-amber-100",
            },
            {
              step: "4",
              title: "Earn Perks",
              desc: "Unlock ₹100 cash or HAQJobs Premium trial instantly.",
              icon: Gift,
              bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative flex flex-col gap-3 group hover:shadow-md transition-all duration-200"
              >
                <div className={`w-8 h-8 rounded-xl ${item.bg} border flex items-center justify-center font-bold text-xs shadow-sm`}>
                  <IconComponent size={14} />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-[#013CF1] font-black uppercase tracking-wider block">Step {item.step}</span>
                  <h4 className="text-xs font-extrabold text-slate-800">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Minimal Footer */}
      <div className="pt-8 border-t border-slate-100 flex justify-center text-[10px] text-slate-400 font-bold select-none">
        <span>© 2026 HAQJobs. All rights reserved.</span>
      </div>

    </div>
  );
}
