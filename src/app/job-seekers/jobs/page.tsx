import { Metadata } from 'next';
import JobsHero from '@/components/jobs/JobsHero';
import JobsListings from '@/components/jobs/JobsListings';
import JobsCTA from '@/components/jobs/JobsCTA';

export const metadata: Metadata = {
  title: 'Jobs | HAQJobs',
  description: 'Find your next legal opportunity at top law firms and startups.',
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JobsHero />
      
      {/* Premium Minimal Divider */}
      <div className="w-full bg-brand-bg py-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#B63106]/20 to-transparent"></div>
        </div>
      </div>

      <JobsListings />
      
      <JobsCTA />
    </main>
  );
}
