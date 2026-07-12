"use client";

import { useEffect, useState } from "react";

/**
 * A custom hook to animate a numeric counter from 0 to a target value.
 * Employs a premium easeOutQuint curve to match the motion design.
 */
export function useCountUp(target: number, duration: number = 2) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Premium easeOutQuint easing curve: 1 - (1 - x)^5
      const easeProgress = 1 - Math.pow(1 - progress, 5);
      
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return count;
}
