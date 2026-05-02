import HeroSection from '@/components/sections/HeroSection';
import CategoryNavSection from '@/components/sections/CategoryNavSection';
import FeaturedCoursesSection from '@/components/sections/FeaturedCoursesSection';
import FeaturedContestsSection from '@/components/sections/FeaturedContestsSection';
import TrustedBySection from '@/components/sections/TrustedBySection';
import OpportunitiesSection from '@/components/sections/OpportunitiesSection';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <CategoryNavSection />
      <OpportunitiesSection />
      <FeaturedCoursesSection />
      <FeaturedContestsSection />
      <CTASection />
    </>
  );
}
