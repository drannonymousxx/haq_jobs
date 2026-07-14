import React from 'react';
import Image from 'next/image';
import styles from '@/styles/discover/Discover.module.css';

interface CompanyCardProps {
  company: {
    name: string;
    domain: string;
    logo: string;
    roles: string[];
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className={styles.companyCard}>
      <div className={styles.companyLeft}>
        <div className={styles.logoPlaceholder}>
          {company.logo ? (
            <Image 
              src={company.logo} 
              alt={`${company.name} Logo`} 
              width={44} 
              height={44} 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          ) : null}
        </div>
        <div className={styles.companyInfo}>
          <div className={styles.companyName}>{company.name}</div>
          <div className={styles.companyDomain}>{company.domain}</div>
          <div className={styles.rolesContainer}>
            {company.roles.map((role, idx) => (
              <span key={idx} className={styles.roleChip}>{role}</span>
            ))}
          </div>
        </div>
      </div>
      <button className={styles.applyBtn} disabled>Apply Now</button>
    </div>
  );
}
