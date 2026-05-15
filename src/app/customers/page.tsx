import { Metadata } from 'next';
import CustomersHero from '@/components/customers/CustomersHero';
import FeaturedStories from '@/components/customers/FeaturedStories';

export const metadata: Metadata = {
  title: 'Customer Stories | HAQJobs',
  description: 'Explore how legal professionals, startups, and modern law firms connect with the right opportunities through HAQJobs.',
};

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-white">
      <CustomersHero />
      <FeaturedStories />
    </div>
  );
}
