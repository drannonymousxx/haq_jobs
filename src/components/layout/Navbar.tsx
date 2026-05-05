import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Navbar.module.css';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logofull.png" 
            alt="HAQJobs Logo" 
            width={150} 
            height={40} 
            style={{ width: '150px', height: 'auto' }}
            priority 
          />
        </Link>
        
        <nav className={styles.navLinks}>
          <Link href="/discover" className={styles.link}>Discover</Link>
          <Link href="/jobs" className={styles.link}>For Job Seekers</Link>
          <Link href="/jobs" className={styles.link}>For Companies</Link>
        </nav>

        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>

        <button className={styles.mobileMenu}>
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
