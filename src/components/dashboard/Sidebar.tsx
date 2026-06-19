"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface SidebarProps {
  links: SidebarLink[];
  logoHref?: string;
  isOpen?: boolean;
  onClose?: () => void;
  roleBadgeText?: string;
  roleBadgeColorClass?: string;
}

export default function Sidebar({
  links,
  logoHref = "/",
  isOpen = false,
  onClose,
  roleBadgeText,
  roleBadgeColorClass = "bg-blue-50 text-[#013CF1]"
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-100 py-6 px-4">
      <div className="space-y-6">
        {/* Top Header Logo */}
        <div className="flex items-center justify-between px-2">
          <Link href={logoHref} className="flex items-center">
            <Image 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={130} 
              height={34} 
              style={{ width: "130px", height: "auto" }}
              priority
            />
          </Link>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Role Indicator */}
        {roleBadgeText && (
          <div className="px-2">
            <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${roleBadgeColorClass}`}>
              {roleBadgeText}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 pt-4">
          {links.map((link) => {
            // Check if active: exact match or starts with nested routes (except for exact match on base path)
            const isActive = link.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
            
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#013CF1] text-white shadow-sm" 
                    : "text-slate-500 hover:text-[#013CF1] hover:bg-slate-50"
                }`}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-[#013CF1]"
                  }`} 
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Copyright footer */}
      <div className="px-2 text-[10px] font-medium text-slate-400">
        &copy; {new Date().getFullYear()} HAQJobs.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside 
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
