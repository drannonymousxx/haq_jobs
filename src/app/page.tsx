import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import HomeOrbitSection from "@/components/home/HomeOrbitSection";
import InteractiveSplineSection from "@/components/home/InteractiveSplineSection";
import { HomepageFooter } from "@/components/home/HomepageFooter";

export const metadata = {
  title: "HAQJobs — Build Your Legal Career. Hire Better Legal Talent.",
  description:
    "HAQJobs connects law students, lawyers, legal recruiters, and law firms through one modern legal hiring platform. Explore verified jobs, AI-powered matching, and recruiter tools.",
};

/**
 * Homepage — composed of independent, reusable section components.
 * Add new sections below without restructuring the page architecture.
 */
export default function Home() {
  return (
    <div className="bg-[#0B0B0B] overflow-x-hidden">
      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 2 — About HAQJobs */}
      <AboutSection />

      {/* Section 3 — Platform Features */}
      <FeaturesSection />

      {/* Section 4 — Legal Hiring Ecosystem */}
      <HomeOrbitSection />

      {/* Section 5 — 3D Interactive Showcase */}
      <InteractiveSplineSection />

      {/* Section 6 — Cinematic Liquid Glass Footer */}
      <HomepageFooter />
    </div>
  );
}
