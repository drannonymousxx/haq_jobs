import { HeroSection } from "@/components/post-job/HeroSection";
import { LogoCloud } from "@/components/post-job/LogoCloud";
import { VisibilitySection } from "@/components/post-job/VisibilitySection";
import { CompanyProfileSection } from "@/components/post-job/CompanyProfileSection";
import { GlobalHiringSection } from "@/components/post-job/GlobalHiringSection";
import { CtaSection } from "@/components/post-job/CtaSection";

export const metadata = {
  title: 'Post a Job | HAQJobs',
  description: 'Find legal talent built for you.',
};

export default function PostJobPage() {
  return (
    <main className="bg-brand-bg min-h-screen selection:bg-[#B63106]/20">
      <HeroSection />
      <LogoCloud />
      <VisibilitySection />
      <CompanyProfileSection />
      <GlobalHiringSection />
      <CtaSection />
    </main>
  );
}
