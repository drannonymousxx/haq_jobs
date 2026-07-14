"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";
import EditorialText from "@/components/ui/EditorialText";

// Custom Radio Button Component
function CustomRadio({ 
  label, 
  name, 
  checked, 
  onChange 
}: { 
  label: string; 
  name: string; 
  checked: boolean; 
  onChange: () => void 
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'border-brand bg-brand/10' : 'border-brand-border group-hover:border-brand/40 bg-brand-surface'}`}>
        <div className={`w-2.5 h-2.5 rounded-full bg-brand transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
      <span className={`text-[15px] transition-colors ${checked ? 'text-brand-text font-semibold' : 'text-brand-text-muted group-hover:text-brand-text'}`}>
        {label}
      </span>
      <input 
        type="radio" 
        name={name} 
        checked={checked} 
        onChange={onChange}
        className="hidden" 
      />
    </label>
  );
}

// Whitelists for parameter validation
const WHITELISTED_PLANS = ["free", "promoted-jobs", "recruit-pro", "elite-hiring"];
const WHITELISTED_SOURCES = ["pricing-page", "homepage", "enterprise", "contact-page"];

const validatePlan = (plan: string | null): string => {
  if (!plan) return "general-inquiry";
  const normalized = plan.toLowerCase().trim();
  return WHITELISTED_PLANS.includes(normalized) ? normalized : "general-inquiry";
};

const validateSource = (source: string | null): string => {
  if (!source) return "companies-page";
  const normalized = source.toLowerCase().trim();
  return WHITELISTED_SOURCES.includes(normalized) ? normalized : "companies-page";
};

