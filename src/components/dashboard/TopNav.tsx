"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Check,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProfileDropdownOption {
  name: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface TopNavProps {
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;
  searchStatus?: string;
  onSearchStatusChange?: (newStatus: string) => Promise<void> | void;
  onMenuToggle: () => void;
  onSignOut: () => void;
  profileOptions?: ProfileDropdownOption[];
  onSearchClick?: () => void;
}

export default function TopNav({
  userName,
  userEmail,
  userAvatarUrl,
  searchStatus = "Open to Opportunities",
  onSearchStatusChange,
  onMenuToggle,
  onSignOut,
  profileOptions,
  onSearchClick
}: TopNavProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const statusRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("created_at", past24Hours)
          .order("created_at", { ascending: false });
        if (data) {
          setNotifications(data);
        }
      }
    } catch (e) {
      console.error("TopNav notification error:", e);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadNotifications();
    const interval = setInterval(loadNotifications, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (!error) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (statusRef.current && !statusRef.current.contains(target)) {
        setShowStatusDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchStatusOptions = [
    { label: "Ready to Interview", value: "Ready to Interview", color: "bg-emerald-500" },
    { label: "Open to Opportunities", value: "Open to Opportunities", color: "bg-brand/100" },
    { label: "Not Looking", value: "Not Looking", color: "bg-slate-400" }
  ];

  const handleStatusSelect = async (statusVal: string) => {
    setShowStatusDropdown(false);
    if (onSearchStatusChange) {
      await onSearchStatusChange(statusVal);
    }
  };

  const defaultProfileOptions: ProfileDropdownOption[] = [
    { name: "View Profile", href: "/dashboard/profile", icon: User },
    { name: "Edit Profile", href: "/dashboard/profile", icon: Settings },
    { name: "Settings", href: "/dashboard/profile", icon: Settings },
    { name: "Notifications", href: "/dashboard/profile", icon: Bell },
    { name: "Help Center", href: "/dashboard/profile", icon: HelpCircle },
  ];

  const actualProfileOptions = profileOptions || defaultProfileOptions;
  const activeStatusColor = searchStatusOptions.find(o => o.value === searchStatus)?.color || "bg-brand/100";

  return (
    <header className="bg-brand-card border-b border-brand-border shadow-sm h-16 w-full sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left section: Hamburger toggler */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-brand-text-muted hover:text-[#B63106] hover:bg-brand-bg transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="hidden sm:inline-block text-xs font-semibold text-brand-text-muted">
          Last updated today
        </span>
      </div>

      {/* Right section: Search, Notification, Status Dropdown, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Search Action */}
        <button
          onClick={onSearchClick}
          className="p-2 rounded-xl text-brand-text-muted hover:text-brand-text-secondary hover:bg-brand-bg transition-colors cursor-pointer"
          title="Search Opportunities"
        >
          <Search size={18} />
        </button>

        {/* Notifications Icon with static popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-brand-text-muted hover:text-brand-text-secondary hover:bg-brand-bg transition-colors relative cursor-pointer"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#B63106] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-brand-border">
                {notifications.length}
              </span>
            )}
          </button>

          {mounted && (
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-brand-card rounded-2xl border border-brand-border shadow-xl p-4 z-50 text-left"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-brand-text font-poppins text-sm">Notifications</h4>
                    {notifications.length > 0 && (
                      <span className="text-[9px] bg-brand/10 text-[#B63106] font-black px-2 py-0.5 rounded-full">
                        {notifications.length} New
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 hover:bg-brand-bg rounded-lg transition-colors text-xs flex justify-between gap-2 items-start border-b border-slate-50 pb-2">
                          <div className="space-y-0.5">
                            <p className="font-bold text-brand-text-secondary leading-tight">{n.title}</p>
                            <p className="text-brand-text-muted text-[10px] leading-relaxed">{n.content}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissNotification(n.id);
                            }}
                            className="p-1 hover:bg-brand-bg rounded text-brand-text-muted hover:text-slate-650 transition-colors"
                          >
                            <Check size={11} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-brand-text-muted font-medium italic text-center py-4">No notifications.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Job Search Status Dropdown */}
        <div className="relative hidden sm:block" ref={statusRef}>
          {mounted ? (
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary transition-colors cursor-pointer"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${activeStatusColor}`} />
              <span>{searchStatus}</span>
              <ChevronDown size={12} className="text-brand-text-muted" />
            </button>
          ) : (
            <div className="w-36 h-8 bg-brand-bg border border-brand-border rounded-xl animate-pulse" />
          )}

          {mounted && (
            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-brand-card rounded-xl border border-brand-border shadow-lg py-1 z-50 text-left"
                >
                  {searchStatusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusSelect(opt.value)}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                      {searchStatus === opt.value && <Check size={12} className="text-[#B63106]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative border-l border-brand-border pl-2 sm:pl-4" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer group"
          >
            {mounted && userAvatarUrl ? (
              <img 
                src={userAvatarUrl} 
                alt={userName} 
                className="w-9 h-9 rounded-full object-cover border border-blue-200/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#B63106]/10 text-[#B63106] border border-blue-200/50 flex items-center justify-center font-bold text-sm group-hover:bg-[#B63106]/20 transition-all">
                {mounted ? (userName?.charAt(0).toUpperCase() || "U") : "U"}
              </div>
            )}
            <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text-secondary transition-colors" />
          </button>

          {mounted && (
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-brand-card rounded-2xl border border-brand-border shadow-xl py-2 z-50 text-left overflow-hidden"
                >
                  {/* User card header */}
                  <div className="px-4 py-3 border-b border-slate-50 bg-brand-bg/20">
                    <p className="text-sm font-bold text-brand-text font-poppins">{userName}</p>
                    {userEmail && <p className="text-[11px] text-brand-text-muted mt-0.5 truncate">{userEmail}</p>}
                  </div>

                  {/* Dropdown links */}
                  <div className="py-1">
                    {actualProfileOptions.map((opt, i) => {
                      const Icon = opt.icon;
                      if (opt.href) {
                        return (
                          <Link
                            key={opt.name + i}
                            href={opt.href}
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-brand-text-secondary hover:bg-brand-bg hover:text-[#B63106] transition-colors"
                          >
                            <Icon size={14} className="text-brand-text-muted" />
                            <span>{opt.name}</span>
                          </Link>
                        );
                      } else if (opt.onClick) {
                        return (
                          <button
                            key={opt.name + i}
                            onClick={() => {
                              opt.onClick?.();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-brand-text-secondary hover:bg-brand-bg hover:text-[#B63106] transition-colors cursor-pointer"
                          >
                            <Icon size={14} className="text-brand-text-muted" />
                            <span>{opt.name}</span>
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Dropdown footer: Sign Out */}
                  <div className="border-t border-slate-50 pt-1 mt-1">
                    <button
                      onClick={() => {
                        onSignOut();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} className="text-red-400" />
                      <span>Log out</span>
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>

    </header>
  );
}
