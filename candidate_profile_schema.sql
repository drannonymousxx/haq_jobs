-- Migration: Extend profiles and create candidate profile system tables

-- 1. Extend profiles table with candidate specific columns
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

-- 2. Create experiences table
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

-- Enable RLS for experiences
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to experiences for authenticated users"
ON public.experiences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to experiences for owners"
ON public.experiences FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 3. Create educations table
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

-- Enable RLS for educations
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to educations for authenticated users"
ON public.educations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to educations for owners"
ON public.educations FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 4. Create candidate_skills table
CREATE TABLE IF NOT EXISTS public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill TEXT NOT NULL,
    UNIQUE (profile_id, skill)
);

-- Enable RLS for candidate_skills
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to skills for authenticated users"
ON public.candidate_skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to skills for owners"
ON public.candidate_skills FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 5. Create candidate_documents table
CREATE TABLE IF NOT EXISTS public.candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'resume', 'education_certificate', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for candidate_documents
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to documents for authenticated users"
ON public.candidate_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to documents for owners"
ON public.candidate_documents FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 6. Create saved_jobs table (for bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, job_id)
);

-- Enable RLS for saved_jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow owner to manage saved_jobs"
ON public.saved_jobs FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 7. Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id TEXT NOT NULL,
    status TEXT DEFAULT 'applied' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, job_id)
);

-- Enable RLS for job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read job_applications"
ON public.job_applications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow candidate to insert/update their own application"
ON public.job_applications FOR ALL TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);


-- 8. Create profile_views table
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Candidates can see who viewed their profile
CREATE POLICY "Allow candidate to read their own profile views"
ON public.profile_views FOR SELECT TO authenticated
USING (auth.uid() = candidate_id);

-- Anyone authenticated can insert a view (e.g. recruiter)
CREATE POLICY "Allow authenticated users to insert profile views"
ON public.profile_views FOR INSERT TO authenticated
WITH CHECK (auth.uid() = viewer_id);

-- Create a unique constraint index to prevent duplicate views by the same recruiter on the same day
CREATE UNIQUE INDEX IF NOT EXISTS profile_views_one_per_day
ON public.profile_views (candidate_id, viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));


-- 9. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to reviews for authenticated users"
ON public.reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow recruiter to create a review"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reviewer_id);


-- 10. Create recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommender_name TEXT NOT NULL,
    relationship TEXT,
    recommendation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to recommendations for authenticated users"
ON public.recommendations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow writing recommendations for authenticated users"
ON public.recommendations FOR INSERT TO authenticated
WITH CHECK (true);


-- 11. Create storage bucket and setup policies
-- Check if bucket exists and insert if not
INSERT INTO storage.buckets (id, name, public)
VALUES ('haqjobs', 'haqjobs', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to haqjobs files
CREATE POLICY "Public read access to haqjobs storage"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'haqjobs');

-- Authenticated upload access to haqjobs files inside folders profile-images, resumes, education-certificates
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
