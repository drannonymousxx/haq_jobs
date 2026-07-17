import React from 'react';
import Link from 'next/link';
import styles from '@/styles/discover/Discover.module.css';
import EditorialText from '@/components/ui/EditorialText';

export default function FounderSection() {
  return (
    <div className={styles.ctaContainer}>
      <div className={styles.ctaLeft}>
        <h3>
          <EditorialText text="Not all opportunities are *visible*. The right ones are." />
        </h3>
        <p>Gain access to exclusive roles and build a premium network designed for top-tier legal professionals.</p>
        <Link href="/signup">
          <button className={styles.joinBtn}>Get Started</button>
        </Link>
      </div>
      <div className={styles.ctaRight}>
        <div className={styles.ctaPlaceholder}></div>
      </div>
    </div>
  );
}
