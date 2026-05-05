import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  // Convert slug to a readable title for the mock display
  const title = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <>
      <main className={styles.articleDetailPage}>
        <div className={styles.articleBanner}></div>
        <h1 className={styles.sectionHeader} style={{ fontSize: '2.5rem', marginTop: '32px' }}>
          {title}
        </h1>
        
        <div className={styles.articleBody}>
          <p>
            This is a dummy paragraph text simulating a legal-related article. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            The legal industry is constantly evolving, and staying ahead requires continuous learning and adaptation. Whether you are dealing with corporate mergers, intellectual property disputes, or complex litigation, understanding the nuances of the law is critical to your success.
          </p>
        </div>
      </main>
    </>
  );
}
