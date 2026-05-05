import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

export default function FounderSection() {
  return (
    <div className={styles.centeredSection}>
      <h3>Not all opportunities are visible. The right ones are.</h3>
      <p>Find your next legal role with HAQJobs.</p>
      <button className={styles.joinBtn}>Get Started</button>
    </div>
  );
}
