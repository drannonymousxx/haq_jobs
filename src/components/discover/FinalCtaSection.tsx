import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

export default function FinalCtaSection() {
  return (
    <div className={styles.ctaContainer}>
      <div className={styles.ctaLeft}>
        <h3>Only a few roles are perfect for you</h3>
        <p>We analyze your expertise and ambitions to match you with opportunities where you'll thrive.</p>
        <div className={styles.ctaButtons}>
          <button className={styles.btnSecondary}>Login</button>
          <button className={styles.joinBtn}>Sign Up</button>
        </div>
      </div>
      <div className={styles.ctaRight}>
        <div className={styles.ctaPlaceholder}></div>
      </div>
    </div>
  );
}
