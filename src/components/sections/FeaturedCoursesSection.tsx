import React from 'react';
import styles from '@/styles/GridSection.module.css';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { coursesData } from '@/data/mockData';

export default function FeaturedCoursesSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">Featured Courses</h2>
          <span className={styles.viewAll}>View all courses &rarr;</span>
        </div>
        <div className={styles.grid}>
          {coursesData.map((course) => (
            <Card key={course.id} className={styles.itemCard}>
              <div className={styles.cardHeader}>
                <Badge variant="warning">{course.level}</Badge>
                <span className={styles.duration}>{course.duration}</span>
              </div>
              <h3 className={styles.itemTitle}>{course.title}</h3>
              <p className={styles.itemSubtitle}>{course.provider}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
