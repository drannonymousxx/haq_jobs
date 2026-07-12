import { CompanyProfileData } from "./types";

export const lexoraProfileData: CompanyProfileData = {
  id: "lexora-ai-uuid",
  slug: "lexora-ai",
  name: "Lexora AI",
  tagline: "Intelligent legal research and automation",
  logoText: "Lx",
  description: "Founded in 2024, Lexora AI is transforming legal workflows by empowering new ways of researching, drafting, and analyzing.",
  detailedOverview: "Founded in 2024, Lexora AI is a San Francisco-based technology company passionate about transforming legal workflows and dedicated to empowering new ways of researching, drafting, and analyzing. Today, Lexora AI connects law firms with intelligent automation tools across the United States. By building advanced, domain-specific models, Lexora aims to connect legal professionals with the insights they care about most.",
  overviewImageUrl: "/logohalf.png",
  members: [
    {
      name: "Dr. Sarah Chen",
      designation: "CEO & Co-Founder",
      quote: "Building the future of legal intelligence is about augmenting human expertise, not replacing it.",
    },
    {
      name: "Marcus Vance",
      designation: "Chief Legal Officer",
      quote: "Accuracy in legal AI isn't a feature; it's a fundamental requirement. That's why we build domain-specific models.",
    },
    {
      name: "Aarav Mehta",
      designation: "Head of AI Research",
      quote: "Our models process millions of legal documents in seconds, extracting key precedents with unprecedented semantic precision.",
    }
  ],
  culture: {
    title: "Innovating with integrity and legal precision",
    description: "At Lexora, we merge legal rigorousness with bleeding-edge artificial intelligence. We cultivate an environment of high intellectual curiosity, cross-functional collaboration between attorneys and engineers, and a relentless focus on safety, ethics, and accuracy in legal technology. We believe in high agency, work-life harmony, and building tools that make a real difference in the lives of legal practitioners.",
    imageUrl: "/logofull.png"
  },
  funding: [
    {
      round: "Pre-Seed",
      date: "Jan 2024",
      amount: "₹1.5 Crores",
      investors: ["LegalTech Ventures", "Angel Syndicate"],
      milestones: ["Initial prototype development", "Alpha testing with 3 law firms"],
    },
    {
      round: "Seed",
      date: "Jun 2024",
      amount: "₹4.5 Crores",
      investors: ["ScaleUp Capital", "Y Combinator"],
      milestones: ["Domain-specific LLM trained", "Launched beta with 500 waitlist users"],
    },
    {
      round: "Series A",
      date: "Jan 2025",
      amount: "₹15 Crores",
      investors: ["Apex Partners", "ScaleUp Capital"],
      milestones: ["Public release of research platform", "Expanded to 50 active enterprise law firms"],
    },
    {
      round: "Series B",
      date: "Jul 2026",
      amount: "Custom / Ongoing",
      investors: ["Global Growth Funds"],
      milestones: ["International expansion to Commonwealth markets", "Launch of AI contract drafting assistant"],
    }
  ],
  jobs: [
    {
      id: "job-1",
      slug: "lexora-senior-legal-nlp-engineer",
      title: "Senior NLP Research Engineer (Legal Domain)",
      company: "Lexora AI",
      experience: "5+ Years",
      type: "Full Time",
      workplace: "Hybrid",
      location: "San Francisco, CA",
      tags: ["Python", "PyTorch", "LLMs", "NLP"],
      posted: "2 days ago",
      daysLeft: 14,
      salary: "$180k - $220k",
    },
    {
      id: "job-2",
      slug: "lexora-product-counsel",
      title: "Legal Product Counsel & AI Ethicist",
      company: "Lexora AI",
      experience: "3-5 Years",
      type: "Full Time",
      workplace: "Remote",
      location: "New York, NY",
      tags: ["AI Ethics", "Intellectual Property", "JD Required"],
      posted: "5 days ago",
      daysLeft: 20,
      salary: "$150k - $175k",
    }
  ]
};
