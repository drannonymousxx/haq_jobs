-- SQL Migration: Revamp Interview Database Schema for Multi-Round Pipelines, Scorecards, and Private Notes
-- Safe to run multiple times (idempotent).
-- Run this in your Supabase SQL Editor.

-- 1. Drop any existing round constraints first to prevent violation errors during update
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' 
          AND rel.relname = 'interviews' 
          AND con.contype = 'c' 
          AND (con.conname LIKE '%round%' OR con.conname LIKE '%check%')
    LOOP
        EXECUTE 'ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Update round type data safely (migrate existing text to new constraint compatibility)
UPDATE public.interviews SET round = 'Technical Round' WHERE round = 'Technical';
UPDATE public.interviews SET round = 'Custom' WHERE round NOT IN ('HR Screening', 'Technical Round', 'Case Study', 'Partner Round', 'Final HR', 'Custom') OR round IS NULL;

-- 3. Apply the expanded list of rounds check constraint
ALTER TABLE public.interviews ADD CONSTRAINT interviews_round_check CHECK (round IN ('HR Screening', 'Technical Round', 'Case Study', 'Partner Round', 'Final HR', 'Custom'));

-- 4. Add recording and AI fields to the interviews table for future extensibility (as placeholders)
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS recording_status TEXT DEFAULT 'none' CHECK (recording_status IN ('none', 'recording', 'completed', 'failed'));
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS transcript_url TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS meeting_summary TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS ai_score NUMERIC;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- 5. Add reminder columns to prevent duplicate notifications
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS reminder_15m_sent BOOLEAN DEFAULT false;

-- 6. Create structured scorecards table
CREATE TABLE IF NOT EXISTS public.interview_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recommendation TEXT NOT NULL CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create private recruiter notes table (decoupled to ensure candidates cannot access via RLS)
CREATE TABLE IF NOT EXISTS public.private_interview_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Re-create updated update trigger for private_interview_notes
CREATE OR REPLACE FUNCTION public.handle_private_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_private_notes_updated_at ON public.private_interview_notes;
CREATE TRIGGER set_private_notes_updated_at
BEFORE UPDATE ON public.private_interview_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_private_notes_updated_at();

-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS idx_scorecards_interview ON public.interview_scorecards(interview_id);
CREATE INDEX IF NOT EXISTS idx_private_notes_interview ON public.private_interview_notes(interview_id);
CREATE INDEX IF NOT EXISTS idx_private_notes_recruiter ON public.private_interview_notes(recruiter_id);

-- 10. Enable RLS on new tables
ALTER TABLE public.interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_interview_notes ENABLE ROW LEVEL SECURITY;

-- 11. Row Level Security Policies
-- Scorecards Policies
DROP POLICY IF EXISTS "Allow recruiters to view scorecards" ON public.interview_scorecards;
CREATE POLICY "Allow recruiters to view scorecards" ON public.interview_scorecards
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews i
    JOIN public.job_applications ja ON i.application_id = ja.id
    JOIN public.jobs j ON ja.job_id = j.id::text
    WHERE i.id = interview_scorecards.interview_id AND j.recruiter_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow recruiters to manage scorecards" ON public.interview_scorecards;
CREATE POLICY "Allow recruiters to manage scorecards" ON public.interview_scorecards
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews i
    JOIN public.job_applications ja ON i.application_id = ja.id
    JOIN public.jobs j ON ja.job_id = j.id::text
    WHERE i.id = interview_scorecards.interview_id AND j.recruiter_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews i
    JOIN public.job_applications ja ON i.application_id = ja.id
    JOIN public.jobs j ON ja.job_id = j.id::text
    WHERE i.id = interview_scorecards.interview_id AND j.recruiter_id = auth.uid()
  )
);

-- Private Notes Policies (Recruiter specific ONLY)
DROP POLICY IF EXISTS "Allow recruiters to manage their own notes" ON public.private_interview_notes;
CREATE POLICY "Allow recruiters to manage their own notes" ON public.private_interview_notes
FOR ALL TO authenticated
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

-- 12. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
