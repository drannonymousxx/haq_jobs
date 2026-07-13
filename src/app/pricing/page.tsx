import { Metadata } from 'next';
import PricingHero from '@/components/pricing/PricingHero';
import AttractTalent from '@/components/pricing/AttractTalent';
import FindTalent from '@/components/pricing/FindTalent';
import ManageTalent from '@/components/pricing/ManageTalent';
import PublicPageBackground from '@/components/common/PublicPageBackground';

export const metadata: Metadata = {
  title: 'Pricing | HAQJobs',
  description: 'Hire legal talent your way. Explore flexible pricing plans to attract, find, and manage top candidates.',
};

export default function PricingPage() {
  return (
    <PublicPageBackground className="overflow-hidden">
      <PricingHero />
      <AttractTalent />
      <FindTalent />
      <ManageTalent />
    </PublicPageBackground>
  );
}
