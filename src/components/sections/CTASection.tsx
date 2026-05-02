import React from 'react';
import styles from '@/styles/CTA.module.css';
import Button from '@/components/common/Button';

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>Ready to advance your legal career?</h2>
        <p className={styles.subtitle}>
          Join thousands of law students and professionals already using HAQJobs to find their next big opportunity.
        </p>
        <Button variant="primary" className={styles.btn}>Get Started Today</Button>
      </div>
    </section>
  );
}
