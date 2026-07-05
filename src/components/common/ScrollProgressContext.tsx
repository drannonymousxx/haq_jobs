'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ScrollProgressContext = createContext<number>(0);

export function useScrollProgress() {
  return useContext(ScrollProgressContext);
}

interface ScrollProgressProviderProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function ScrollProgressProvider({ containerRef, children }: ScrollProgressProviderProps) {
  const [progress, setProgress] = useState<number>(0);
  const tickScheduled = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (tickScheduled.current) return;
      tickScheduled.current = true;

      requestAnimationFrame(() => {
        tickScheduled.current = false;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollY = -rect.top;
        const totalHeight = rect.height - window.innerHeight;

        // Normalized scroll progress
        const computedProgress = Math.max(0, Math.min(1, scrollY / (totalHeight || 1)));
        setProgress(computedProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial trigger

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  return (
    <ScrollProgressContext.Provider value={progress}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
