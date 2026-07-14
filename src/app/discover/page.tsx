"use client";

import React, { useState } from 'react';
import styles from '@/styles/discover/Discover.module.css';
import Tabs from '@/components/discover/Tabs';
import NewsletterBanner from '@/components/discover/NewsletterBanner';
import ArticleCard from '@/components/discover/ArticleCard';
import CompanyCard from '@/components/discover/CompanyCard';
import DomainGrid from '@/components/discover/DomainGrid';
import FounderSection from '@/components/discover/FounderSection';
import FinalCtaSection from '@/components/discover/FinalCtaSection';
import PublicPageBackground from '@/components/common/PublicPageBackground';
import { articles as discoverArticles, discoverCompanies, discoverDomains } from '@/data/discoverData';
import EditorialText from '@/components/ui/EditorialText';

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("All");

  // Determine what to show based on the active tab
  const showArticles = activeTab === "All" || activeTab === "Blogs" || activeTab === "Featured";
  const showCompanies = activeTab === "All" || activeTab === "Opportunities";
  const showDomainsAndCTA = activeTab === "All"; // Clean up UI for specific tabs

  // Filter articles based on active tab
  let filteredArticles = discoverArticles;
  if (activeTab === "Blogs") {
    filteredArticles = discoverArticles.filter(article => article.category === "blog");
  } else if (activeTab === "Featured") {
    filteredArticles = discoverArticles.filter(article => article.category === "featured");
  } else if (activeTab === "All") {
    filteredArticles = discoverArticles.filter(article => article.title !== "Alternative Careers for Law Graduates");
  }

  return (
    <PublicPageBackground>
      <main className={styles.pageContainer}>
        <h1 className={styles.discoverTitle}>Discover</h1>

        {/* 1. Tabs */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* 2. Newsletter Banner */}
        <NewsletterBanner />

        {/* 3. Articles Section (grid) */}
        {showArticles && (
          <section>
            <h2 className={styles.sectionHeader}>
              {activeTab === "Featured" ? (
                <EditorialText text="Featured *Articles*" />
              ) : activeTab === "Blogs" ? (
                <EditorialText text="Latest *Blogs*" />
              ) : (
                <EditorialText text="Latest *Insights*" />
              )}
            </h2>
            <div className={styles.articleGrid}>
              {filteredArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Company Section (cards) */}
        {showCompanies && (
          <section>
            <h2 className={styles.sectionHeader}>
              <EditorialText text="Actively *Hiring*" />
            </h2>
            <div className={styles.companyList}>
              {discoverCompanies.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Domain Grid (Only show on 'All' to match requested behavior) */}
        {showDomainsAndCTA && (
          <>
            <section className={styles.domainSection}>
              <h2 className={styles.centerHeader}>
                <EditorialText text="Discover *Domains*" />
              </h2>
              <DomainGrid domains={discoverDomains} />
            </section>

            {/* 6. Founder Section */}
            <FounderSection />

            {/* 7. Final CTA Section */}
            <FinalCtaSection />
          </>
        )}
      </main>
    </PublicPageBackground>
  );
}
