-- Migration: Recruiter Profile Extension and Job Posting Tables
-- Run this in your Supabase SQL Editor.

-- 1. Create handle_updated_at function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Extend public.profiles table with recruiter and company details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS firm_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS office_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_reg_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS official_email_domain TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create update trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Create public.jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('Internship', 'Full Time', 'Part Time', 'Contract', 'Freelance')),
    work_mode TEXT NOT NULL CHECK (work_mode IN ('Remote', 'Hybrid', 'On Site')),
    location TEXT,
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}'::TEXT[],
    eligibility_criteria TEXT[] DEFAULT '{}'::TEXT[],
    required_skills TEXT[] DEFAULT '{}'::TEXT[],
    salary TEXT,
    deadline DATE,
    working_hours TEXT,
    openings INTEGER DEFAULT 1,
    selection_process TEXT[] DEFAULT '{"Application Review", "Resume Shortlisting", "Interview Round", "Final Selection"}'::TEXT[],
    job_status TEXT DEFAULT 'Published' CHECK (job_status IN ('Draft', 'Published', 'Closed', 'Archived')),
    firm_name TEXT,
    firm_logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create update trigger for jobs
DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security on public.jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for public.jobs
-- Policy A: Anyone authenticated can read jobs
DROP POLICY IF EXISTS "Allow read access to jobs for authenticated users" ON public.jobs;
CREATE POLICY "Allow read access to jobs for authenticated users"
ON public.jobs FOR SELECT TO authenticated
USING (true);

-- Policy B: Only the owner recruiter can manage their own jobs (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow recruiters to manage their own jobs" ON public.jobs;
CREATE POLICY "Allow recruiters to manage their own jobs"
ON public.jobs FOR ALL TO authenticated
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);
