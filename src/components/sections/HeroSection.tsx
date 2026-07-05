'use client';

import React from 'react';
import styles from '@/styles/Hero.module.css';
import Button from '@/components/common/Button';
import HeroBackground from './HeroBackground';
import { useScrollProgress } from '../common/ScrollProgressContext';

export default function HeroSection() {
  const scrollProgress = useScrollProgress();

  // Text parallax: translate text upward as the user scrolls
  const textTranslateY = -scrollProgress * 280;

  return (
    <div 
      className={styles.hero}
      style={{ 
        transform: `translateY(${textTranslateY}px)`,
        willChange: 'transform',
        width: '100%'
      }}
    >
      {/* Pass amplified progress so the floating pills animate dynamically in their active viewport window */}
      <HeroBackground scrollProgress={scrollProgress * 7.5} />
      
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.content}>
          <span className={styles.tagline}>DISCOVER. APPLY. GROW.</span>
          <h1 className={styles.title}>
            Build Your Legal Career with{' '}
            <span className={styles.highlightBox}>
              <span className={styles.highlightText}>HAQJobs</span>
            </span>
          </h1>
          <p className={styles.subtitle}>
            Connect with leading law firms, discover internships, and unlock career opportunities — all in one place built for aspiring legal professionals.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" className={styles.ctaButton}>Start Your Journey &rarr;</Button>
          </div>
          <div className={styles.socialProof}>
            <div className={styles.heroAvatars}>
              <img src="/profile/profile1.avif" className={styles.heroAvatar} alt="User 1" />
              <img src="/profile/profile2.avif" className={styles.heroAvatar} alt="User 2" />
              <img src="/profile/profile3.avif" className={styles.heroAvatar} alt="User 3" />
              <img src="/profile/profile4.avif" className={styles.heroAvatar} alt="User 4" />
              <img src="/profile/profile5.avif" className={styles.heroAvatar} alt="User 5" />
            </div>
            <p className={styles.socialText}>
              <strong>1,000+</strong> Students & Lawyers building their careers with HAQJobs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
