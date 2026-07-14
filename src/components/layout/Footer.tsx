"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Footer.module.css';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/signup') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/candidate') || pathname?.startsWith('/interview')) {
    return null;
  }
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.brand}>
          <Image
            src="/logofull.png"
            alt="HAQJobs"
            width={180}
            height={48}
            className={`${styles.logoImage} object-contain brightness-0 invert`}
          />
          <p className={styles.description}>
            The premier legal career platform connecting top talent with top opportunities.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkColumn}>
            <h3>Opportunities</h3>
            <Link href="/jobs">Jobs</Link>
            <Link href="/internships">Internships</Link>
          </div>
          <div className={styles.linkColumn}>
            <h3>Resources</h3>
            <Link href="/news">News</Link>
            <Link href="/career">Career in Law</Link>
          </div>
          <div className={styles.linkColumn}>
            <h3>Legal</h3>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} HAQJobs. All rights reserved.</p>
      </div>
    </footer>
  );
}
