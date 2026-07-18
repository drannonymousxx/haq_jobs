-- Migration: Unified HAQJobs Database Schema Setup
-- Safe to run multiple times (idempotent).
-- Run this in your Supabase SQL Editor.

-- =========================================================================
-- 1. EXTEND PROFILES TABLE WITH CANDIDATE & RECRUITER COLUMNS
-- =========================================================================

-- Base profiles table check/creation (if it does not exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('candidate', 'recruiter')),
    company_name TEXT,
    designation TEXT,
    job_search_status TEXT DEFAULT 'Open to Opportunities' CHECK (job_search_status IN ('Ready to Interview', 'Open to Opportunities', 'Not Looking')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Candidate-specific columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career_preferences TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legal_specializations TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bar_enrollment_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_bar_council TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tribunal_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'recruiters_only', 'private'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_search_status TEXT DEFAULT 'Open to Opportunities' CHECK (job_search_status IN ('Ready to Interview', 'Open to Opportunities', 'Not Looking'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;

-- Recruiter/Company-specific columns
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

-- Create handle_updated_at function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- =========================================================================
-- SEED SYSTEM USER & SYSTEM PROFILE (Production-Safe RLS Compliant)
-- =========================================================================

-- Seed the System User in auth.users (so foreign key constraint is satisfied)
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  role,
  aud,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@haqjobs.hq',
  '{"full_name": "HAQJobs System", "role": "recruiter"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Seed the System Profile in public.profiles
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  company_name,
  designation,
  profile_photo_url
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'HAQJobs System',
  'system@haqjobs.hq',
  'recruiter',
  'HAQJobs HQ',
  'System Administrator',
  '/logohalf.png'
)
ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name,
  designation = EXCLUDED.designation,
  profile_photo_url = EXCLUDED.profile_photo_url;


-- =========================================================================
-- 2. CREATE CHILD TABLES
-- =========================================================================

-- experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    firm_name TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    currently_working BOOLEAN DEFAULT false NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- educations table
CREATE TABLE IF NOT EXISTS public.educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    university_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    specialization TEXT,
    passing_year INTEGER NOT NULL,
    cgpa_percentage TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- candidate_skills table
CREATE TABLE IF NOT EXISTS public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill TEXT NOT NULL,
    UNIQUE (profile_id, skill)
);

-- candidate_documents table
CREATE TABLE IF NOT EXISTS public.candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'resume', 'education_certificate', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- jobs table (recruiter opportunity posts)
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

-- saved_jobs table (candidate bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, job_id)
);

-- job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id TEXT NOT NULL,
    status TEXT DEFAULT 'applied' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, job_id)
);

-- profile_views table
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique index to prevent duplicate recruiter views on same candidate in same calendar day
CREATE UNIQUE INDEX IF NOT EXISTS profile_views_one_per_day
ON public.profile_views (candidate_id, viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));

-- reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommender_name TEXT NOT NULL,
    relationship TEXT,
    recommendation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 4. CONFIGURE RLS SECURITY POLICIES
