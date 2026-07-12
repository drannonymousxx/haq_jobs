"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CircleDollarSign, Users, Target } from "lucide-react";
import { FundingRound } from "./types";

interface FundingTimelineProps {
  fundingRounds: FundingRound[];
}

export function FundingTimeline({ fundingRounds }: FundingTimelineProps) {
  const [selectedIndex, setSelectedIndex] = useState(fundingRounds.length - 1); // Select latest by default
  const selectedRound = fundingRounds[selectedIndex];

  if (!fundingRounds || fundingRounds.length === 0) {
    return (
      <div className="text-center py-8 text-brand-text-muted text-sm">
        No funding data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Horizontal Timeline Connector (Desktop/Scrollable Mobile) */}
      <div className="relative py-8 overflow-x-auto no-scrollbar select-none">
        <div className="min-w-[600px] flex items-center justify-between relative px-10">
          {/* Connector Line */}
          <div className="absolute left-10 right-10 h-0.5 bg-brand-border top-1/2 -translate-y-1/2 -z-10" />

          {/* Timeline Nodes */}
          {fundingRounds.map((round, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <div 
                key={round.round}
                className="flex flex-col items-center gap-3 cursor-pointer"
                onClick={() => setSelectedIndex(idx)}
              >
                {/* Interactive Dot Node */}
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <motion.div
                      layoutId="timelineGlow"
                      className="absolute w-8 h-8 rounded-full bg-brand/10 border border-brand/40"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <div className={`w-4 h-4 rounded-full border transition-colors ${
                    isSelected 
                      ? "bg-brand border-brand" 
                      : "bg-brand-surface border-brand-border hover:border-brand/50"
                  }`} />
                </div>

                {/* Node Label */}
                <div className="text-center">
                  <span className={`block text-[13px] font-bold transition-colors ${
                    isSelected ? "text-brand-text" : "text-brand-text-muted"
                  }`}>
                    {round.round}
                  </span>
                  <span className="block text-[10px] font-bold text-brand-text-muted mt-0.5">
                    {round.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Round Detail Panel */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 min-h-[220px] shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRound.round}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Round Summary */}
            <div className="md:col-span-5 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-brand-border pb-6 md:pb-0 md:pr-8">
              <div>
                <span className="text-xs font-black text-brand uppercase tracking-widest block mb-1">
                  Funding Round
                </span>
                <h4 className="text-2xl font-black text-brand-text font-poppins">
                  {selectedRound.round}
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-text-secondary">
                  <Calendar size={18} className="text-brand-text-muted" />
                  <span className="text-sm font-medium">Closed on {selectedRound.date}</span>
                </div>
                <div className="flex items-center gap-3 text-brand-text-secondary">
                  <CircleDollarSign size={18} className="text-brand-text-muted" />
                  <span className="text-sm font-bold text-brand-text">
                    Raised {selectedRound.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Investors & Milestones */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {/* Lead Investors */}
              <div>
                <div className="flex items-center gap-2 text-brand-text-secondary mb-3">
                  <Users size={16} className="text-brand-text-muted" />
                  <span className="text-xs font-bold uppercase tracking-wider">Lead Investors</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedRound.investors.map((inv) => (
                    <span 
                      key={inv}
                      className="bg-brand-card text-brand-text-secondary text-[12px] font-semibold px-3 py-1.5 rounded-full border border-brand-border select-none"
                    >
                      {inv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones Achieved */}
              <div>
                <div className="flex items-center gap-2 text-brand-text-secondary mb-3">
                  <Target size={16} className="text-brand-text-muted" />
                  <span className="text-xs font-bold uppercase tracking-wider">Key Milestones</span>
                </div>
                <ul className="space-y-2.5">
                  {selectedRound.milestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-brand-text-secondary font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-2" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
