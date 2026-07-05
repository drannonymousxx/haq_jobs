'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ScrollProgressProvider, useScrollProgress } from './ScrollProgressContext';
import ScrollImageSequence from './ScrollImageSequence';
import styles from '@/styles/ScrollStoryContainer.module.css';

export interface StorySlideConfig {
  id: string;
  start: number; // 0.0 to 1.0 normalized progress
  end: number;   // 0.0 to 1.0 normalized progress
  layoutType?: 'center' | 'split-left' | 'split-right' | 'full-width';
  animationConfig?: {
    fadeInDuration?: number;     // e.g. 0.05
    fadeOutDuration?: number;    // e.g. 0.05
    translateYDistance?: number; // e.g. 30 (pixels)
  };
  component: React.ReactNode;
  backgroundEffect?: React.ReactNode; // optional overlay effects specifically for this slide
}

interface ScrollStoryContainerProps {
  slides: StorySlideConfig[];
  frameCount?: number;
  frameUrlTemplate: (index: number) => string;
  scrollPlayHeight?: string; // play area (e.g. '600vh')
}

function SectionWrapper({
  slide,
  isMobile,
}: {
  slide: StorySlideConfig;
  isMobile: boolean;
}) {
  const progress = useScrollProgress();
  const { start, end } = slide;

  // If outside the slide range, render nothing to free DOM resource & hover overlaps
  if (progress < start || progress > end) {
    return null;
  }

  const fadeInDuration = slide.animationConfig?.fadeInDuration ?? 0.05;
  const fadeOutDuration = slide.animationConfig?.fadeOutDuration ?? 0.05;
  const translateYDistance = slide.animationConfig?.translateYDistance ?? 30;

  const fadeInEnd = Math.min(end, start + fadeInDuration);
  const fadeOutStart = Math.max(start, end - fadeOutDuration);

  let opacity = 1;
  let translateY = 0;

  if (start !== 0 && progress < fadeInEnd) {
    // Fade in delta
    const ratio = (progress - start) / (fadeInEnd - start || 1);
    opacity = ratio;
    translateY = translateYDistance * (1 - ratio);
  } else if (end !== 1.0 && progress > fadeOutStart) {
    // Fade out delta
    const ratio = (end - progress) / (end - fadeOutStart || 1);
    opacity = ratio;
    translateY = -translateYDistance * (1 - ratio);
  }

  const layout = isMobile ? 'center' : slide.layoutType || 'center';
  const layoutClass = styles[layout] || styles.center;

  return (
    <>
      {slide.backgroundEffect && (
        <div 
          className={styles.backgroundEffectContainer}
          style={{ opacity, pointerEvents: 'none' }}
        >
          {slide.backgroundEffect}
        </div>
      )}
      <div 
        className={`${styles.slideWrapper} ${layoutClass}`}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          pointerEvents: opacity > 0.15 ? 'auto' : 'none',
          willChange: 'transform, opacity',
          transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
        }}
      >
        <div className={styles.sectionInner}>
          {slide.component}
        </div>
      </div>
    </>
  );
}

function StoryLayout({
  slides,
  frameCount = 300,
  frameUrlTemplate,
}: {
  slides: StorySlideConfig[];
  frameCount: number;
  frameUrlTemplate: (index: number) => string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.stickyContainer}>
      {/* Canvas sequence */}
      <ScrollImageSequence 
        frameCount={frameCount} 
        frameUrlTemplate={frameUrlTemplate} 
      />
      {/* General gradient mask */}
      <div className={styles.overlayCanvas} />

      {/* Extensible slide layers */}
      {slides.map((slide) => (
        <SectionWrapper
          key={slide.id}
          slide={slide}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

export default function ScrollStoryContainer({
  slides,
  frameCount = 300,
  frameUrlTemplate,
  scrollPlayHeight = '600vh',
}: ScrollStoryContainerProps) {
  const playContainerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (!mounted) {
    return null;
  }

  // Fallback styling for accessibility focus states
  if (prefersReducedMotion) {
    return (
      <div className={styles.staticLayout}>
        {slides.map((slide) => (
          <div key={slide.id} className={styles.staticSection}>
            {slide.component}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={playContainerRef} 
      className={styles.scrollPlayWrapper} 
      style={{ height: scrollPlayHeight }}
    >
      <ScrollProgressProvider containerRef={playContainerRef}>
        <StoryLayout 
          slides={slides} 
          frameCount={frameCount} 
          frameUrlTemplate={frameUrlTemplate} 
        />
      </ScrollProgressProvider>
    </div>
  );
}
