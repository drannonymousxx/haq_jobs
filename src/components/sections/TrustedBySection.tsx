import React from 'react';
import styles from '@/styles/TrustedBy.module.css';

export default function TrustedBySection() {
  const partners = [
    { src: '/logos/Arguspartners.png', isLarge: false },
    { src: '/logos/AZB.png', isLarge: true },
    { src: '/logos/Cyril.png', isLarge: false },
    { src: '/logos/DSK.png', isLarge: false },
    { src: '/logos/ELP.png', isLarge: false },
    { src: '/logos/Khaitan.png', isLarge: false },
    { src: '/logos/linklaters.png', isLarge: false },
    { src: '/logos/Trilegal.png', isLarge: true }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.label}>Trusted by Top Legal Institutions</p>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            {partners.map((partner, index) => (
              <div key={`orig-${index}`} className={`${styles.logoItem} ${partner.isLarge ? styles.large : ''}`}>
                <img src={partner.src} alt={`Partner ${index + 1}`} />
              </div>
            ))}
            {/* Duplicate for seamless scrolling */}
            {partners.map((partner, index) => (
              <div key={`dup-${index}`} className={`${styles.logoItem} ${partner.isLarge ? styles.large : ''}`}>
                <img src={partner.src} alt={`Partner ${index + 1} Duplicate`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
