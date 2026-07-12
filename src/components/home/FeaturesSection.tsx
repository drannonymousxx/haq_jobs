"use client";

import React from "react";
import { motion } from "framer-motion";
import { WordsPullUpMultiStyle } from "./WordsPullUpMultiStyle";
import { FeatureCard, FeatureCardData } from "./FeatureCard";
const FEATURES: FeatureCardData[] = [
  {
    index: 0,
    number: "",
    title: "Live Legal Hiring Platform",
    description: "",
    checkItems: [],
    visualSlot: (
      <video
        src="/videos/hqhomepage.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    ),
  },
  {
    index: 1,
    number: "01",
    title: "Verified Legal Listings.",
    description: "Every job posting is verified against institutional credentials — zero ghost jobs, zero spam.",
    checkItems: [
      "Employer domain verification before posting",
      "Tier-1 law firm and corporate legal department access",
      "Automated expiry for outdated listings",
      "Curated legal specialization tagging",
    ],
  },
  {
    index: 2,
    number: "02",
    title: "AI Resume Matching.",
    description: "Our domain-specific matching engine surfaces the most relevant candidates for every role.",
    checkItems: [
      "Semantic skill-to-role alignment scoring",
      "Bar council and degree verification integration",
      "Ranked candidate shortlists delivered instantly",
    ],
  },
  {
    index: 3,
    number: "03",
    title: "Recruiter Intelligence.",
    description: "A full-stack ATS built for legal hiring — pipelines, messages, and analytics in one place.",
    checkItems: [
      "Kanban interview pipeline with stage automation",
      "In-platform messaging with structured offer workflows",
      "Hiring velocity and conversion analytics",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-noise relative min-h-screen bg-[#0B0B0B] py-16 md:py-24 lg:py-32"
      aria-label="Platform Features"
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-12 md:mb-16 max-w-3xl">
          <WordsPullUpMultiStyle
            containerClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight"
            segments={[
              {
                text: "Premium legal hiring tools for modern firms.",
                className: "text-white",
              },
              {
                text: "Built for clarity. Powered by intelligence.",
                className: "text-[#CBD5E1]/40",
              },
            ]}
          />
        </div>

        {/* 4-column card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:h-[520px]">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.index} data={feature} cardIndex={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
