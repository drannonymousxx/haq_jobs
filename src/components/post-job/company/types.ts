import { JobData } from "@/components/jobs/JobCard";

export interface TeamMember {
  name: string;
  designation: string;
  quote: string;
  avatarUrl?: string;
}

export interface CultureDetail {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface FundingRound {
  round: string;
  date: string;
  amount: string;
  investors: string[];
  milestones: string[];
}

export interface CompanyProfileData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoText: string;
  logoBgColor?: string;
  logoTextColor?: string;
  description: string;
  detailedOverview: string;
  overviewImageUrl?: string;
  members: TeamMember[];
  culture: CultureDetail;
  funding: FundingRound[];
  jobs: JobData[];
}
