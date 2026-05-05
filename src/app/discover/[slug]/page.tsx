import { articles } from "@/data/discoverData";
import Image from "next/image";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Properly handle params whether it's a Promise (Next 15+) or an object (older versions)
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) return <div className="p-10 text-center">Article not found</div>;

  const article = articles.find((item) => item.slug === slug);

  if (!article) return <div className="p-10 text-center">Article not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* LEFT SIDE: Main Content */}
      <div className="col-span-1 md:col-span-2">
        
        {/* 1. TITLE */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* 2. COVER IMAGE */}
        <div className="w-full h-[400px] relative mb-8 rounded-xl overflow-hidden bg-gray-100">
          <Image 
            src={article.image} 
            alt={article.title} 
            fill
            className="object-cover" 
            priority
          />
        </div>

        {/* 3. AUTHOR SECTION */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div>
            <p className="font-semibold text-gray-900">{article.author}</p>
            <p className="text-sm text-gray-500">{article.role}</p>
          </div>
        </div>

        {/* 4. "NEW TO HAQJOBS" BOX */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-gray-700">
            New to HAQJobs? Discover verified legal opportunities, internships, and insights from top law firms. Build your career with clarity and access. <a href="#" className="text-blue-600 cursor-pointer font-medium hover:underline">Sign up for free</a>.
          </p>
        </div>

        {/* 5. ARTICLE CONTENT */}
        <div className="space-y-5 text-gray-700 leading-relaxed text-[16px]">
          {article.content.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

      </div>

      {/* RIGHT SIDEBAR */}
      <div className="col-span-1">
        <div className="sticky top-24 space-y-6">

          {/* CARD 1: SHARE */}
          <div className="border border-gray-200 shadow-sm rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Share this article</h4>
            <div className="flex gap-4 text-gray-500">
              <span className="cursor-pointer hover:text-blue-600 transition font-medium">Facebook</span>
              <span className="cursor-pointer hover:text-blue-600 transition font-medium">Twitter</span>
              <span className="cursor-pointer hover:text-blue-600 transition font-medium">LinkedIn</span>
            </div>
          </div>

          {/* CARD 2: JOB CTA */}
          <div className="border border-gray-200 shadow-sm rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Didn’t find the right job yet?</h4>
            <ul className="text-gray-600 space-y-2 mb-4 list-disc pl-5">
              <li>Corporate Law roles</li>
              <li>Litigation roles</li>
              <li>Compliance roles</li>
              <li>IP Law roles</li>
            </ul>
            <p className="text-gray-600 text-sm mb-6">Explore hundreds of verified opportunities tailored for legal professionals.</p>
            <button className="w-full bg-black text-white font-medium rounded-md py-3 transition hover:bg-gray-800">
              Find your next job
            </button>
            <p className="text-center text-sm text-gray-500 mt-4 cursor-pointer hover:text-blue-600 transition">
              Already have an account? Sign in
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