-- =========================================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Allow read access to profiles for authenticated users" ON public.profiles;
CREATE POLICY "Allow read access to profiles for authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Experiences Policies
DROP POLICY IF EXISTS "Allow read access to experiences for authenticated users" ON public.experiences;
CREATE POLICY "Allow read access to experiences for authenticated users"
ON public.experiences FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write access to experiences for owners" ON public.experiences;
CREATE POLICY "Allow write access to experiences for owners"
ON public.experiences FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Educations Policies
DROP POLICY IF EXISTS "Allow read access to educations for authenticated users" ON public.educations;
CREATE POLICY "Allow read access to educations for authenticated users"
ON public.educations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write access to educations for owners" ON public.educations;
CREATE POLICY "Allow write access to educations for owners"
ON public.educations FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Candidate Skills Policies
DROP POLICY IF EXISTS "Allow read access to skills for authenticated users" ON public.candidate_skills;
CREATE POLICY "Allow read access to skills for authenticated users"
ON public.candidate_skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write access to skills for owners" ON public.candidate_skills;
CREATE POLICY "Allow write access to skills for owners"
ON public.candidate_skills FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Candidate Documents Policies
DROP POLICY IF EXISTS "Allow read access to documents for authenticated users" ON public.candidate_documents;
CREATE POLICY "Allow read access to documents for authenticated users"
ON public.candidate_documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write access to documents for owners" ON public.candidate_documents;
CREATE POLICY "Allow write access to documents for owners"
ON public.candidate_documents FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Jobs Policies
DROP POLICY IF EXISTS "Allow read access to jobs for authenticated users" ON public.jobs;
CREATE POLICY "Allow read access to jobs for authenticated users"
ON public.jobs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow recruiters to manage their own jobs" ON public.jobs;
CREATE POLICY "Allow recruiters to manage their own jobs"
ON public.jobs FOR ALL TO authenticated USING (auth.uid() = recruiter_id) WITH CHECK (auth.uid() = recruiter_id);

-- Saved Jobs Policies
DROP POLICY IF EXISTS "Allow owner to manage saved_jobs" ON public.saved_jobs;
CREATE POLICY "Allow owner to manage saved_jobs"
ON public.saved_jobs FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Job Applications Policies
DROP POLICY IF EXISTS "Allow authenticated users to read job_applications" ON public.job_applications;
CREATE POLICY "Allow authenticated users to read job_applications"
ON public.job_applications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow candidate to insert/update their own application" ON public.job_applications;
CREATE POLICY "Allow candidate to insert/update their own application"
ON public.job_applications FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Profile Views Policies
DROP POLICY IF EXISTS "Allow candidate or viewer to read profile views" ON public.profile_views;
CREATE POLICY "Allow candidate or viewer to read profile views"
ON public.profile_views FOR SELECT TO authenticated USING (auth.uid() = candidate_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Allow authenticated users to insert profile views" ON public.profile_views;
CREATE POLICY "Allow authenticated users to insert profile views"
ON public.profile_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- Reviews Policies
DROP POLICY IF EXISTS "Allow read access to reviews for authenticated users" ON public.reviews;
CREATE POLICY "Allow read access to reviews for authenticated users"
ON public.reviews FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow recruiter to create a review" ON public.reviews;
CREATE POLICY "Allow recruiter to create a review"
ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Recommendations Policies
DROP POLICY IF EXISTS "Allow read access to recommendations for authenticated users" ON public.recommendations;
CREATE POLICY "Allow read access to recommendations for authenticated users"
ON public.recommendations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow writing recommendations for authenticated users" ON public.recommendations;
CREATE POLICY "Allow writing recommendations for authenticated users"
ON public.recommendations FOR INSERT TO authenticated WITH CHECK (true);


-- =========================================================================
-- 5. CONFIGURE STORAGE BUCKETS AND STORAGE POLICIES
-- =========================================================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('haqjobs', 'haqjobs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to avoid duplicate/conflict errors
DROP POLICY IF EXISTS "Public read access to haqjobs storage" ON storage.objects;
DROP POLICY IF EXISTS "Owner upload access to haqjobs storage" ON storage.objects;
DROP POLICY IF EXISTS "Owner update access to haqjobs storage" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete access to haqjobs storage" ON storage.objects;

-- Enable Public read access to haqjobs bucket files
CREATE POLICY "Public read access to haqjobs storage"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'haqjobs');

-- Authenticated upload access to haqjobs files inside specific subfolders owned by the user
CREATE POLICY "Owner upload access to haqjobs storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'haqjobs' AND
  (storage.foldername(name))[1] IN ('profile-images', 'resumes', 'education-certificates') AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Owner update access to haqjobs files
CREATE POLICY "Owner update access to haqjobs storage"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'haqjobs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Owner delete access to haqjobs files
CREATE POLICY "Owner delete access to haqjobs storage"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'haqjobs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- =========================================================================
-- 6. CREATE MESSAGES, INTERVIEWS, OFFERS, AND NOTIFICATIONS TABLES
-- =========================================================================

-- messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    attachment_url TEXT,
    message_type TEXT DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'system', 'interview', 'offer', 'rejection', 'shortlist', 'cancelled')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('online', 'offline', 'phone')),
    meeting_link TEXT,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'reschedule_requested')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
    position TEXT NOT NULL,
    salary TEXT NOT NULL,
    joining_date DATE NOT NULL,
    employment_type TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    type TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_interviews_app ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_app ON public.offers(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Enable RLS on new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Configure RLS policies
DROP POLICY IF EXISTS "Allow users to read their own messages" ON public.messages;
CREATE POLICY "Allow users to read their own messages" 
ON public.messages FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Allow users to send messages" ON public.messages;
CREATE POLICY "Allow users to send messages" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id OR sender_id = '00000000-0000-0000-0000-000000000000');

