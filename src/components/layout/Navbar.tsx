"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname() || '';
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
    { name: 'Post a Job', href: '/for-companies/post-job' },
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
          <Link 
            href="/signup" 
            className="text-[15px] font-medium bg-[#013CF1] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300 whitespace-nowrap flex items-center justify-center min-w-[100px]"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-[#191D20] p-2 flex-shrink-0">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
