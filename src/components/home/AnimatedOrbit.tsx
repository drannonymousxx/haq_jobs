"use client";

import React from "react";
import { motion } from "framer-motion";
import { OrbitItem } from "./OrbitItem";

// Configure orbit rings and items for full customizability
const ORBIT_CONFIGS = [
  {
    id: 1,
    radius: 110,
    duration: 50,
    reverse: false,
    opacity: 0.12,
    borderStyle: "dashed",
    items: [
      { src: "/Circle/linked.png", name: "LinkedIn", angle: 30, size: 44, floatDelay: 0 },
      { src: "/Circle/whatsapp.png", name: "WhatsApp", angle: 210, size: 44, floatDelay: 1 },
    ],
  },
  {
    id: 2,
    radius: 175,
    duration: 70,
    reverse: true,
    opacity: 0.08,
    borderStyle: "solid",
    items: [
      { src: "/Circle/discord.png", name: "Discord", angle: 90, size: 48, floatDelay: 0.5 },
      { src: "/Circle/instagram.png", name: "Instagram", angle: 270, size: 48, floatDelay: 1.5 },
    ],
  },
  {
    id: 3,
    radius: 240,
    duration: 90,
    reverse: false,
    opacity: 0.1,
    borderStyle: "dashed",
    items: [
      { src: "/Circle/dribbble.png", name: "Dribbble", angle: 150, size: 50, floatDelay: 0.8 },
      { src: "/Circle/thread.png", name: "Thread", angle: 330, size: 50, floatDelay: 2.0 },
    ],
  },
  {
    id: 4,
    radius: 305,
    duration: 110,
    reverse: true,
    opacity: 0.07,
    borderStyle: "solid",
    items: [
      { src: "/Circle/facebook.png", name: "Facebook", angle: 0, size: 54, floatDelay: 0.2 },
      { src: "/Circle/pinterest.png", name: "Pinterest", angle: 120, size: 54, floatDelay: 1.2 },
      { src: "/Circle/soundcloud.png", name: "Soundcloud", angle: 240, size: 54, floatDelay: 2.2 },
    ],
  },
];

export function AnimatedOrbit() {
  return (
    <div className="relative w-[650px] h-[650px] flex items-center justify-center select-none pointer-events-none">
      {/* Dynamic Glow Aura behind the entire orbit visualization */}
      <div 
        className="absolute w-[450px] h-[450px] rounded-full bg-[#D9480F]/5 blur-3xl pointer-events-none" 
        style={{ transform: "translate3d(0, 0, 0)" }}
      />

      {/* Render concentric rings */}
      {ORBIT_CONFIGS.map((orbit) => {
        const ringRotationStart = orbit.reverse ? 360 : 0;
        const ringRotationEnd = orbit.reverse ? 0 : 360;

        return (
          // Rotating Ring container
          <motion.div
            key={orbit.id}
            animate={{ rotate: [ringRotationStart, ringRotationEnd] }}
            transition={{
              repeat: Infinity,
              duration: orbit.duration,
              ease: "linear",
            }}
            className="absolute rounded-full pointer-events-none z-10"
            style={{
              width: `${orbit.radius * 2}px`,
              height: `${orbit.radius * 2}px`,
              borderWidth: "1.2px",
              borderStyle: orbit.borderStyle as any,
              borderColor: `rgba(255, 255, 255, ${orbit.opacity * 2.0})`,
              boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.02), 0 0 8px rgba(255, 255, 255, 0.01)",
            }}
          >
            {/* Render Items assigned to this specific ring */}
            {orbit.items.map((item, idx) => (
              <OrbitItem
                key={`${item.name}-${idx}`}
                src={item.src}
                name={item.name}
                radius={orbit.radius}
                angle={item.angle}
                orbitDuration={orbit.duration}
                reverse={orbit.reverse}
                floatDelay={item.floatDelay}
                floatDuration={3.5 + (orbit.id * 0.3)}
                entranceDelay={0.4 + (orbit.id * 0.15) + (idx * 0.1)}
                size={item.size}
                glowIntensity={0.25 + (orbit.id * 0.03)}
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}
