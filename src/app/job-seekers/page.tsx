import JobSeekerHero from "@/components/job-seekers/JobSeekerHero";
import FeatureSectionOne from "@/components/job-seekers/FeatureSectionOne";
import StatsSection from "@/components/job-seekers/StatsSection";
import FeatureSectionTwo from "@/components/job-seekers/FeatureSectionTwo";
import InteractiveCTA from "@/components/job-seekers/InteractiveCTA";
import TestimonialsSection from "@/components/overview/TestimonialsSection";
import PublicPageBackground from "@/components/common/PublicPageBackground";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Job Seekers | HAQJobs",
  description: "Discover legal opportunities, internships, and resources tailored for law students and professionals.",
};

export default function JobSeekersPage() {
  return (
    <PublicPageBackground>
      <JobSeekerHero />
      <FeatureSectionOne />
      <StatsSection />
      <FeatureSectionTwo />
      <InteractiveCTA />
      <TestimonialsSection />
    </PublicPageBackground>
  );
}
