"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  Loader2, 
  Copy, 
  Check, 
  Share2, 
  UserPlus, 
  Briefcase, 
  Gift 
} from "lucide-react";

// WhatsApp SVG Icon
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

  // Framer Motion values for interactive 3D card tilt
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  // Springs for smooth 3D rotations
  const rotateX = useSpring(useTransform(cardY, [-0.5, 0.5], [15, -15]), { stiffness: 120, damping: 15 });
  const rotateY = useSpring(useTransform(cardX, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 15 });
  const tiltScale = useSpring(1, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

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
        console.error("Referral details fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const shareMessage = `Hey! I'm using HAQJobs to apply for legal clerkships, courses, and internships. Sign up using my referral link and let's explore opportunities together! \n\nUse Referral Code: ${referralCode}\nReferral Link: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

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
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted font-poppins">Loading your referral portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl font-poppins pb-10">
      
      {/* 3D isometric box animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .boxes-container {
          perspective: 800px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .boxes {
          --size: 26px;
          --duration: 900ms;
          height: calc(var(--size) * 2);
          width: calc(var(--size) * 3);
          position: relative;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          margin-top: calc(var(--size) * 1.5 * -1);
          transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
        }

        .boxes .box {
          width: var(--size);
          height: var(--size);
          top: 0;
          left: 0;
          position: absolute;
          transform-style: preserve-3d;
        }

        .boxes .box:nth-child(1) {
          transform: translate(100%, 0);
          animation: box1 var(--duration) linear infinite;
        }

        .boxes .box:nth-child(2) {
          transform: translate(0, 100%);
          animation: box2 var(--duration) linear infinite;
        }

        .boxes .box:nth-child(3) {
          transform: translate(100%, 100%);
          animation: box3 var(--duration) linear infinite;
        }

        .boxes .box:nth-child(4) {
          transform: translate(200%, 0);
          animation: box4 var(--duration) linear infinite;
        }

        .boxes .box > div {
          --background: #5C8DF6;
          --top: auto;
          --right: auto;
          --bottom: auto;
          --left: auto;
          --translateZ: calc(var(--size) / 2);
          --rotateY: 0deg;
          --rotateX: 0deg;
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--background);
          top: var(--top);
          right: var(--right);
          bottom: var(--bottom);
          left: var(--left);
          transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
        }

        .boxes .box > div:nth-child(1) {
          --top: 0;
          --left: 0;
        }

        .boxes .box > div:nth-child(2) {
          --background: #145af2;
          --right: 0;
          --rotateY: 90deg;
        }

        .boxes .box > div:nth-child(3) {
          --background: #447cf5;
          --rotateX: -90deg;
        }

        .boxes .box > div:nth-child(4) {
          --background: #DBE3F4;
          --top: 0;
          --left: 0;
          --translateZ: calc(var(--size) * 3 * -1);
        }

        @keyframes box1 {
          0%, 50% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(200%, 0);
          }
        }

        @keyframes box2 {
          0% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100%, 0);
          }
        }

        @keyframes box3 {
          0%, 50% {
            transform: translate(100%, 100%);
          }
          100% {
            transform: translate(0, 100%);
          }
        }

        @keyframes box4 {
          0% {
            transform: translate(200%, 0);
          }
          50% {
            transform: translate(200%, 100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }
      ` }} />

      {/* 1. Curved Hero Section */}
      <div 
        className="relative overflow-visible bg-[#B63106] text-white pt-8 pb-20 flex flex-col items-center shadow-lg select-none"
        style={{
          borderBottomLeftRadius: "50% 80px",
          borderBottomRightRadius: "50% 80px"
        }}
      >
        {/* Glow overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-blue-400/25 rounded-full blur-[70px] pointer-events-none" />

        {/* Small Promotional Pill Badge */}
        <div className="z-10 bg-brand-card/10 backdrop-blur-md border border-white/15 px-4.5 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase text-blue-100">
          Limited Time Referral Campaign
        </div>

        {/* Arena containing the Card */}
        <div className="relative w-full max-w-2xl flex items-center justify-center h-[200px] sm:h-[230px] z-10 mt-6 overflow-visible">
          
          {/* Core Interactive Tilted Card with continuous float */}
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 4,
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
              className="w-[300px] h-[175px] sm:w-[360px] sm:h-[205px] bg-gradient-to-tr from-white to-blue-50/95 border border-white rounded-3xl shadow-2xl p-5 flex cursor-pointer select-none text-brand-text relative overflow-hidden"
            >
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-indigo-50/20 pointer-events-none" />

              <div className="flex items-center justify-between w-full h-full relative z-10">
                {/* Left Text Block */}
                <div className="w-[58%] h-full flex flex-col justify-between py-1 text-left" style={{ transform: "translateZ(30px)" }}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-[#B63106] uppercase">Invite Friends</span>
                    <h3 className="text-sm font-black text-brand-text leading-tight">Earn ₹100</h3>
                    <p className="text-[8px] text-brand-text-muted font-bold uppercase tracking-wider">or</p>
                    <h4 className="text-xs font-extrabold text-brand-text-secondary leading-snug">Unlock 1 Month Premium</h4>
                  </div>
                  
                  <div className="pt-2 border-t border-brand-border mt-2">
                    <span className="text-[7px] text-brand-text-muted block font-bold uppercase">Referral Code</span>
                    <span className="text-[10px] font-black tracking-wider text-[#B63106] font-mono">{referralCode}</span>
                  </div>
                </div>

                {/* Right Animation Block */}
                <div className="w-[38%] h-full flex items-center justify-center relative overflow-visible" style={{ transform: "translateZ(50px)" }}>
                  <div className="boxes-container scale-[0.7] sm:scale-[0.8]">
                    <div className="boxes">
                      <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                      <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                      <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                      <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* 2. Concise Content Section */}
      <div className="text-center max-w-xl mx-auto space-y-2 pt-4 px-4 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-brand-text tracking-tight">
          Refer Friends. Earn Rewards.
        </h2>
        <p className="text-xs text-brand-text-muted font-semibold leading-relaxed max-w-md mx-auto">
          Invite your classmates and fellow legal professionals to HAQJobs. When they register and complete their first application, you unlock exclusive referral rewards.
        </p>
      </div>

      {/* 3. Redesigned Typographic Reward Section (No boxes, no icons, clean Linear/Stripe style) */}
      <div className="px-4 py-4 select-none border-y border-slate-50">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-3xl mx-auto text-center">
          
          {/* Reward 1 */}
          <div className="flex-1 space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight leading-none">
              ₹100 Cashback
            </h3>
            <p className="text-xs text-brand-text-muted font-semibold max-w-xs mx-auto leading-relaxed">
              Earn ₹100 directly in your registered UPI/bank account after a successful referral.
            </p>
          </div>

          {/* Divider plus */}
          <div className="text-xl font-light text-slate-300 select-none flex items-center justify-center h-8 w-8 rounded-full border border-brand-border bg-brand-bg/50 shadow-sm flex-shrink-0">
            +
          </div>

          {/* Reward 2 */}
          <div className="flex-1 space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight leading-none">
              1 Month Premium
            </h3>
            <p className="text-xs text-brand-text-muted font-semibold max-w-xs mx-auto leading-relaxed">
              Unlock HAQJobs Premium for one month with premium features and recruiter boosts.
            </p>
          </div>
          
        </div>
      </div>

      {/* 4. Redesigned Connected Timeline (Horizontal onboarding milestone line) */}
      <div className="space-y-6 pt-4 px-4">
        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 max-w-4xl mx-auto py-4">
          
          {/* Timeline connecting line background */}
          <div className="absolute top-[38px] left-[12%] right-[12%] h-[2px] bg-brand-bg hidden md:block z-0" />
          
          {/* Timeline animated line drawing */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            className="absolute top-[38px] left-[12%] right-[12%] h-[2px] bg-[#B63106] origin-left hidden md:block z-0"
          />

          {[
            {
              step: "1",
              title: "Share Referral Link",
              desc: "Copy and share your personal referral link.",
            },
            {
              step: "2",
              title: "Friend Registers",
              desc: "Friend creates a HAQJobs account.",
            },
            {
              step: "3",
              title: "First Application",
              desc: "Friend submits their first legal job application.",
            },
            {
              step: "4",
              title: "Earn Rewards",
              desc: "Receive ₹100 cashback and 1 Month Premium.",
            },
          ].map((item, idx) => {
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 + 0.5 }}
                className="flex-1 flex flex-col items-center text-center gap-3 relative z-10 group"
              >
                {/* Timeline Milestone Circle */}
                <div className="w-11 h-11 rounded-full bg-brand-card border-2 border-brand-border text-brand-text-muted group-hover:border-[#B63106] group-hover:text-[#B63106] flex items-center justify-center font-bold text-xs transition-all shadow-sm relative select-none">
                  {/* Outer active pulse ring */}
                  <div className="absolute inset-0 rounded-full border border-blue-500/0 group-hover:border-blue-500/30 group-hover:scale-125 transition-all duration-300" />
                  <span>{item.step}</span>
                </div>
                
                <div className="space-y-1 px-2 select-none">
                  <h4 className="text-xs font-black text-brand-text group-hover:text-[#B63106] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-brand-text-muted font-semibold leading-relaxed max-w-[170px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. Invite CTA and Clipboard Link details */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between max-w-2xl mx-auto">
        <div className="flex-grow w-full max-w-sm space-y-1">
          <label className="text-[9px] font-extrabold text-brand-text-muted uppercase tracking-widest block pl-1 select-none">
            Invite Link
          </label>
          <div className="w-full flex items-center gap-2 p-1.5 bg-brand-bg border border-slate-150 rounded-xl">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-grow bg-transparent outline-none text-[10px] font-bold text-brand-text-muted pl-2 select-all cursor-text font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer select-none ${
                copied 
                  ? "bg-emerald-500 text-white shadow-sm" 
                  : "bg-slate-200 text-brand-text-secondary hover:bg-slate-300"
              }`}
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleInviteWhatsApp}
          className="w-full sm:w-auto px-6 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md select-none border border-slate-950 uppercase tracking-wider"
        >
          <WhatsAppIcon />
          <span>Invite via WhatsApp</span>
        </button>
      </div>

      {/* 6. Footer */}
      <div className="pt-8 border-t border-brand-border flex justify-center text-[10px] font-bold select-none text-brand-text-muted">
        <span>© 2026 HAQJobs. All rights reserved.</span>
      </div>

    </div>
  );
}
