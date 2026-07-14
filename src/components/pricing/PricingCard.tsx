"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CircleCheck } from "lucide-react";

interface ActionButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
}

interface PricingCardProps {
  name: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  actions: ActionButton[];
  badge?: string;
  badgeStyle?: "coral" | "gold" | "default";
  isFeatured?: boolean;
  className?: string;
}

export default function PricingCard({
  name,
  price,
  priceSuffix,
  description,
  features,
  actions,
  badge,
  badgeStyle = "default",
  isFeatured = false,
  className = "",
}: PricingCardProps) {
  // Map badge styles to clean, premium dark theme color tokens
  const badgeClasses = {
    coral: "bg-brand/10 text-brand border border-brand/30",
    gold: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    default: "bg-brand-border text-brand-text-secondary border border-brand-border/50",
  }[badgeStyle];

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
      className={`relative flex flex-col w-full h-full p-8 md:p-10 rounded-[32px] border bg-brand-card transition-all duration-200 ${
        isFeatured
          ? "border-brand shadow-[0_0_30px_rgba(182,49,6,0.1)] z-10"
          : "border-brand-border shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      } ${className}`}
    >
      {badge && (
        <div className="absolute top-6 right-6">
          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${badgeClasses}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-8">
        <span className="text-[19px] font-bold text-brand-text block mb-6">{name}</span>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[40px] md:text-[48px] font-bold text-brand-text leading-none tracking-tight">
            {price}
          </span>
          {priceSuffix && (
            <span className="text-[15px] font-medium text-brand-text-muted">
              {priceSuffix}
            </span>
          )}
        </div>
        <span className="text-[15px] text-brand-text-secondary leading-relaxed">
          {description}
        </span>
      </div>

      {/* Features List */}
      <div className="flex-1 border-t border-brand-border pt-8 mb-10">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CircleCheck className="w-5 h-5 text-brand shrink-0 mt-[2px]" />
              <span className="text-[15px] text-brand-text leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
        {actions.map((action, i) => (
          <Button
            key={i}
            href={action.href}
            variant={action.variant || "primary"}
            className="w-full text-center"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
