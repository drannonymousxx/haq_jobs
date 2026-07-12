'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  // Exclude Navbar on login, signup, dashboards, and candidates detail page
  if (pathname === '/login' || pathname.startsWith('/signup') || pathname.startsWith('/dashboard') || pathname.startsWith('/candidate')) {
    return null;
  }

  const isJobSeekers = pathname.startsWith('/job-seekers');
  const isCompanies = pathname.startsWith('/for-companies') || pathname.startsWith('/customers') || pathname.startsWith('/pricing') || pathname.startsWith('/post-job');

  const defaultNav = [
    { name: 'Discover', href: '/discover' },
    { name: 'For Job Seekers', href: '/job-seekers' },
    { name: 'For Companies', href: '/for-companies' },
  ];

  const jobSeekersNav = [
    { name: 'Overview', href: '/job-seekers' },
    { name: 'Browse Jobs', href: '/job-seekers/jobs' },
    { name: 'Discover', href: '/discover' },
  ];

  const companiesNav = [
    { name: 'Overview', href: '/for-companies' },
    { name: 'Post a Job', href: '/post-job' },
    { name: 'Customers', href: '/customers' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const currentNav = isCompanies ? companiesNav : isJobSeekers ? jobSeekersNav : defaultNav;

  // Resolve responsive Navbar positioning:
  // Absolute overlay on homepage to bleed canvas content underneath; Relative layout on subpages.
  const isHomepage = pathname === '/';
  const headerClass = isHomepage
    ? "absolute top-0 left-0 w-full z-50 bg-transparent border-b-0 shadow-none"
    : "relative z-50 bg-[#0c0c0e]/80 backdrop-blur-lg border-b border-zinc-800 shadow-sm";

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[80px] flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <Image 
            src="/logofull.png" 
            alt="HAQJobs Logo" 
            width={160} 
            height={42} 
            style={{ width: '160px', height: 'auto' }}
            className="object-contain brightness-0 invert" // Monochrome white logo for dark theme
            priority 
          />
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="hidden lg:flex items-center flex-1 justify-center relative gap-x-10 xl:gap-x-12">
          <AnimatePresence mode="popLayout">
            {currentNav.map((item) => {
              const isExactActive = pathname === item.href;

              return (
                <motion.div
                  layout
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="relative flex items-center"
                >
                  <Link
                    href={item.href}
                    className={`text-[15px] font-semibold transition-colors duration-300 ease-in-out whitespace-nowrap px-2 py-2 hover:text-[#B63106] ${
                      isExactActive ? 'text-[#B63106]' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* RIGHT: Spacer to balance logo centering */}
        <div className="hidden lg:block w-[160px] flex-shrink-0" />

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white p-2 flex-shrink-0 cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-[80px]"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-[80px] left-0 right-0 bg-[#0c0c0e] border-b border-zinc-800 shadow-2xl z-50 p-6 flex flex-col gap-4 text-left select-none"
            >
              {currentNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-bold text-white hover:text-[#B63106] transition-colors py-1.5"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-zinc-800 my-2 pt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-bold text-white hover:text-[#B63106] transition-colors py-1.5 text-center bg-zinc-800/40 rounded-xl"
                >
                  Log In
                </Link>
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest block">
                    Register HAQJobs Account
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/signup/candidate"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[11px] font-black uppercase text-center bg-[#B63106]/10 text-[#B63106] py-3.5 rounded-xl block border border-[#B63106]/20 hover:bg-[#B63106]/20"
                    >
                      Candidate
                    </Link>
                    <Link
                      href="/signup/recruiter"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[11px] font-black uppercase text-center bg-zinc-800 text-white py-3.5 rounded-xl block border border-zinc-700 hover:bg-zinc-700"
                    >
                      Recruiter
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
