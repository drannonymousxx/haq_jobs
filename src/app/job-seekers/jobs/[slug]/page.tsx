import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  // Convert slug back to a readable title (e.g. corporate-legal-associate -> Corporate Legal Associate)
  const title = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | HAQJobs`,
    description: `Details for ${title} opportunity at HAQJobs.`,
  };
}

export default function JobDetailsPage({ params }: Props) {
  const jobTitle = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen bg-[#F7F8FC] py-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        <Link 
          href="/job-seekers/jobs"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#013CF1] transition-colors mb-10 font-medium text-[15px]"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>
        
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_20px_60px_-15px_rgba(1,60,241,0.06)] border border-[rgba(1,60,241,0.04)] text-center">
          <div className="w-20 h-20 bg-[#EEF2FF] text-[#013CF1] rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl font-bold">
            {jobTitle.charAt(0)}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#191D20] mb-4 tracking-tight">
            {jobTitle}
          </h1>
          <p className="text-[16px] text-[#64748B] mb-10">
            This is a placeholder page for the dynamic job listing route.
          </p>
          <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E2E8F0] inline-block">
            <h3 className="font-semibold text-[#191D20] mb-2">Job details coming soon</h3>
            <p className="text-sm text-[#94A3B8]">The backend integration is required to populate this content.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
