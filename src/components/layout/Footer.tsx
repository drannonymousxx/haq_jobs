import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.brand}>
          <img src="/logo-full.png" alt="HAQJobs" className={styles.logoImage} />
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
