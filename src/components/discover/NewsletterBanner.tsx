import React from 'react';
import Link from 'next/link';
import styles from '@/styles/discover/Discover.module.css';
import EditorialText from '@/components/ui/EditorialText';

export default function NewsletterBanner() {
  return (
    <div className={styles.newsletterBanner}>
      {/* Left Side */}
      <div className={styles.newsletterLeft}>
        <img src="/logohalf.png" alt="HAQJobs Logo" className={styles.newsletterLogo} />
        <span className={styles.newsletterLabel}>Newsletter</span>
      </div>
      
      {/* Divider */}
      <div className={styles.newsletterDivider}></div>

      {/* Center Text */}
      <div className={styles.newsletterCenter}>
        <h2 className={styles.newsletterTitle}>
          <EditorialText text="Stay ahead in your *legal career*" />
        </h2>
        <p className={styles.newsletterSubtitle}>Discover opportunities, insights, and updates from top law firms</p>
      </div>

      {/* Right Side */}
      <Link href="/signup">
        <button className={styles.joinBtn}>Join Now</button>
      </Link>
    </div>
  );
}
