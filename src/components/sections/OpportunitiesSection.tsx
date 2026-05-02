import React from 'react';
import styles from '@/styles/GridSection.module.css';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { jobsData, internshipsData } from '@/data/mockData';
import { MapPin } from 'lucide-react';

export default function OpportunitiesSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">Latest Opportunities</h2>
          <span className={styles.viewAll}>View all &rarr;</span>
        </div>
        <div className={styles.grid}>
          {[...jobsData, ...internshipsData].slice(0, 6).map((job) => (
            <Card key={`${job.type}-${job.id}`} className={styles.itemCard}>
              <div className={styles.cardHeader}>
                <Badge variant="default">{job.type}</Badge>
                <span className={styles.duration}>{job.postedAt}</span>
              </div>
              <h3 className={styles.itemTitle}>{job.title}</h3>
              <p className={styles.itemSubtitle}>{job.company}</p>
              <div className={styles.itemMeta}>
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
