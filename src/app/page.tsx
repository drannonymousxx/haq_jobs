'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import ScrollStoryContainer, { StorySlideConfig } from '@/components/common/ScrollStoryContainer';
import styles from '@/styles/HomeStoryboard.module.css';

// 1. Reveal Slide Component
const RevealSlide = () => (
  <div className={styles.slideContent}>
    <span className={styles.tagline}>A NEW ERA FOR LEGAL SOURCING</span>
    <h1 className={styles.mainTitle}>HAQJobs</h1>
    <p className={styles.subtext}>
      The premium interactive destination for legal talent matching and opportunities discovery.
    </p>
  </div>
);

// 2. Feature / Sourcing Slide Component
const SourcingSlide = () => (
  <div className={styles.slideContent} style={{ textAlign: 'left' }}>
    <span className={styles.tagline}>PREMIER ACCESS</span>
    <h2 className={styles.title}>Unlock Leading Openings</h2>
    <p className={styles.description}>
      Connect directly with Tier-1 law firms, corporate councils, and remote legal clerkships. Manage your portfolio and land matches built specifically for your skills.
    </p>
  </div>
);

// 3. Verification Slide Component
const VerificationSlide = () => (
  <div className={styles.slideContent} style={{ textAlign: 'left' }}>
    <span className={styles.tagline}>VERIFIED SECURITY</span>
    <h2 className={styles.title}>Trust by Verification</h2>
    <p className={styles.description}>
      Recruiters are vetted through institutional domain credentials. Student candidates are cross-referenced with university registries. Zero spam, complete authority.
    </p>
  </div>
);

// 4. Action Slide Component
const ActionSlide = () => (
  <div className={styles.slideContent}>
    <span className={styles.tagline}>BUILD YOUR LEGACY</span>
    <h2 className={styles.title}>Ready to get started?</h2>
    <p className={styles.description}>
      Join thousands of law students and professionals scaling their career. Create your account today.
    </p>
    <div className={styles.btnGroup}>
      <Link href="/signup">
        <Button variant="primary" className={styles.ctaBtn}>Start Free Journey</Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" className={styles.outlineBtn}>Access Dashboard</Button>
      </Link>
    </div>
  </div>
);

// Custom Background glow effect for Slide 4 (Action Slide)
const ActionBackgroundGlow = () => (
  <div 
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at center, rgba(1, 60, 241, 0.12) 0%, transparent 60%)',
    }}
  />
);

export default function Home() {
  // Ordered timeline array of slides defining start/end coordinates, layout, transitions, and optional background effects
  const slides: StorySlideConfig[] = [
    {
      id: 'reveal',
      start: 0.0,
      end: 0.25,
      layoutType: 'center',
      animationConfig: { fadeInDuration: 0.0, fadeOutDuration: 0.05, translateYDistance: 20 },
      component: <RevealSlide />,
    },
    {
      id: 'sourcing',
      start: 0.25,
      end: 0.50,
      layoutType: 'split-left',
      animationConfig: { fadeInDuration: 0.05, fadeOutDuration: 0.05, translateYDistance: 25 },
      component: <SourcingSlide />,
    },
    {
      id: 'verification',
      start: 0.50,
      end: 0.75,
      layoutType: 'split-right',
      animationConfig: { fadeInDuration: 0.05, fadeOutDuration: 0.05, translateYDistance: 25 },
      component: <VerificationSlide />,
    },
    {
      id: 'action',
      start: 0.75,
      end: 1.0,
      layoutType: 'center',
      animationConfig: { fadeInDuration: 0.05, fadeOutDuration: 0.0, translateYDistance: 20 },
      component: <ActionSlide />,
      backgroundEffect: <ActionBackgroundGlow />,
    },
  ];

  // Resolve frame files from public/videos/gem 2/
  const frameUrlTemplate = (index: number) => {
    return `/videos/gem 2/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;
  };

  return (
    <ScrollStoryContainer
      slides={slides}
      frameCount={300}
      frameUrlTemplate={frameUrlTemplate}
      scrollPlayHeight="600vh"
    />
  );
}
