import React from 'react';
import styles from '@/styles/Hero.module.css';
import Button from '@/components/common/Button';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Launch Your Legal Career with Confidence
          </h1>
          <p className={styles.subtitle}>
            Connect with top law firms, find prestigious internships, and access the best resources to accelerate your growth in the legal profession.
          </p>
          <div className={styles.actions}>
            <Button variant="primary">Explore Opportunities</Button>
            <Button variant="outline">For Employers</Button>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          {/* Placeholder for hero image */}
          <div className={styles.imagePlaceholder}>
            <span>Hero Image Illustration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
