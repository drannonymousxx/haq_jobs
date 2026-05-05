import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/discover/Discover.module.css';

interface ArticleCardProps {
  article: {
    title: string;
    description: string;
    slug: string;
    image: string;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/discover/${article.slug}`} className={styles.articleCard}>
      <div className={styles.articleImageContainer || "w-full h-48 overflow-hidden"}>
        <Image 
          src={article.image} 
          alt={article.title} 
          width={400} 
          height={200}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className={styles.articleContent}>
        <h3 className={styles.articleTitle}>{article.title}</h3>
        <p className={styles.articleDesc}>{article.description}</p>
      </div>
    </Link>
  );
}
