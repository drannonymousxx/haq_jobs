import React from 'react';
import styles from '@/styles/Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
