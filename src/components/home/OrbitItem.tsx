"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface OrbitItemProps {
  src: string;
  name: string;
  radius: number;
  angle: number;
  orbitDuration: number;
  reverse?: boolean;
  floatDuration?: number;
  floatDelay?: number;
  entranceDelay?: number;
  size?: number;
  glowIntensity?: number;
}

export function OrbitItem({
  src,
  name,
  radius,
  angle,
  orbitDuration,
  reverse = false,
  floatDuration = 3,
  floatDelay = 0,
  entranceDelay = 0,
  size = 48,
  glowIntensity = 0.4,
}: OrbitItemProps) {
  // Convert angle in degrees to x and y pixel offsets from center
  const rad = (angle * Math.PI) / 180;
  const calculatedX = radius * Math.cos(rad);
  const calculatedY = radius * Math.sin(rad);
  const x = Math.round(calculatedX * 100) / 100;
  const y = Math.round(calculatedY * 100) / 100;

  // Construct positive/negative calc expressions to avoid double negatives
  const translateX = x >= 0 ? `calc(-50% + ${x}px)` : `calc(-50% - ${Math.abs(x)}px)`;
  const translateY = y >= 0 ? `calc(-50% + ${y}px)` : `calc(-50% - ${Math.abs(y)}px)`;

  // Entrance variants: fade, scale (0.3 -> 1), blur-to-sharp, premium easing
  const entranceVariants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // cubic-bezier(0.22, 1, 0.36, 1)
        delay: entranceDelay,
      },
    },
  };

  // Orbit rotation values
  const startRotation = reverse ? 360 : 0;
  const endRotation = reverse ? 0 : 360;

  // Counter-rotation values to keep items upright
  const startCounterRotation = reverse ? -360 : 0;
  const endCounterRotation = reverse ? 0 : -360;

  return (
    // 1. Positioner at calculated angle and radius
    <div
      className="absolute top-1/2 left-1/2 z-30"
      style={{
        transform: `translate(${translateX}, ${translateY})`,
      }}
    >
      {/* 2. Entrance Scale, Fade, and Blur */}
      <motion.div
        variants={entranceVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 3. Orbit Rotation Sync (matches parent ring duration and direction in reverse to keep it upright) */}
        <motion.div
          animate={{ rotate: [startCounterRotation, endCounterRotation] }}
          transition={{
            repeat: Infinity,
            duration: orbitDuration,
            ease: "linear",
          }}
        >
          {/* 4. Independent Floating Motion (vertical drift) */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: floatDelay,
            }}
          >
            {/* 5. Actual Interactive Visual Asset */}
            <motion.div
              whileHover={{
                scale: 1.15,
                boxShadow: `0 0 25px rgba(217, 72, 15, ${glowIntensity + 0.2})`,
                borderColor: "rgba(217, 72, 15, 0.6)",
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="rounded-full bg-[#121212]/95 border border-[#2A2A2A] flex items-center justify-center p-2 cursor-pointer shadow-lg backdrop-blur-md"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: `0 0 15px rgba(217, 72, 15, ${glowIntensity})`,
                borderColor: "rgba(2A, 2A, 2A, 0.8)",
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt={name}
                  fill
                  sizes={`${size}px`}
                  className="object-contain p-0.5 filter drop-shadow-[0_2px_8px_rgba(217,72,15,0.25)]"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
