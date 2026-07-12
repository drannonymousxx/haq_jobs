"use client";

import React from "react";
import Image from "next/image";

const PARTNER_LOGOS = [
  { name: "AZB & Partners", src: "/logos/AZB.png" },
  { name: "Argus Partners", src: "/logos/Arguspartners.png" },
  { name: "Cyril Amarchand Mangaldas", src: "/logos/Cyril.png" },
  { name: "DSK Legal", src: "/logos/DSK.png" },
  { name: "Economic Laws Practice", src: "/logos/ELP.png" },
  { name: "Khaitan & Co", src: "/logos/Khaitan.png" },
  { name: "Trilegal", src: "/logos/Trilegal.png" },
  { name: "Linklaters", src: "/logos/linklaters.png" },
];

export function PlatformTicker() {
  // Triple the list to ensure there is plenty of overflow coverage on ultra-wide screens
  const doubledLogos = [...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <div className="relative w-full py-10 overflow-hidden border-t border-[#2A2A2A]/40 bg-[#0B0B0B]/80 backdrop-blur-sm">
      {/* CSS Keyframes styled inline to ensure cross-environment performance without tailwind.config overrides */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-infinite {
          animation: marquee 35s linear infinite;
        }
      `}</style>

      {/* Left opacity mask */}
      <div className="absolute top-0 bottom-0 left-0 w-20 md:w-32 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10 pointer-events-none" />

      {/* Right opacity mask */}
      <div className="absolute top-0 bottom-0 right-0 w-20 md:w-32 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10 pointer-events-none" />

      {/* Ticker Row */}
      <div className="flex w-full overflow-hidden">
        <div className="flex gap-16 md:gap-24 w-max items-center animate-marquee-infinite">
          {doubledLogos.map((logo, idx) => (
            <div 
              key={`${logo.name}-${idx}`} 
              className="flex-shrink-0 flex items-center justify-center grayscale opacity-30 hover:opacity-80 hover:grayscale-0 transition-all duration-300 duration-500 cursor-pointer"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={120}
                height={35}
                style={{ width: "auto", height: "30px" }}
                className="object-contain brightness-0 invert" // Make logos monochromatic matching the dark premium SaaS aesthetic
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
