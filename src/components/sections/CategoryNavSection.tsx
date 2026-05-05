import React from 'react';
import Link from 'next/link';
import styles from '@/styles/CategoryNav.module.css';
const categories = [
  { name: 'Internships', image: '/categories/internship.png', href: '/internships' },
  { name: 'Jobs', image: '/categories/officebag.png', href: '/jobs' },
  { name: 'Competitions', image: '/categories/trophy.png', href: '/news' },
  { name: 'Mock Tests', image: '/categories/mocktest.png', href: '/career/exams' },
  { name: 'Mock Interviews', image: '/categories/mockinterview.png', href: '/career/resources' },
  { name: 'Courses', image: '/categories/courses.png', href: '/career/courses' },
];

export default function CategoryNavSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">Explore Categories</h2>
        <div className={styles.grid}>
          {categories.map((cat, idx) => {
            return (
              <Link key={idx} href={cat.href} className={styles.card}>
                <img src={cat.image} alt={cat.name} className={styles.categoryImage} />
                <h3 className={styles.name}>{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
