import { Metadata } from 'next';
import CompaniesHero from '@/components/companies/CompaniesHero';
import CompaniesStats from '@/components/companies/CompaniesStats';
import CompaniesHiringForm from '@/components/companies/CompaniesHiringForm';
import PublicPageBackground from '@/components/common/PublicPageBackground';

export const metadata: Metadata = {
  title: 'For Companies | HAQJobs',
  description: 'The complete platform to discover, hire & manage top legal talent.',
};

export default function ForCompaniesPage() {
  return (
    <PublicPageBackground>
      <CompaniesHero />
      <CompaniesStats />
      <CompaniesHiringForm />
    </PublicPageBackground>
  );
}
