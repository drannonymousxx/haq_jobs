-- SQL Migration: Extend interviews table for LiveKit Video Calling and Status Lifecycle
-- Safe to run multiple times (idempotent).
-- Run this in your Supabase SQL Editor.

-- 1. Add missing reference and descriptor columns
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS round TEXT CHECK (round IN ('HR Screening', 'Technical', 'Legal Interview', 'Partner Round', 'Final Round'));

-- 2. Drop and recreate status check constraint to support full lifecycle
ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS interviews_status_check;
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'reschedule_requested', 'cancelled', 'completed', 'no_show'));

-- 3. Create performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_interviews_job ON public.interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter ON public.interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);

-- 4. Backfill existing interview rows
UPDATE public.interviews i
SET 
  job_id = ja.job_id::uuid,
  candidate_id = ja.profile_id,
  recruiter_id = j.recruiter_id,
  round = 'Legal Interview'
FROM public.job_applications ja
JOIN public.jobs j ON ja.job_id = j.id::text
WHERE i.application_id = ja.id
  AND i.job_id IS NULL;

-- 5. Re-apply select policies to respect new direct references
DROP POLICY IF EXISTS "Allow users to view interviews" ON public.interviews;
CREATE POLICY "Allow users to view interviews" ON public.interviews 
FOR SELECT TO authenticated 
USING (
  auth.uid() = candidate_id OR 
  auth.uid() = recruiter_id OR
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

-- 6. Re-apply candidates update policies to support accept/decline/reschedule
DROP POLICY IF EXISTS "Allow candidates to update interview status" ON public.interviews;
CREATE POLICY "Allow candidates to update interview status" ON public.interviews
FOR UPDATE TO authenticated
USING (auth.uid() = candidate_id)
WITH CHECK (auth.uid() = candidate_id);

-- Reload PostgREST schema cache to reflect updates instantly
NOTIFY pgrst, 'reload schema';
