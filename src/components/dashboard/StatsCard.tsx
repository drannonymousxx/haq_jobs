"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  description?: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  iconBgColor = "bg-brand/10",
  iconColor = "text-[#B63106]",
  trend,
  description
}: StatsCardProps) {
  return (
    <div className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
      
      {/* Absolute decorative accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-[#B63106] transition-all duration-300"></div>

      <div className="flex justify-between items-start gap-4">
        
        {/* Metric info */}
        <div className="space-y-1">
          <span className="block text-xs font-bold text-brand-text-muted uppercase tracking-widest select-none">
            {label}
          </span>
          <span className="block text-2xl sm:text-3xl font-black text-brand-text font-poppins leading-none">
            {value}
          </span>
        </div>

        {/* Optional Icon */}
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 select-none ${iconBgColor} ${iconColor}`}>
            <Icon size={18} />
          </div>
        )}

      </div>

      {/* Footer detail (Trend or description) */}
      {(trend || description) && (
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-50 text-xs font-medium text-brand-text-muted">
          {trend && (
            <span className={`flex items-center gap-0.5 font-bold ${trend.isPositive ? "text-emerald-600" : "text-rose-500"}`}>
              {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend.value}
            </span>
          )}
          {description && (
            <span className="truncate">{description}</span>
          )}
        </div>
      )}

    </div>
  );
}
