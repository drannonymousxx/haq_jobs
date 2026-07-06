"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import { SYSTEM_USER_ID } from "@/lib/systemAccount";
import { 
  Send, 
  User, 
  Loader2, 
  MessageSquare, 
  Search, 
  CheckCheck,
  Building2,
  Calendar,
  AlertCircle,
  Home,
  Briefcase,
  FileCheck,
  Compass,
  Gift,
  ChevronLeft,
  Paperclip,
  LogOut,
  Bell,
  Check,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Sidebar, { SidebarLink } from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";

// Helper to format timestamps
const formatTime = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

const formatReadTimestamp = (dateStr: string | null): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `Read at ${d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}`;
  } catch (e) {
    return "";
  }
};

function MessagingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRecipientId = searchParams ? searchParams.get("chat") : null;

  // Base Auth & Role States
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<"candidate" | "recruiter" | null>(null);

  // Layout Sidebar State (Candidate only)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Conversations List
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Messages List
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Auth and Initialize system profile + conversations list
  useEffect(() => {
    async function initChat() {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          router.push("/login");
          return;
        }
        
        setCurrentUser(session.user);
        const userId = session.user.id;

        // Fetch current user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role);
          await loadConversations(userId, profile.role);
        } else {
          // Fallback if profiles missing
          const role = session.user.user_metadata?.role || "candidate";
          const fallback = {
            id: userId,
            full_name: session.user.user_metadata?.full_name || "User",
            email: session.user.email,
            role
          };
          setUserProfile(fallback);
          setUserRole(role);
          await loadConversations(userId, role);
        }
      } catch (err) {
        console.error("Chat page init error:", err);
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, [router, targetRecipientId]);

  // Load conversations list
  const loadConversations = async (userId: string, role: string) => {
    try {
      // Fetch all messages involving current user
      const { data: rawMsgs, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Extract unique contact IDs
      const partnerIds = new Set<string>();
      const lastMsgMap = new Map<string, any>();
      const unreadCounts = new Map<string, number>();

      rawMsgs?.forEach((msg: any) => {
        const partnerId = msg.sender_id === userId ? msg.recipient_id : (msg.sender_id || SYSTEM_USER_ID);
        partnerIds.add(partnerId);
        
        // Track the most recent message per partner
        if (!lastMsgMap.has(partnerId)) {
          lastMsgMap.set(partnerId, msg);
        }
        
        // Track unread counts (where user is recipient and message is_read = false)
        if (msg.recipient_id === userId && !msg.is_read) {
          unreadCounts.set(partnerId, (unreadCounts.get(partnerId) || 0) + 1);
        }
      });

      // Always seed System account conversation
      partnerIds.add(SYSTEM_USER_ID);

      // If we have a target recipient ID from URL parameters, ensure they are in the partner IDs list
      if (targetRecipientId && targetRecipientId !== userId) {
        partnerIds.add(targetRecipientId);
      }

      // Fetch profile details for all partners
      const { data: partnerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, company_name, designation, profile_photo_url")
        .in("id", Array.from(partnerIds));

      const profilesMap = new Map<string, any>();
      partnerProfiles?.forEach(p => profilesMap.set(p.id, p));

      // Build consolidated conversation objects list
      const list = Array.from(partnerIds).map((pId) => {
        const p = profilesMap.get(pId);
        const lastMsg = lastMsgMap.get(pId);

        // Fallback or static system values
        if (pId === SYSTEM_USER_ID) {
          return {
            id: SYSTEM_USER_ID,
            name: "HAQJobs System",
            email: "system@haqjobs.hq",
            role: "system",
            company: "HAQJobs HQ",
            designation: "System Administrator",
            avatarUrl: "/logohalf.png",
            lastMessage: lastMsg ? lastMsg.content : "Start a new conversation",
            lastMessageTime: lastMsg ? lastMsg.created_at : null,
            unreadCount: unreadCounts.get(SYSTEM_USER_ID) || 0
          };
        }

        return {
          id: pId,
          name: p?.full_name || "Anonymous User",
          email: p?.email || "",
          role: p?.role || "candidate",
          company: p?.company_name || "",
          designation: p?.designation || "",
          avatarUrl: p?.profile_photo_url || null,
          lastMessage: lastMsg ? lastMsg.content : "Start a new conversation",
          lastMessageTime: lastMsg ? lastMsg.created_at : null,
          unreadCount: unreadCounts.get(pId) || 0
        };
      });

      // Sort conversations by last message timestamp (most recent first)
      list.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(list);

      // Auto-select target recipient or first conversation
      if (targetRecipientId) {
        setActiveConversationId(targetRecipientId);
        const target = list.find(c => c.id === targetRecipientId);
        if (target) {
          setActivePartner(target);
        } else {
          // If profile fetch fails or was slow, create placeholder
          const placeholder = {
            id: targetRecipientId,
            name: "New Conversation",
            role: "candidate",
            lastMessage: "Start typing...",
            unreadCount: 0
          };
          setActivePartner(placeholder);
        }
      } else if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
        setActivePartner(list[0]);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  };

  // Poll for messages in active conversation + subscribe to changes
  useEffect(() => {
    if (!currentUser || !activeConversationId) return;

    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        let dbQuery;
        if (activeConversationId === SYSTEM_USER_ID) {
          dbQuery = supabase
            .from("messages")
            .select("*")
            .is("sender_id", null)
            .eq("recipient_id", currentUser.id);
        } else {
          dbQuery = supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${activeConversationId}),and(sender_id.eq.${activeConversationId},recipient_id.eq.${currentUser.id})`);
        }
        
        const { data: dbMessages, error } = await dbQuery.order("created_at", { ascending: true });

        if (error) throw error;
        
        if (isSubscribed) {
          setMessages(dbMessages || []);
          
          // Mark incoming messages as read and track read timestamp
          const unreadIncoming = dbMessages?.filter(m => m.recipient_id === currentUser.id && !m.is_read) || [];
          if (unreadIncoming.length > 0) {
            await supabase
              .from("messages")
              .update({ 
                is_read: true,
                read_at: new Date().toISOString()
              })
              .in("id", unreadIncoming.map(m => m.id));
            
            // Clear unread badge in conversation sidebar list
            setConversations(prev => 
              prev.map(c => c.id === activeConversationId ? { ...c, unreadCount: 0 } : c)
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
    
    // Polling sync fallback
    const interval = setInterval(fetchMessages, 3000);

    // Supabase Postgres Realtime Subscription for instant updates
    const channel = supabase
      .channel(`room_${activeConversationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchMessages();
          loadConversations(currentUser.id, userRole || "candidate");
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeConversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeConversationId || !newMessageText.trim() || sending) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");
    setSending(true);

    try {
      const { data: sentMsg, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUser.id,
          recipient_id: activeConversationId,
          content: textToSend,
          is_read: false,
          message_type: "text"
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically append message
      if (sentMsg) {
        setMessages(prev => [...prev, sentMsg]);
        
        // Update last message in conversation list sidebar
        setConversations(prev => 
          prev.map(c => c.id === activeConversationId 
            ? { ...c, lastMessage: textToSend, lastMessageTime: sentMsg.created_at } 
            : c
          )
        );
      }
    } catch (err) {
      console.error("Message send failure:", err);
      alert("Failed to send message. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  // Sign out (Recruiter Header bar fallback)
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Switch conversation
  const selectConversation = (partner: any) => {
    setActiveConversationId(partner.id);
    setActivePartner(partner);
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Candidate Layout Sidebar Links
  const candidateLinks: SidebarLink[] = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Applied", href: "/dashboard/applied", icon: FileCheck },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Discover", href: "/dashboard/discover", icon: Compass },
    { name: "Refer a Friend", href: "/dashboard/refer", icon: Gift }
  ];

  // Set search status placeholder for TopNav
  const handleSearchStatusChange = async (newStatus: string) => {
    setUserProfile((prev: any) => prev ? { ...prev, job_search_status: newStatus } : null);
    await supabase.from("profiles").update({ job_search_status: newStatus }).eq("id", currentUser.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#B63106]" />
        <p className="text-sm font-semibold text-brand-text-muted">Loading messaging inbox...</p>
      </div>
    );
  }

  // Visual layout content container
  const renderChatInterface = () => (
    <div className="bg-brand-card rounded-3xl border border-brand-border shadow-sm overflow-hidden h-[75vh] grid grid-cols-1 md:grid-cols-12 font-poppins">
      
      {/* =========================================================================
          LEFT PANEL: CONVERSATIONS LIST
          ========================================================================= */}
      <div className={`md:col-span-4 border-r border-brand-border flex flex-col h-full bg-brand-bg/30 ${
        activeConversationId ? "hidden md:flex" : "flex"
      }`}>
        {/* Search */}
        <div className="p-4 border-b border-brand-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-xl outline-none focus:border-[#B63106] text-xs bg-brand-card font-medium"
            />
            <Search size={13} className="text-brand-text-muted absolute left-3 top-3 select-none" />
          </div>
        </div>

        {/* Conversation Buttons */}
        <div className="flex-grow overflow-y-auto divide-y divide-slate-50/50">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((partner) => {
              const isSelected = partner.id === activeConversationId;
              const isSystem = partner.id === SYSTEM_USER_ID;
              
              return (
                <button
                  key={partner.id}
                  onClick={() => selectConversation(partner)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-brand-bg/80 transition-colors text-left relative cursor-pointer ${
                    isSelected ? "bg-brand-bg/50" : ""
                  }`}
                >
                  {/* Active bar */}
                  {isSelected && (
                    <span className="w-1 h-12 bg-[#B63106] rounded-r absolute left-0 top-0.5" />
                  )}

                  {/* Avatar */}
                  {isSystem ? (
                    <div className="w-9 h-9 rounded-xl bg-brand/10 border border-blue-100 flex items-center justify-center p-1.5 flex-shrink-0">
                      <img src="/logohalf.png" className="w-full h-full object-contain" alt="HAQJobs Logo" />
                    </div>
                  ) : partner.avatarUrl ? (
                    <img 
                      src={partner.avatarUrl} 
                      alt={partner.name} 
                      className="w-9 h-9 rounded-xl object-cover shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center text-xs flex-shrink-0 border border-blue-100">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Meta Details */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline gap-1.5">
                      <span className={`text-xs truncate leading-none ${isSystem ? "font-black text-blue-900" : "font-bold text-brand-text"}`}>
                        {partner.name}
                      </span>
                      {partner.lastMessageTime && (
                        <span className="text-[9px] text-brand-text-muted font-medium whitespace-nowrap">
                          {new Date(partner.lastMessageTime).toLocaleDateString("default", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-brand-text-muted font-bold truncate leading-none">
                      {isSystem 
                        ? "Platform Notifications" 
                        : partner.role === "recruiter" 
                        ? `${partner.designation || "HR"} at ${partner.company || "Law Firm"}` 
                        : "Legal Applicant"}
                    </p>

                    <p className={`text-[11px] truncate leading-tight ${
                      partner.unreadCount > 0 ? "text-brand-text font-extrabold" : "text-brand-text-muted"
                    }`}>
                      {partner.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {partner.unreadCount > 0 && (
                    <span className="w-4 h-4 bg-[#B63106] text-white rounded-full flex items-center justify-center text-[9px] font-black absolute right-4 top-8 shadow-sm">
                      {partner.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-brand-text-muted text-xs font-medium">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: ACTIVE CHAT SECTION
          ========================================================================= */}
      <div className={`md:col-span-8 flex flex-col h-full bg-brand-card relative ${
        !activeConversationId ? "hidden md:flex" : "flex"
      }`}>
        {activePartner ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back button for mobile screens */}
                <button 
                  onClick={() => {
                    setActiveConversationId(null);
                    setActivePartner(null);
                  }}
                  className="p-1 text-brand-text-muted hover:text-brand-text-secondary md:hidden bg-brand-bg rounded-lg cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>

                {activePartner.id === SYSTEM_USER_ID ? (
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-blue-100 flex items-center justify-center p-1.5 flex-shrink-0">
                    <img src="/logohalf.png" className="w-full h-full object-contain" alt="HAQJobs Logo" />
                  </div>
                ) : activePartner.avatarUrl ? (
                  <img 
                    src={activePartner.avatarUrl} 
                    alt={activePartner.name} 
                    className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand font-black flex items-center justify-center text-sm flex-shrink-0 border border-blue-100">
                    {activePartner.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-brand-text text-xs leading-none">
                    {activePartner.name}
                  </h3>
                  <p className="text-[10px] text-brand-text-muted font-bold mt-1">
                    {activePartner.id === SYSTEM_USER_ID
                      ? "Official System Alerts & Platform Communications"
                      : activePartner.role === "recruiter"
                      ? `${activePartner.designation || "HR"} at ${activePartner.company || "Law Firm"}`
                      : "Legal Professional Applicant"}
                  </p>
                </div>
              </div>

              {activePartner.id !== SYSTEM_USER_ID && activePartner.role === "candidate" && (
                <Link
                  href={`/candidate/${activePartner.id}`}
                  className="text-[10px] font-bold text-slate-650 hover:text-[#B63106] px-3 py-1.5 border border-brand-border rounded-xl bg-brand-bg/50 hover:bg-brand-bg transition-colors shadow-sm"
                >
                  View Profile
                </Link>
              )}
            </div>

            {/* Messages body thread */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-bg/20">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isOutgoing = msg.sender_id === currentUser.id;
                  const isSystemMessage = msg.sender_id === SYSTEM_USER_ID || [
                    "system", "interview", "offer", "rejection", "shortlist", "cancelled"
                  ].includes(msg.message_type);

                  if (isSystemMessage) {
                    // Styled visual alert box for system/platform logs
                    return (
                      <div key={msg.id} className="flex justify-center my-2 max-w-2xl mx-auto w-full">
                        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 shadow-sm space-y-2.5 w-full text-brand-text">
                          <div className="flex items-center gap-2 border-b border-blue-100/50 pb-2">
                            <div className="w-5 h-5 rounded-md bg-brand/10 border border-blue-200 flex items-center justify-center p-0.5">
                              <img src="/logohalf.png" className="w-full h-full object-contain" alt="HQ Logo" />
                            </div>
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none">
                              HAQJobs System Notification
                            </span>
                            <span className="text-[9px] text-brand-text-muted font-bold ml-auto leading-none">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {msg.attachment_url && (
                            <div className="pt-1.5 flex">
                              <a 
                                href={msg.attachment_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-card border border-blue-200 rounded-xl text-brand-hover hover:text-blue-800 hover:bg-brand/10 font-bold text-[10px] transition-all shadow-sm"
                              >
                                <Paperclip size={11} />
                                <span>Download Attached File / Document</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Standard Candidate / Recruiter message bubbles
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2.5 items-end ${isOutgoing ? "justify-end" : "justify-start"}`}
                    >
                      {/* Incoming Sender Avatar */}
                      {!isOutgoing && (
                        activePartner.avatarUrl ? (
                          <img 
                            src={activePartner.avatarUrl} 
                            alt={activePartner.name} 
                            className="w-6.5 h-6.5 rounded-lg object-cover border border-brand-border shadow-sm flex-shrink-0 mb-4"
                          />
                        ) : (
                          <div className="w-6.5 h-6.5 rounded-lg bg-brand/10 text-brand font-bold flex items-center justify-center text-[10px] flex-shrink-0 mb-4 border border-blue-100">
                            {activePartner.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}

                      <div className={`max-w-[70%] space-y-1 flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}>
                        {/* Sender details on incoming */}
                        {!isOutgoing && (
                          <span className="text-[9px] font-bold text-brand-text-muted leading-none px-1">
                            {activePartner.name} {activePartner.role === "recruiter" && `• ${activePartner.company}`}
                          </span>
                        )}

                        {/* Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isOutgoing 
                            ? "bg-[#B63106] text-white rounded-tr-none" 
                            : "bg-brand-card text-brand-text border border-brand-border rounded-tl-none"
                        }`}>
                          {msg.content}
                          
                          {/* File Attachment render if exists */}
                          {msg.attachment_url && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <a 
                                href={msg.attachment_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className={`flex items-center gap-1.5 text-[10px] font-bold ${
                                  isOutgoing ? "text-blue-100 hover:text-white" : "text-brand-hover hover:text-blue-800"
                                }`}
                              >
                                <Paperclip size={11} />
                                <span>View Attachment File</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Receipts */}
                        <div className="flex items-center gap-1.5 text-[9px] text-brand-text-muted font-semibold px-1 select-none">
                          <span>{formatTime(msg.created_at)}</span>
                          {isOutgoing && (
                            <div className="flex items-center" title={msg.is_read ? formatReadTimestamp(msg.read_at) : "Sent"}>
                              <CheckCheck size={11} className={msg.is_read ? "text-[#B63106]" : "text-slate-350"} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-brand-text-muted font-medium italic">
                  Send a message to start conversation history.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Input area */}
            {activePartner.id !== SYSTEM_USER_ID ? (
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-brand-border flex items-center gap-3 bg-brand-card"
              >
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-grow px-4 py-3 border border-brand-border rounded-xl outline-none focus:border-[#B63106] text-xs bg-brand-bg/50"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !newMessageText.trim()}
                  className="p-3 bg-[#B63106] text-white rounded-xl shadow hover:bg-brand-hover disabled:opacity-40 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-brand-bg border-t border-slate-150 text-center text-[10px] text-brand-text-muted font-bold uppercase tracking-wider select-none leading-none">
                Replies are disabled in System Notification channels.
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-brand-bg/10">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-blue-100 text-[#B63106] flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-text-secondary font-poppins">Select a conversation</h4>
              <p className="text-xs text-brand-text-muted font-semibold max-w-xs leading-relaxed">
                Select a recruiter or candidate from the side list panel to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );

  // Wrap in matching role layouts
  if (userRole === "candidate") {
    return (
      <div className="h-screen w-full bg-brand-bg/50 flex overflow-hidden">
        <Sidebar 
          links={candidateLinks} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          roleBadgeText="Candidate"
          logoHref="/dashboard"
        />
        <div className="flex-grow flex flex-col h-screen overflow-hidden">
          <TopNav 
            userName={userProfile?.full_name || "User"}
            userEmail={userProfile?.email || ""}
            userAvatarUrl={userProfile?.profile_photo_url || ""}
            searchStatus={userProfile?.job_search_status || "Open to Opportunities"}
            onSearchStatusChange={handleSearchStatusChange}
            onMenuToggle={() => setIsSidebarOpen(true)}
            onSignOut={handleSignOut}
            onSearchClick={() => router.push("/dashboard/jobs?search=open")}
          />
          <main className="flex-grow overflow-hidden p-6 sm:p-8 w-full">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-between">
              {/* Header */}
              <div className="mb-4">
                <h1 className="text-2xl font-black text-brand-text tracking-tight leading-none">Messaging</h1>
                <p className="text-xs text-brand-text-muted font-bold mt-1">
                  Direct recruitment communications and official interview notices.
                </p>
              </div>
              {renderChatInterface()}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Recruiter Layout wrapping
  return (
    <div className="min-h-screen bg-brand-bg/50 flex flex-col">
      <header className="bg-brand-card border-b border-brand-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/recruiter" className="flex items-center">
            <Image className="brightness-0 invert" 
              src="/logofull.png" 
              alt="HAQJobs Logo" 
              width={130} 
              height={34} 
              style={{ width: "130px", height: "auto" }}
              priority
            />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider select-none">
              Recruiter Panel
            </span>
            <Link 
              href="/dashboard/recruiter/jobs" 
              className="text-xs font-bold text-brand-text-muted hover:text-amber-650 transition-colors flex items-center gap-1"
            >
              <Briefcase size={14} />
              <span>Manage Jobs</span>
            </Link>
            <Link 
              href="/dashboard/messages" 
              className="text-xs font-bold text-amber-600 transition-colors flex items-center gap-1"
            >
              <MessageSquare size={14} />
              <span>Messages</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="text-brand-text-muted hover:text-red-600 p-2 rounded-lg hover:bg-brand-bg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8 flex flex-col justify-between overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-brand-text tracking-tight leading-none">Messages Inbox</h1>
          <p className="text-xs text-brand-text-muted font-bold mt-1">
            Connect with applicant candidates and manage interview communication channels.
          </p>
        </div>
        {renderChatInterface()}
      </main>
    </div>
  );
}

export default function SharedMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#B63106]" />
        <p className="text-sm font-semibold text-brand-text-muted">Prerendering chat modules...</p>
      </div>
    }>
      <MessagingContent />
    </Suspense>
  );
}
