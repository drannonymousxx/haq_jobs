"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Clock, TrendingUp, MessageSquare,
  CheckCircle2, Users, ChevronRight,
} from "lucide-react";
import {
  staggerContainerVariants,
  listItemVariants,
  EASE_OUT_EXPO,
} from "@/lib/animations";

// ─── Data Configuration ───────────────────────────────────────────────────────

export const ACTIVE_JOBS = [
  { id: "j1", title: "Corporate Counsel", company: "Apex Chambers", location: "Mumbai", type: "Full-time", daysLeft: 4, urgency: "high" },
  { id: "j2", title: "Legal Research Analyst", company: "LexTech Pvt.", location: "Remote", type: "Contract", daysLeft: 11, urgency: "medium" },
  { id: "j3", title: "Associate Attorney", company: "Sharma & Partners", location: "Delhi", type: "Full-time", daysLeft: 6, urgency: "high" },
];

export const CANDIDATE_CARDS = [
  { id: "c1", name: "Priya Nair", degree: "LLB, NLSIU '24", score: 94, avatar: "PN", color: "bg-[#D9480F]/20 text-[#D9480F]" },
  { id: "c2", name: "Arjun Mehta", degree: "BA LLB, NLU '23", score: 89, avatar: "AM", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "c3", name: "Sneha Roy", degree: "LLM, ILS '25", score: 91, avatar: "SR", color: "bg-violet-500/20 text-violet-400" },
];

export const HIRING_METRICS = [
  { id: "m1", label: "Active Roles", value: 248, change: "+12%", positive: true },
  { id: "m2", label: "Applicants", value: 1840, change: "+34%", positive: true },
  { id: "m3", label: "Placed This Month", value: 63, change: "+8%", positive: true },
];

export const PIPELINE_STAGES = [
  { id: "p1", label: "Applied", count: 38, color: "bg-brand-border" },
  { id: "p2", label: "Screened", count: 22, color: "bg-[#D9480F]/40" },
  { id: "p3", label: "Interview", count: 11, color: "bg-[#D9480F]/70" },
  { id: "p4", label: "Offered", count: 4, color: "bg-[#D9480F]" },
];

export const MESSAGES = [
  { id: "msg1", from: "Rahul Sharma", preview: "Can we schedule the final round for...", time: "2m ago", unread: true },
  { id: "msg2", from: "Axis Legal", preview: "The offer letter has been sent to...", time: "14m ago", unread: false },
];



// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricChip({ metric, index }: { metric: typeof HIRING_METRICS[0]; index: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = metric.value;
    const step = Math.ceil(target / 40);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 40 + index * 15);
    return () => clearInterval(timer);
  }, [metric.value, index]);

  return (
    <motion.div
      variants={listItemVariants}
      className="flex flex-col gap-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5"
    >
      <span className="text-[10px] font-semibold text-[#CBD5E1]/60 uppercase tracking-wider">{metric.label}</span>
      <div className="flex items-end gap-1.5">
        <span className="text-xl font-black text-white font-poppins">{count.toLocaleString()}</span>
        <span className={`text-[10px] font-bold mb-0.5 ${metric.positive ? "text-emerald-400" : "text-red-400"}`}>
          {metric.change}
        </span>
      </div>
    </motion.div>
  );
}

