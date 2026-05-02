import React from 'react';
import styles from '@/styles/GridSection.module.css';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { contestsData } from '@/data/mockData';
import { Calendar } from 'lucide-react';

export default function FeaturedContestsSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">Contests & Events</h2>
          <span className={styles.viewAll}>View all &rarr;</span>
        </div>
        <div className={styles.grid}>
          {contestsData.map((contest) => (
            <Card key={contest.id} className={styles.itemCard}>
              <div className={styles.cardHeader}>
                <Badge variant="success">{contest.status}</Badge>
              </div>
              <h3 className={styles.itemTitle}>{contest.title}</h3>
              <p className={styles.itemSubtitle}>{contest.organizer}</p>
              <div className={styles.itemMeta}>
                <Calendar size={14} />
                <span>{contest.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
