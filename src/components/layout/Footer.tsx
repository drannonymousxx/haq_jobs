"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Audited route exclusions to hide the premium footer on all authenticated/dashboard/workflow pages
  const isExcluded =
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/interview") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  if (isExcluded) {
    return null;
  }

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  const navColumnVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as any },
    },
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#0B0B0B] p-3 sm:p-4 md:p-6 lg:p-8 mt-12 select-none">
      {/* ── Background Video & Contrast Overlays ── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-[#1A1A1A] mx-3 sm:mx-4 md:mx-6 lg:mx-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
        <video
          src="/videos/hqhomepage.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {/* Cinematic shadows/dark overlays for high text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-transparent to-[#0B0B0B]" />
        <div className="absolute inset-0 bg-[#0B0B0B]/70" />
      </div>

      {/* ── Liquid Glass Panel Inner Container ── */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="relative z-10 max-w-7xl mx-auto rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 bg-[#121212]/30 backdrop-blur-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_inset_0_-1px_1px_rgba(255,255,255,0.05),_0_12px_40px_rgba(0,0,0,0.6)] py-12 px-6 sm:px-10 lg:px-16 space-y-16"
      >
        {/* Glow ambient highlight */}
        <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#B63106]/40 to-transparent pointer-events-none" />

        {/* ── Top Section: Brand & Premium CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-12">
          {/* Brand/Logo column */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logofull.png"
                alt="HAQJobs Logo"
                width={150}
                height={40}
                style={{ width: "150px", height: "auto" }}
                className="brightness-0 invert object-contain"
                priority
              />
            </Link>
            <p className="text-[#CBD5E1]/60 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
              Connecting law students, lawyers, law firms, and recruiters through one intelligent legal hiring platform.
            </p>
          </motion.div>

          {/* Premium CTA text and pill buttons */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6 lg:text-right flex flex-col lg:items-end">
            <div className="space-y-2">
              <h3 className="text-white font-poppins text-xl sm:text-2xl lg:text-3xl font-black leading-tight">
                Ready to build your legal career?
              </h3>
              <p className="text-[#CBD5E1]/50 text-xs sm:text-sm font-medium">
                Or ready to hire exceptional legal talent? Join HAQJobs today.
              </p>
            </div>

            {/* Pill buttons aligned with the Hero Section */}
            <div className="flex flex-wrap gap-3 pt-2">
              {/* Explore Jobs */}
              <Link href="/signup/candidate?mode=login" className="group">
                <div className="flex items-center gap-2 bg-[#D9480F] rounded-full pl-5 pr-2 py-2 group-hover:gap-3 transition-all duration-300">
                  <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                    Explore Jobs
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <ArrowRight size={12} className="text-white" />
                  </div>
                </div>
              </Link>

              {/* Hire Talent */}
              <Link href="/signup/recruiter?mode=login" className="group">
                <div className="flex items-center gap-2 border border-white/10 rounded-full pl-5 pr-2 py-2 hover:border-[#D9480F]/40 group-hover:gap-3 transition-all duration-300 bg-white/5 backdrop-blur-sm">
                  <span className="text-white/80 font-bold text-xs sm:text-sm whitespace-nowrap">
                    Hire Talent
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[#D9480F]/40 transition-all duration-300 shrink-0">
                    <ArrowRight size={12} className="text-white/60" />
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Middle Section: Staggered Navigation Columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 border-b border-white/5 pb-12">
          {/* Column 1 — Company */}
          <motion.div variants={navColumnVariants} className="space-y-4">
            <h4 className="text-white font-poppins text-xs font-black uppercase tracking-widest text-[#B63106]">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#CBD5E1]/60">
              <li>
                <Link href="/about" className="hover:text-white transition-colors duration-200">
                  About HAQJobs
                </Link>
              </li>
              <li>
                <Link href="/mission" className="hover:text-white transition-colors duration-200">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 2 — Platform */}
          <motion.div variants={navColumnVariants} className="space-y-4">
            <h4 className="text-white font-poppins text-xs font-black uppercase tracking-widest text-[#B63106]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#CBD5E1]/60">
              <li>
                <Link href="/discover" className="hover:text-white transition-colors duration-200">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/job-seekers/jobs" className="hover:text-white transition-colors duration-200">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/for-companies" className="hover:text-white transition-colors duration-200">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3 — Legal */}
          <motion.div variants={navColumnVariants} className="space-y-4">
            <h4 className="text-white font-poppins text-xs font-black uppercase tracking-widest text-[#B63106]">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#CBD5E1]/60">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors duration-200">
                  Cookie Settings
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white transition-colors duration-200">
                  Accessibility
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4 — Contact Details */}
          <motion.div variants={navColumnVariants} className="space-y-4">
            <h4 className="text-white font-poppins text-xs font-black uppercase tracking-widest text-[#B63106]">
              Get in Touch
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm font-semibold text-[#CBD5E1]/60">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-[#B63106] shrink-0" />
                <span>Bhubaneswar, Odisha</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#B63106] shrink-0" />
                <a href="mailto:yourhaqsetu@gmail.com" className="hover:text-white transition-colors duration-200">
                  yourhaqsetu@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom Section: Copyright & Socials ── */}
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center text-xs font-semibold text-[#CBD5E1]/40">
          <motion.div variants={itemVariants}>
            &copy; {new Date().getFullYear()} HAQJobs. All rights reserved. Built for the legal ecosystem.
          </motion.div>

          {/* Staggered social links */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-[#B63106]/15 hover:border-[#B63106]/30 hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <LinkedinIcon />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-[#B63106]/15 hover:border-[#B63106]/30 hover:text-white transition-all duration-300"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-[#B63106]/15 hover:border-[#B63106]/30 hover:text-white transition-all duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-[#B63106]/15 hover:border-[#B63106]/30 hover:text-white transition-all duration-300"
              aria-label="X (Twitter)"
            >
              <TwitterIcon />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
