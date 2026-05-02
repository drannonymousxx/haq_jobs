import React from 'react';
import Link from 'next/link';
import styles from '@/styles/CategoryNav.module.css';
import { Briefcase, GraduationCap, Trophy, BookOpen, UserCheck, BookMarked } from 'lucide-react';

const categories = [
  { name: 'Internships', icon: GraduationCap, href: '/internships' },
  { name: 'Jobs', icon: Briefcase, href: '/jobs' },
  { name: 'Competitions', icon: Trophy, href: '/news' },
  { name: 'Mock Tests', icon: BookOpen, href: '/career/exams' },
  { name: 'Mock Interviews', icon: UserCheck, href: '/career/resources' },
  { name: 'Courses', icon: BookMarked, href: '/career/courses' },
];

export default function CategoryNavSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">Explore Categories</h2>
        <div className={styles.grid}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link key={idx} href={cat.href} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.name}>{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
