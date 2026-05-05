import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

interface DomainGridProps {
  domains: string[];
}

export default function DomainGrid({ domains }: DomainGridProps) {
  return (
    <div className={styles.domainGrid}>
      {domains.map((domain, idx) => (
        <div key={idx} className={styles.domainPill}>
          {domain}
        </div>
      ))}
    </div>
  );
}