function CompaniesHiringFormInner() {
  const searchParams = useSearchParams();

  // Contact details
  const [contactName, setContactName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Radio selections
  const [hiringLocation, setHiringLocation] = useState("");
  const [role, setRole] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [expectedHires, setExpectedHires] = useState("");
  const [hiringTimeline, setHiringTimeline] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Hidden / query param derived
  const [interestedPlan, setInterestedPlan] = useState("general-inquiry");
  const [source, setSource] = useState("companies-page");

  // Honeypot spam protection
  const [honeypot, setHoneypot] = useState("");

  // Form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Initialize whitelisted values from search params
  useEffect(() => {
    const rawPlan = searchParams.get("plan");
    const rawSource = searchParams.get("source");

    setInterestedPlan(validatePlan(rawPlan));
    setSource(validateSource(rawSource));
  }, [searchParams]);

  // Options lists
  const locations = [
    "Pan India", "Delhi NCR", "Mumbai", "Bangalore", 
    "Hyderabad", "Chennai", "Kolkata", "Pune", 
    "Remote", "International"
  ];

  const roles = [
    "Founder / Managing Partner", "HR / Talent Acquisition", 
    "Legal Recruiter", "Startup Founder", "In-house Counsel", 
    "Hiring Manager", "Other"
  ];

  const headcounts = ["1–10", "11–50", "51–200", "200+"];

  const expectedHiresList = ["1–5 hires", "6–20 hires", "21–50 hires", "50+ hires"];

  const timelines = [
    "Immediate (Next 30 days)",
    "Next 1–3 months",
    "Next 3–6 months",
    "Flexible / General Inquiry"
  ];

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side validation
    if (!companyName.trim() || !workEmail.trim()) {
      setError("Company Name and Work Email are required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail.trim())) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (!hiringLocation || !role || !headcount || !expectedHires || !hiringTimeline) {
      setError("Please answer all selection questions before submitting.");
      return;
    }

    // 2. Client-side Rate Limiting (prevent submission spamming within 30s)
    const lastSubmit = localStorage.getItem("last_lead_submission");
    if (lastSubmit) {
      const elapsed = Date.now() - parseInt(lastSubmit, 10);
      if (elapsed < 30000) {
        setError("You are submitting too frequently. Please wait a few seconds.");
        return;
      }
    }

    setLoading(true);

    try {
      // 3. Call the security definer RPC
      const { data: success, error: submitErr } = await supabase.rpc("submit_recruiter_lead", {
        p_company_name: companyName.trim(),
        p_work_email: workEmail.trim().toLowerCase(),
        p_phone: phone.trim() || null,
        p_website: website.trim() || null,
        p_contact_name: contactName.trim() || null,
        p_role: role,
        p_hiring_locations: hiringLocation,
        p_company_headcount: headcount,
        p_expected_hires: expectedHires,
        p_hiring_timeline: hiringTimeline,
        p_interested_plan: interestedPlan,
        p_additional_notes: additionalNotes.trim() || null,
        p_source: source,
        p_honeypot: honeypot || null
      });

      if (submitErr) {
        setError(submitErr.message);
        setLoading(false);
        return;
      }

      // Record submission timestamp for client rate-limiting
      localStorage.setItem("last_lead_submission", Date.now().toString());

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit consultation request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="w-full py-24 md:py-32 bg-brand-bg relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-brand opacity-[0.03] rounded-full blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-[20%] right-[25%] w-[500px] h-[500px] bg-[#1D4ED8] opacity-[0.02] rounded-full blur-[130px] pointer-events-none z-0" />

        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10 flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-card border border-brand-border rounded-[36px] p-12 md:p-16 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mb-8">
              <Check className="w-8 h-8 text-brand" strokeWidth={3} />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4">
              Consultation Scheduled!
            </h3>
            <p className="text-brand-text-secondary text-lg leading-relaxed max-w-lg mb-8">
              Thank you for reaching out, {contactName || "there"}. Our legal recruitment specialists will review your requirements and contact you at <span className="text-brand font-semibold">{workEmail}</span> shortly.
            </p>
            <Link href="/" className="px-8 py-3.5 bg-[#121212] border border-brand-border hover:bg-brand/10 hover:border-brand text-brand-text text-sm font-bold rounded-xl transition-all duration-300">
              Return Home
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="consultation" className="w-full py-24 md:py-32 bg-brand-bg relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-brand opacity-[0.03] rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-[#1D4ED8] opacity-[0.02] rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-col items-center relative z-10">
        
        {/* Intro / Heading Area */}
        <div className="w-full max-w-4xl text-center md:text-left mb-16 md:mb-20 self-start select-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block text-xs font-bold tracking-[0.15em] text-brand uppercase">
              Built for modern legal hiring
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight leading-[1.1] mb-8 max-w-3xl"
          >
            <EditorialText text="Flexible hiring solutions for every stage of your *legal growth*" />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] leading-relaxed text-brand-text-secondary max-w-3xl space-y-4 font-medium"
          >
            <p>
              From startup legal hiring to enterprise recruitment workflows, HAQJobs helps firms and legal teams discover qualified talent faster with streamlined hiring tools.
            </p>
            <p>
              Looking for something a bit more specific? We&apos;re happy to create a custom solution fit for your team.
            </p>
            <p className="font-semibold text-brand pt-2">
              To find you the best option, we just need a few details →
            </p>
          </motion.div>
        </div>

        {/* Large Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full bg-brand-card rounded-[28px] md:rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-brand-border overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side */}
          <div className="w-full md:w-[40%] p-10 md:p-14 flex flex-col items-start border-b md:border-b-0 md:border-r border-brand-border bg-brand-surface select-none">
            <div className="mb-16">
              <Image className="brightness-0 invert" 
                src="/logofull.png" 
                alt="HAQJobs Logo" 
                width={140} 
                height={36} 
                style={{ width: '140px', height: 'auto' }}
              />
            </div>
            
            <div className="mt-auto md:mt-10 lg:mt-20">
              <h3 className="text-2xl font-bold text-brand-text mb-4 font-poppins">
                <EditorialText text="Schedule a *hiring consultation*" />
              </h3>
              <p className="text-[15px] text-brand-text-muted leading-relaxed max-w-[280px]">
                Tell us about your hiring needs and we’ll connect you with the right team.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-[60%] p-10 md:p-14 bg-brand-card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-12">
              
              {/* Alert Message */}
              {error && (
                <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-sm text-red-400 font-medium">
                  {error}
                </div>
              )}

              {/* Honeypot hidden input */}
              <input
                type="text"
                name="website_url_verification"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden absolute"
                autoComplete="off"
              />

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Work Email <span className="text-brand">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Company Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Khaitan & Co, etc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text"
                  />
                </div>
              </div>

              {/* Question 1 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  Where are you primarily hiring? <span className="text-brand">*</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {locations.map((loc) => (
                    <CustomRadio 
                      key={loc}
                      label={loc}
                      name="location"
                      checked={hiringLocation === loc}
                      onChange={() => setHiringLocation(loc)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What best describes your role? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {roles.map((r) => (
                    <CustomRadio 
                      key={r}
                      label={r}
                      name="role"
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What is your company headcount? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {headcounts.map((hc) => (
                    <CustomRadio 
                      key={hc}
                      label={hc}
                      name="headcount"
                      checked={headcount === hc}
                      onChange={() => setHeadcount(hc)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 4: Expected Hires (New) */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What is your expected hiring volume? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {expectedHiresList.map((eh) => (
                    <CustomRadio 
                      key={eh}
                      label={eh}
                      name="expectedHires"
                      checked={expectedHires === eh}
                      onChange={() => setExpectedHires(eh)}
                    />
                  ))}
                </div>
              </div>

              {/* Question 5: Hiring Timeline (New) */}
              <div>
                <h4 className="text-[16px] font-bold text-brand-text mb-5">
                  What is your hiring timeline? <span className="text-brand">*</span>
                </h4>
                <div className="flex flex-col gap-4">
                  {timelines.map((t) => (
                    <CustomRadio 
                      key={t}
                      label={t}
                      name="hiringTimeline"
                      checked={hiringTimeline === t}
                      onChange={() => setHiringTimeline(t)}
                    />
                  ))}
                </div>
              </div>

              {/* Textarea for additional notes */}
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                  Additional Notes / Specific Requirements
                </label>
                <textarea
                  placeholder="Tell us about any specific details, preferred law schools, or specialized experience you need..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 text-[15px] border border-brand-border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B63106]/20 focus:border-[#B63106] placeholder:text-brand-text-muted bg-brand-surface text-brand-text resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center md:justify-start">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-10 py-4 bg-brand text-white text-[15px] font-bold rounded-full hover:bg-brand-hover hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(182,49,6,0.35)] transition-all duration-300 w-full sm:w-auto min-w-[200px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? "Submitting Request..." : "Submit Consultation Request"}
                </button>
              </div>

            </form>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default function CompaniesHiringForm() {
  return (
    <Suspense fallback={
      <section className="w-full py-24 bg-brand-bg relative overflow-hidden flex items-center justify-center">
        <div className="text-brand-text font-bold text-lg">Loading hiring form...</div>
      </section>
    }>
      <CompaniesHiringFormInner />
    </Suspense>
  );
}
