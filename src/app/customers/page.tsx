import { Metadata } from 'next';
import CustomersHero from '@/components/customers/CustomersHero';
import FeaturedStories from '@/components/customers/FeaturedStories';
import PublicPageBackground from '@/components/common/PublicPageBackground';

export const metadata: Metadata = {
  title: 'Customer Stories | HAQJobs',
  description: 'Explore how legal professionals, startups, and modern law firms connect with the right opportunities through HAQJobs.',
};

export default function CustomersPage() {
  return (
    <PublicPageBackground>
      <CustomersHero />
      <FeaturedStories />
    </PublicPageBackground>
  );
}
