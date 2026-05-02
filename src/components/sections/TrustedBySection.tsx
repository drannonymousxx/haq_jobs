import React from 'react';
import styles from '@/styles/TrustedBy.module.css';

export default function TrustedBySection() {
  const partners = ['Supreme Court', 'Khaitan & Co', 'Cyril Amarchand', 'Luthra & Luthra', 'Shardul Amarchand', 'Trilegal'];

  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.label}>Trusted by Top Legal Institutions</p>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            {partners.map((partner, index) => (
              <span key={index} className={styles.partnerName}>{partner}</span>
            ))}
            {/* Duplicate for seamless scrolling */}
            {partners.map((partner, index) => (
              <span key={`dup-${index}`} className={styles.partnerName}>{partner}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