function JobRow({ job, index }: { job: typeof ACTIVE_JOBS[0]; index: number }) {
  return (
    <motion.div
      variants={listItemVariants}
      className="flex items-center justify-between p-3 rounded-xl border border-[#2A2A2A] bg-[#0E0E0E] hover:border-[#D9480F]/30 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#D9480F]/10 flex items-center justify-center flex-shrink-0">
          <Briefcase size={14} className="text-[#D9480F]" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-white leading-tight">{job.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={9} className="text-[#CBD5E1]/50" />
            <span className="text-[10px] text-[#CBD5E1]/50">{job.location}</span>
            <Clock size={9} className="text-[#CBD5E1]/50 ml-1" />
            <span className="text-[10px] text-[#CBD5E1]/50">{job.daysLeft}d left</span>
          </div>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${job.urgency === "high" ? "bg-[#D9480F] animate-pulse" : "bg-emerald-400"}`} />
    </motion.div>
  );
}

function CandidateRow({ candidate, index }: { candidate: typeof CANDIDATE_CARDS[0]; index: number }) {
  return (
    <motion.div
      variants={listItemVariants}
      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#2A2A2A] bg-[#0E0E0E]"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${candidate.color}`}>
        {candidate.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white truncate">{candidate.name}</p>
        <p className="text-[9px] text-[#CBD5E1]/50 truncate">{candidate.degree}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[11px] font-black text-[#D9480F]">{candidate.score}%</span>
        <span className="text-[9px] text-[#CBD5E1]/40">Match</span>
      </div>
    </motion.div>
  );
}

function PipelineBar({ stage, maxCount }: { stage: typeof PIPELINE_STAGES[0]; maxCount: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-semibold text-[#CBD5E1]/50">{stage.label}</span>
        <span className="text-[9px] font-bold text-white">{stage.count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${stage.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(stage.count / maxCount) * 100}%` }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.4 }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function HeroDashboard() {
  const maxPipeline = Math.max(...PIPELINE_STAGES.map((s) => s.count));

  return (
    <div className="relative w-full h-full select-none pointer-events-none">
      {/* ── Outer card container ── */}
      <motion.div
        className="absolute inset-0 bg-[#121212] border border-[#2A2A2A] rounded-2xl overflow-hidden flex flex-col shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        {/* Header bar */}
        <div className="h-10 border-b border-[#2A2A2A] flex items-center px-4 gap-2 bg-[#0E0E0E] shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A2A2A]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A2A2A]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A2A2A]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D9480F]" />
              <span className="text-[9px] font-semibold text-[#CBD5E1]/60">haqjobs.com/dashboard/recruiter</span>
            </div>
          </div>
          {/* Spacer to keep URL bar centered */}
          <div className="w-[38px] shrink-0" />
        </div>

        {/* Dashboard body */}
        <div className="flex-1 overflow-hidden p-3 grid grid-cols-2 gap-2.5">
          {/* Left column */}
          <div className="flex flex-col gap-2.5 min-w-0">
            {/* Metrics row */}
            <motion.div
              className="grid grid-cols-3 gap-1.5"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {HIRING_METRICS.map((m, i) => (
                <MetricChip key={m.id} metric={m} index={i} />
              ))}
            </motion.div>

            {/* Active Jobs */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Roles</span>
                <span className="text-[9px] text-[#D9480F] font-semibold flex items-center gap-0.5">
                  View all <ChevronRight size={9} />
                </span>
              </div>
              <motion.div
                className="flex flex-col gap-1.5"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {ACTIVE_JOBS.map((job, i) => (
                  <JobRow key={job.id} job={job} index={i} />
                ))}
              </motion.div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Messages</span>
              {MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-[#2A2A2A] bg-[#0E0E0E]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D9480F]/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={12} className="text-[#D9480F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white">{msg.from}</p>
                    <p className="text-[9px] text-[#CBD5E1]/50 truncate">{msg.preview}</p>
                  </div>
                  {msg.unread && <div className="w-1.5 h-1.5 rounded-full bg-[#D9480F] shrink-0 animate-pulse" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2.5 min-w-0">
            {/* Candidate cards */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Top Candidates</span>
                <div className="flex items-center gap-1 text-[9px] text-[#CBD5E1]/50">
                  <Users size={9} />
                  <span>{CANDIDATE_CARDS.length}</span>
                </div>
              </div>
              <motion.div
                className="flex flex-col gap-1.5"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {CANDIDATE_CARDS.map((c, i) => (
                  <CandidateRow key={c.id} candidate={c} index={i} />
                ))}
              </motion.div>
            </div>

            {/* Hiring pipeline */}
            <div className="flex flex-col gap-2 bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl p-3 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} className="text-[#D9480F]" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Pipeline</span>
              </div>
              {PIPELINE_STAGES.map((stage) => (
                <PipelineBar key={stage.id} stage={stage} maxCount={maxPipeline} />
              ))}
            </div>

            {/* AI Match badge — pulse */}
            <motion.div
              className="flex items-center gap-2 bg-[#D9480F]/10 border border-[#D9480F]/25 rounded-xl p-3"
            >
              <CheckCircle2 size={14} className="text-[#D9480F] shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-white">AI Match Active</p>
                <p className="text-[9px] text-[#CBD5E1]/50">3 new high-fit candidates found</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#D9480F] animate-pulse" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
