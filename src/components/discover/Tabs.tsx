import React from 'react';
import styles from '@/styles/discover/Discover.module.css';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TAB_OPTIONS = ["All", "Blogs", "Featured", "Opportunities"];

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className={styles.tabsContainer}>
      {TAB_OPTIONS.map((tab) => (
        <button
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