-- Interviews Select RLS Policy
DROP POLICY IF EXISTS "Allow authenticated to view interviews" ON public.interviews;
DROP POLICY IF EXISTS "Allow users to view interviews" ON public.interviews;
CREATE POLICY "Allow users to view interviews" ON public.interviews 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
);

-- Interviews Recruiters Manage RLS Policy
DROP POLICY IF EXISTS "Allow authenticated to manage interviews" ON public.interviews;
DROP POLICY IF EXISTS "Allow recruiters to manage interviews" ON public.interviews;
CREATE POLICY "Allow recruiters to manage interviews" ON public.interviews 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
);

-- Interviews Candidates Update status RLS Policy
DROP POLICY IF EXISTS "Allow candidates to update interview status" ON public.interviews;
CREATE POLICY "Allow candidates to update interview status" ON public.interviews
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  )
);

-- Offers Select RLS Policy
DROP POLICY IF EXISTS "Allow authenticated to view offers" ON public.offers;
DROP POLICY IF EXISTS "Allow users to view offers" ON public.offers;
CREATE POLICY "Allow users to view offers" ON public.offers 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
);

-- Offers Recruiters Manage RLS Policy
DROP POLICY IF EXISTS "Allow authenticated to manage offers" ON public.offers;
DROP POLICY IF EXISTS "Allow recruiters to manage offers" ON public.offers;
CREATE POLICY "Allow recruiters to manage offers" ON public.offers 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_applications ja 
    JOIN public.jobs j ON ja.job_id = j.id::text 
    WHERE ja.id = application_id AND j.recruiter_id = auth.uid()
  )
);

-- Offers Candidates Update status RLS Policy
DROP POLICY IF EXISTS "Allow candidates to update offer status" ON public.offers;
CREATE POLICY "Allow candidates to update offer status" ON public.offers
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE id = application_id AND profile_id = auth.uid()
  )
);

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
CREATE POLICY "Allow users to read their own notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated to insert notifications" 
ON public.notifications FOR INSERT TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update their own notifications" ON public.notifications;
CREATE POLICY "Allow users to update their own notifications" 
ON public.notifications FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own notifications" ON public.notifications;
CREATE POLICY "Allow users to delete their own notifications" 
ON public.notifications FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Recruiter update application policy
DROP POLICY IF EXISTS "Allow recruiters to update applications for their jobs" ON public.job_applications;
CREATE POLICY "Allow recruiters to update applications for their jobs"
ON public.job_applications FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = job_applications.job_id AND j.recruiter_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = job_applications.job_id AND j.recruiter_id = auth.uid()
  )
);

-- ALTER TABLE updates to apply on existing databases
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check CHECK (message_type IN ('text', 'image', 'file', 'system', 'interview', 'offer', 'rejection', 'shortlist', 'cancelled'));

-- Reload PostgREST schema cache to reflect updates instantly
NOTIFY pgrst, 'reload schema';
