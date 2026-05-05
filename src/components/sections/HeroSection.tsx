import React from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import styles from '@/styles/Hero.module.css';
import Button from '@/components/common/Button';
import HeroBackground from './HeroBackground';

const satoshi = localFont({
  src: '../../../public/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2',
  display: 'swap',
  variable: '--font-satoshi',
});

export default function HeroSection() {
  return (
    <section className={`${styles.hero} ${satoshi.variable}`}>
      <HeroBackground />
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
    </section>
  );
}
