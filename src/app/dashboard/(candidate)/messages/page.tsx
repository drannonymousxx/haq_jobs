"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapSupabaseError } from "@/lib/errorUtils";
import { 
  Send, 
  User, 
  Loader2, 
  MessageSquare, 
  Search, 
  CheckCheck,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Helper to format message timestamps
const formatTime = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

function CandidateMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRecipientId = searchParams ? searchParams.get("chat") : null;

  // State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"candidate" | "recruiter" | null>(null);
  
  // Conversations list
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Messages List
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Base Auth and Role
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

        // Fetch profile to verify role
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (profile) {
          setUserRole(profile.role);
          await loadConversations(userId, profile.role);
        }
      } catch (err) {
        console.error("Chat initiation error:", err);
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, [router]);

  // Load conversations list from Supabase
  const loadConversations = async (userId: string, role: string) => {
    try {
      // Fetch all messages where user is sender or recipient
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
        const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
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

      // If we have a target recipient ID from URL parameters, ensure they are in the partner IDs list
      if (targetRecipientId && targetRecipientId !== userId) {
        partnerIds.add(targetRecipientId);
      }

      if (partnerIds.size === 0) {
        setConversations([]);
        return;
      }

      // Fetch profile details for all partners
      const { data: partnerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, company_name, designation, profile_photo_url")
        .in("id", Array.from(partnerIds));

      if (partnerProfiles) {
        const list = partnerProfiles.map((p: any) => {
          const lastMsg = lastMsgMap.get(p.id);
          return {
            id: p.id,
            name: p.full_name,
            email: p.email,
            role: p.role,
            company: p.company_name,
            designation: p.designation,
            avatarUrl: p.profile_photo_url,
            lastMessage: lastMsg ? lastMsg.content : "Start a new conversation",
            lastMessageTime: lastMsg ? lastMsg.created_at : null,
            unreadCount: unreadCounts.get(p.id) || 0
          };
        });

        // Sort by last message timestamp (most recent first)
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
          }
        } else if (list.length > 0 && !activeConversationId) {
          setActiveConversationId(list[0].id);
          setActivePartner(list[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  };

  // Poll for messages in active conversation
  useEffect(() => {
    if (!currentUser || !activeConversationId) return;

    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        const { data: dbMessages, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${activeConversationId}),and(sender_id.eq.${activeConversationId},recipient_id.eq.${currentUser.id})`)
          .order("created_at", { ascending: true });

        if (error) throw error;
        
        if (isSubscribed) {
          setMessages(dbMessages || []);
          
          // Mark incoming messages as read
          const unreadIncoming = dbMessages?.filter(m => m.recipient_id === currentUser.id && !m.is_read) || [];
          if (unreadIncoming.length > 0) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .in("id", unreadIncoming.map(m => m.id));
            
            // Decrement local unread list
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
    
    // Set up a simple interval polling fallback for real-time simulation
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
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
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically append message
      if (sentMsg) {
        setMessages(prev => [...prev, sentMsg]);
        
        // Update last message in conversation sidebar
        setConversations(prev => 
          prev.map(c => c.id === activeConversationId 
            ? { ...c, lastMessage: textToSend, lastMessageTime: sentMsg.created_at } 
            : c
          )
        );
      }
    } catch (err) {
      console.error("Message send failure:", err);
      alert("Failed to send message. Please check connection.");
    } finally {
      setSending(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500 font-poppins">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 font-poppins tracking-tight">Messaging</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Direct recruitment conversations and interview communications.
        </p>
      </div>

      {/* Main layout container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[75vh] grid grid-cols-1 md:grid-cols-12">
        
        {/* =========================================================================
            LEFT COLUMN: CHAT SIDEBAR (CONVERSATIONS)
            ========================================================================= */}
        <div className="md:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
          {/* Sidebar Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#013CF1] text-xs bg-white font-medium"
              />
              <Search size={13} className="text-slate-400 absolute left-3 top-3 select-none" />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-50/50">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((partner) => {
                const isSelected = partner.id === activeConversationId;
                return (
                  <button
                    key={partner.id}
                    onClick={() => selectConversation(partner)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50/80 transition-colors text-left relative cursor-pointer ${
                      isSelected ? "bg-slate-100/50" : ""
                    }`}
                  >
                    {/* Active Conversation highlights indicator */}
                    {isSelected && (
                      <span className="w-1 h-12 bg-[#013CF1] rounded-r absolute left-0 top-0.5" />
                    )}

                    {/* Avatar */}
                    {partner.avatarUrl ? (
                      <img 
                        src={partner.avatarUrl} 
                        alt={partner.name} 
                        className="w-9 h-9 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex justify-between items-baseline gap-1.5">
                        <span className="font-bold text-slate-800 text-xs truncate leading-none">
                          {partner.name}
                        </span>
                        {partner.lastMessageTime && (
                          <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                            {new Date(partner.lastMessageTime).toLocaleDateString("default", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-semibold truncate leading-none">
                        {partner.role === "recruiter" 
                          ? `${partner.designation || "HR"} at ${partner.company || "Law Firm"}` 
                          : "Legal Applicant"}
                      </p>

                      <p className={`text-[11px] truncate leading-tight ${
                        partner.unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-400"
                      }`}>
                        {partner.lastMessage}
                      </p>
                    </div>

                    {/* Unread indicator count badge */}
                    {partner.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-[#013CF1] text-white rounded-full flex items-center justify-center text-[9px] font-black absolute right-4 top-8 shadow-sm">
                        {partner.unreadCount}
                      </span>
                    )}

                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                <p>No conversations found.</p>
              </div>
            )}
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: ACTIVE MESSAGE THREAD
            ========================================================================= */}
        <div className="md:col-span-8 flex flex-col h-full bg-white relative">
          {activePartner ? (
            <>
              {/* Header metadata details */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activePartner.avatarUrl ? (
                    <img 
                      src={activePartner.avatarUrl} 
                      alt={activePartner.name} 
                      className="w-10 h-10 rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm flex-shrink-0">
                      {activePartner.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs leading-none">{activePartner.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {activePartner.role === "recruiter" 
                        ? `${activePartner.designation || "HR"} at ${activePartner.company || "Law Firm"}` 
                        : "Legal Professional Applicant"}
                    </p>
                  </div>
                </div>

                {activePartner.role === "candidate" && (
                  <Link
                    href={`/candidate/${activePartner.id}`}
                    className="text-[10px] font-bold text-slate-600 hover:text-[#013CF1] px-3 py-1.5 border border-slate-200 rounded-xl"
                  >
                    View Candidate Profile
                  </Link>
                )}
              </div>

              {/* Message thread bubbles */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3.5 bg-slate-50/20">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOutgoing = msg.sender_id === currentUser.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] space-y-1 flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}>
                          {/* Bubble content */}
                          <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                            isOutgoing 
                              ? "bg-[#013CF1] text-white rounded-tr-none" 
                              : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                          }`}>
                            {msg.content}
                          </div>

                          {/* Time & Read Status */}
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium px-1">
                            <span>{formatTime(msg.created_at)}</span>
                            {isOutgoing && (
                              <CheckCheck size={11} className={msg.is_read ? "text-[#013CF1]" : "text-slate-300"} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium italic">
                    Send a message to start conversation history.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send message text input */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white"
              >
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-grow px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#013CF1] text-xs bg-slate-50/50"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !newMessageText.trim()}
                  className="p-3 bg-[#013CF1] text-white rounded-xl shadow hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#013CF1] flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700 font-poppins">Select a conversation</h4>
                <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                  Select a recruiter or candidate from the side panel to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function CandidateMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#013CF1]" />
        <p className="text-xs font-semibold text-slate-500 font-poppins">Loading inbox components...</p>
      </div>
    }>
      <CandidateMessagesContent />
    </Suspense>
  );
}
