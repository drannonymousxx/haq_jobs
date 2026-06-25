"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (pathname === '/login' || pathname.startsWith('/signup') || pathname.startsWith('/dashboard') || pathname.startsWith('/candidate')) {
    return null;
  }
  
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSignupDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const isJobSeekers = pathname.startsWith('/job-seekers');
  const isCompanies = pathname.startsWith('/for-companies') || pathname.startsWith('/customers') || pathname.startsWith('/pricing');

  const defaultNav = [
    { name: 'Discover', href: '/discover' },
    { name: 'For Job Seekers', href: '/job-seekers' },
    { name: 'For Companies', href: '/for-companies' },
  ];

  const jobSeekersNav = [
    { name: 'Discover', href: '/discover' },
    { name: 'Overview', href: '/job-seekers' },
    { name: 'Jobs', href: '/job-seekers/jobs' },
    { name: 'For Companies', href: '/for-companies' },
  ];

  const companiesNav = [
    { name: 'Overview', href: '/for-companies' },
    { name: 'Post a Job', href: '/post-job' },
    { name: 'Customers', href: '/customers' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const currentNav = isCompanies ? companiesNav : isJobSeekers ? jobSeekersNav : defaultNav;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[80px] flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <Image 
            src="/logofull.png" 
            alt="HAQJobs Logo" 
            width={160} 
            height={42} 
            style={{ width: '160px', height: 'auto' }}
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
                    className={`text-[15px] font-medium transition-colors duration-300 ease-in-out whitespace-nowrap px-2 py-2 hover:text-[#013CF1] ${
                      isExactActive ? 'text-[#191D20]' : 'text-[#64748B]'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* RIGHT: Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
          <Link 
            href="/login" 
            className="text-[15px] font-medium text-[#191D20] px-3 py-2 hover:text-[#013CF1] transition-colors duration-300 ease-in-out whitespace-nowrap"
          >
            Log In
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowSignupDropdown(!showSignupDropdown)}
              className="text-[15px] font-medium bg-[#013CF1] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer min-w-[100px]"
            >
              Sign Up
              <ChevronDown size={14} className={`transition-transform duration-200 ${showSignupDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showSignupDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-3 z-50 overflow-hidden"
                >
                  <Link 
                    href="/signup/candidate"
                    onClick={() => setShowSignupDropdown(false)}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#013CF1]/10 transition-colors">
                      <User size={18} className="text-[#013CF1]" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-[#013CF1] transition-colors leading-tight">
                        I'm looking for opportunities
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Find jobs, internships, & clerkships
                      </span>
                    </div>
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <Link 
                    href="/signup/recruiter"
                    onClick={() => setShowSignupDropdown(false)}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                      <Briefcase size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-[#013CF1] transition-colors leading-tight">
                        I'm hiring legal talent
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Post opportunities & recruit professionals
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-[#191D20] p-2 flex-shrink-0">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
