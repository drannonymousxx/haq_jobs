import React from 'react';
import Link from 'next/link';
import styles from '@/styles/discover/Discover.module.css';
import EditorialText from '@/components/ui/EditorialText';

export default function FinalCtaSection() {
  return (
    <div className={styles.ctaContainer}>
      <div className={styles.ctaLeft}>
        <h3>
          <EditorialText text="Only a few roles are *perfect for you*" />
        </h3>
        <p>We analyze your expertise and ambitions to match you with opportunities where you'll thrive.</p>
        <div className={styles.ctaButtons}>
          <Link href="/signup?intent=login">
            <button className={styles.btnSecondary}>Login</button>
          </Link>
          <Link href="/signup">
            <button className={styles.joinBtn}>Sign Up</button>
          </Link>
        </div>
      </div>
      <div className={styles.ctaRight}>
        <div className={styles.ctaPlaceholder}></div>
      </div>
    </div>
  );
}
