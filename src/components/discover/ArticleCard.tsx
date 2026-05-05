import React from 'react';
import Link from 'next/link';
import styles from '@/styles/discover/Discover.module.css';

interface ArticleCardProps {
  article: {
    title: string;
    description: string;
    slug: string;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/discover/${article.slug}`} className={styles.articleCard}>
      <div className={styles.articlePlaceholderImg}></div>
      <div className={styles.articleContent}>
        <h3 className={styles.articleTitle}>{article.title}</h3>
        <p className={styles.articleDesc}>{article.description}</p>
      </div>
    </Link>
  );
}
