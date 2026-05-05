import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

export default function FinalCtaSection() {
  return (
    <div className={styles.centeredSection}>
      <h3>Only a few roles are perfect for you.</h3>
      <p>Discover what’s next.</p>
      <div className={styles.ctaButtons}>
        <button className={styles.btnSecondary}>Login</button>
        <button className={styles.joinBtn}>Sign Up</button>
      </div>
    </div>
  );
}
