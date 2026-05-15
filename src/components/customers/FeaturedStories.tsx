"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stories = [
  {
    company: "Lexora",
    quote: `"If you know what you're looking for, and you're looking to save a ton of time, it's a no brainer. The feedback loop and the scope of search is great. When you don't have the resources and time you need to recruit, HAQJobs gives you an easy and streamlined workflow."`,
    author: "Devin Stein",
    role: "CEO & Founder of Lexora",
    slug: "lexora",
  },
  {
    company: "JurisAI",
    quote: `"About two weeks in when I realized that the quality was significantly higher. Again, not to disrespect agencies at all, but there's a bit of a spray and pray model there. And I was very clear early on that we didn't want that, nor could I handle that."`,
    author: "Max",
    role: "Head of Recruiting",
    slug: "jurisai",
  },
  {
    company: "CounselFlow",
    quote: `"My sourcer met with me, understood the job, screened every single candidate, and only sent me candidates that were worth considering. I was very picky, so they continued to work with me to refine the search. It was amazing service."`,
    author: "Alex Westner",
    role: "CEO of CounselFlow",
    slug: "counselflow",
  },
  {
    company: "Briefly",
    quote: `"HAQJobs completely transformed how we source legal associates. Within a week of posting our requirement, we had a pipeline of incredibly well-vetted candidates with the exact compliance background we needed."`,
    author: "Sarah Jenkins",
    role: "Managing Partner",
    slug: "briefly",
  },
  {
    company: "CasePilot",
    quote: `"The platform's legal-specific filters meant we weren't sifting through generic resumes. We found our lead IP counsel in half the time it usually takes. Highly recommended for any growing firm."`,
    author: "David Chen",
    role: "Chief Legal Officer",
    slug: "casepilot",
  },
  {
    company: "LegalStack",
    quote: `"As a fast-paced legal tech startup, we needed talent that understood both the law and technology. HAQJobs delivered exactly that. The candidate quality is just consistently outstanding."`,
    author: "Priya Sharma",
    role: "Founder",
    slug: "legalstack",
  }
];

export default function FeaturedStories() {
  return (
    <section className="bg-white pt-10 pb-24 md:pt-14 md:pb-32 w-full">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-12">
          <span className="inline-block text-[13px] font-bold tracking-[0.2em] text-[#013CF1] uppercase">
            Featured Stories
          </span>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group flex flex-col bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Top Strip (Logo Area Placeholder) */}
              <div className="bg-[#EEF2FF] px-8 py-6 border-b border-[#E2E8F0] flex items-center">
                <span className="text-xl font-bold text-[#191D20] tracking-tight">
                  {story.company}
                </span>
              </div>

              {/* Main Body */}
              <div className="flex flex-col flex-1 p-8">
                <p className="text-[15px] leading-[1.65] text-[#191D20] mb-8 flex-1">
                  {story.quote}
                </p>

                <div className="mt-auto flex flex-col gap-1 mb-8">
                  <span className="font-bold text-[15px] text-[#191D20]">
                    {story.author}
                  </span>
                  <span className="text-[14px] text-[#64748B]">
                    {story.role}
                  </span>
                </div>

                <Link
                  href={`/customers/${story.slug}`}
                  className="inline-flex text-[15px] text-[#013CF1] hover:text-[#012bb5] transition-colors font-medium border-b border-transparent hover:border-[#012bb5] self-start"
                >
                  View success story
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
