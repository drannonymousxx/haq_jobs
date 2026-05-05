import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

export default function NewsletterBanner() {
  return (
    <div className={styles.newsletterBanner}>
      <h2 className={styles.newsletterTitle}>Stay Ahead in Your Legal Career</h2>
      <p className={styles.newsletterSubtitle}>Get curated internships, jobs & insights from top law firms</p>
      <button className={styles.joinBtn}>Join HAQJobs</button>
    </div>
  );
}
