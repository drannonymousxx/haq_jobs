import React from 'react';
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
            <span className={styles.highlight}>HAQJobs</span>
          </h1>
          <p className={styles.subtitle}>
            Connect with leading law firms, discover internships, and unlock career opportunities — all in one place built for aspiring legal professionals.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" className={styles.ctaButton}>Start Your Journey &rarr;</Button>
          </div>
          <div className={styles.socialProof}>
            <strong>1,000+</strong> Students & Lawyers building their careers with HAQJobs
          </div>
        </div>
      </div>
    </section>
  );
}
