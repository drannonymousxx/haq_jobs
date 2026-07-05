'use client';

import React from 'react';
import { useScrollProgress } from './ScrollProgressContext';

interface ScrollParallaxProps {
  speed: number; // speed value (e.g., -50 for upward offset, 50 for downward offset)
  direction?: 'x' | 'y';
  range?: [number, number]; // active scroll range where parallax should scale
  className?: string;
  children: React.ReactNode;
}

export default function ScrollParallax({
  speed,
  direction = 'y',
  range = [0, 1],
  className,
  children,
}: ScrollParallaxProps) {
  const progress = useScrollProgress();
  const [start, end] = range;

  // Calculate local progress inside the active range
  const localProgress = Math.max(0, Math.min(1, (progress - start) / (end - start || 1)));

  // Calculate pixel translation offset
  const offset = localProgress * speed;

  const transformStyle = direction === 'y' 
    ? `translateY(${offset}px)` 
    : `translateX(${offset}px)`;

  return (
    <div 
      className={className} 
      style={{ 
        transform: transformStyle,
        transition: 'transform 0.05s ease-out',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}
