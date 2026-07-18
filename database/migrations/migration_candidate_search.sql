-- Migration: Sync Profile Schema Columns & Add Candidate Search Function
-- Safe to run multiple times (idempotent).
-- Run this in your Supabase SQL Editor.

-- =========================================================================
-- 1. ADD CANDIDATE COLUMNS TO PROFILES TABLE & UPDATE CONSTRAINTS
-- =========================================================================
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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_search_status TEXT DEFAULT 'Open to Opportunities';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;

-- Safely apply CHECK constraints if they don't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_visibility_check'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_visibility_check CHECK (visibility IN ('public', 'recruiters_only', 'private'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_job_search_status_check'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_job_search_status_check CHECK (job_search_status IN ('Ready to Interview', 'Open to Opportunities', 'Not Looking'));
    END IF;
END $$;

-- Expand interviews status CHECK constraint to accept 'cancelled'
ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS interviews_status_check;
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'reschedule_requested', 'cancelled'));


-- =========================================================================
-- 2. CREATE OR REPLACE SEARCH FUNCTION
-- =========================================================================
CREATE OR REPLACE FUNCTION public.search_candidates(
    p_query TEXT DEFAULT '',
    p_practice_areas TEXT[] DEFAULT NULL,
    p_locations TEXT[] DEFAULT NULL,
    p_employment_types TEXT[] DEFAULT NULL,
    p_job_statuses TEXT[] DEFAULT NULL,
    p_skills TEXT[] DEFAULT NULL,
    p_verified_only BOOLEAN DEFAULT FALSE,
    p_sort_by TEXT DEFAULT 'relevant',
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    city TEXT,
    state TEXT,
    bio TEXT,
    profile_photo_url TEXT,
    designation TEXT,
    company_name TEXT,
    legal_specializations TEXT[],
    career_preferences TEXT[],
    job_search_status TEXT,
    state_bar_council TEXT,
    bar_enrollment_number TEXT,
    skills TEXT[],
    experience_details JSONB,
    education_details JSONB,
    years_of_experience NUMERIC,
    current_organization TEXT,
    completion INTEGER,
    total_count BIGINT
) AS $$
DECLARE
    search_term TEXT;
BEGIN
    -- Prepare lowercase search query with wildcards
    search_term := '%' || LOWER(COALESCE(p_query, '')) || '%';

    RETURN QUERY
    WITH candidate_details AS (
        SELECT 
            p.id,
            p.full_name,
            p.email,
            p.role,
            p.city,
            p.state,
            p.bio,
            p.profile_photo_url,
            p.designation,
            p.company_name,
            p.legal_specializations,
            p.career_preferences,
            p.job_search_status,
            p.state_bar_council,
            p.bar_enrollment_number,
            -- Aggregate skills list for candidate
            COALESCE((
                SELECT array_agg(cs.skill) 
                FROM public.candidate_skills cs 
                WHERE cs.profile_id = p.id
            ), '{}'::text[]) AS skills,
            -- Group experiences into a single search string
            COALESCE((
                SELECT string_agg(ex.firm_name || ' ' || ex.position || ' ' || COALESCE(ex.description, ''), ' ')
                FROM public.experiences ex 
                WHERE ex.profile_id = p.id
            ), '') AS exp_text,
            -- Group experiences as structured JSONB list for cards
            COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                    'firm_name', ex.firm_name,
                    'position', ex.position,
                    'currently_working', ex.currently_working,
                    'start_date', ex.start_date,
                    'end_date', ex.end_date
                ) ORDER BY ex.start_date DESC)
                FROM public.experiences ex
                WHERE ex.profile_id = p.id
            ), '[]'::jsonb) AS exp_json,
            -- Group educations into a single search string
            COALESCE((
                SELECT string_agg(ed.university_name || ' ' || ed.degree || ' ' || COALESCE(ed.specialization, ''), ' ')
                FROM public.educations ed 
                WHERE ed.profile_id = p.id
            ), '') AS edu_text,
            -- Group educations as structured JSONB list for cards
            COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                    'university_name', ed.university_name,
                    'degree', ed.degree,
                    'passing_year', ed.passing_year
                ) ORDER BY ed.passing_year DESC)
                FROM public.educations ed
                WHERE ed.profile_id = p.id
            ), '[]'::jsonb) AS edu_json,
            -- Calculate total experience duration in days for sorting
            COALESCE((
                SELECT SUM(COALESCE(ex.end_date, CURRENT_DATE) - ex.start_date)
                FROM public.experiences ex
                WHERE ex.profile_id = p.id
            ), 0) AS exp_days,
            -- Resolve active/current organization
            COALESCE((
                SELECT ex.firm_name 
                FROM public.experiences ex 
                WHERE ex.profile_id = p.id 
                ORDER BY ex.currently_working DESC, ex.start_date DESC NULLS LAST
                LIMIT 1
            ), '') AS current_org,
            -- Calculate profile completion percentage
            (
                (CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 20 ELSE 0 END) +
                (CASE WHEN p.profile_photo_url IS NOT NULL AND p.profile_photo_url != '' THEN 20 ELSE 0 END) +
                (CASE WHEN p.legal_specializations IS NOT NULL AND array_length(p.legal_specializations, 1) > 0 THEN 20 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM public.experiences ex WHERE ex.profile_id = p.id) THEN 20 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM public.educations ed WHERE ed.profile_id = p.id) THEN 20 ELSE 0 END)
            ) AS comp_score,
            -- Registration date for sorting
            p.created_at
        FROM 
            public.profiles p
        WHERE 
            p.role = 'candidate'
            AND (p.visibility IS NULL OR p.visibility != 'private')
    ),
    filtered_candidates AS (
        SELECT 
            cd.*
        FROM 
            candidate_details cd
        WHERE
            -- 1. Full Text Search
            (
                p_query = '' OR p_query IS NULL
                OR LOWER(cd.full_name) LIKE search_term
                OR LOWER(cd.bio) LIKE search_term
                OR LOWER(cd.designation) LIKE search_term
                OR LOWER(cd.company_name) LIKE search_term
                OR LOWER(cd.city) LIKE search_term
                OR LOWER(cd.state) LIKE search_term
                OR LOWER(cd.state_bar_council) LIKE search_term
                OR LOWER(cd.bar_enrollment_number) LIKE search_term
                OR cd.legal_specializations @> ARRAY[p_query]
                OR cd.career_preferences @> ARRAY[p_query]
                OR EXISTS (
                    SELECT 1 FROM unnest(cd.legal_specializations) spec
                    WHERE LOWER(spec) LIKE search_term
                )
                OR EXISTS (
                    SELECT 1 FROM unnest(cd.skills) sk
                    WHERE LOWER(sk) LIKE search_term
                )
                OR LOWER(cd.exp_text) LIKE search_term
                OR LOWER(cd.edu_text) LIKE search_term
            )
            -- 2. Multi-Select Practice Area filters
            AND (p_practice_areas IS NULL OR p_practice_areas = '{}'::text[] OR cd.legal_specializations && p_practice_areas)
            -- 3. Multi-Select Location filters
            AND (p_locations IS NULL OR p_locations = '{}'::text[] OR cd.city = ANY(p_locations) OR cd.state = ANY(p_locations))
            -- 4. Multi-Select Employment Type filters (matches candidate career preferences)
            AND (p_employment_types IS NULL OR p_employment_types = '{}'::text[] OR cd.career_preferences && p_employment_types)
            -- 5. Multi-Select Job Search Status filters
            AND (p_job_statuses IS NULL OR p_job_statuses = '{}'::text[] OR cd.job_search_status = ANY(p_job_statuses))
            -- 6. Multi-Select Skills filters
            AND (p_skills IS NULL OR p_skills = '{}'::text[] OR cd.skills && p_skills)
            -- 7. Verified Only filter (requires bar enrollment)
            AND (NOT p_verified_only OR (cd.bar_enrollment_number IS NOT NULL AND cd.bar_enrollment_number != ''))
    ),
    counted_candidates AS (
        SELECT COUNT(*) OVER() AS total_count_all, fc.* FROM filtered_candidates fc
    )
    SELECT 
        cc.id,
        cc.full_name,
        cc.email,
        cc.role,
        cc.city,
        cc.state,
        cc.bio,
        cc.profile_photo_url,
        cc.designation,
        cc.company_name,
        cc.legal_specializations,
        cc.career_preferences,
        cc.job_search_status,
        cc.state_bar_council,
        cc.bar_enrollment_number,
        cc.skills,
        cc.exp_json,
        cc.edu_json,
        ROUND((cc.exp_days::NUMERIC / 365.25), 1) AS years_of_experience,
        cc.current_org AS current_organization,
        cc.comp_score AS completion,
        cc.total_count_all
    FROM 
        counted_candidates cc
    ORDER BY
        CASE 
            WHEN p_sort_by = 'newest' THEN cc.created_at
        END DESC,
        CASE
            WHEN p_sort_by = 'experience' THEN cc.exp_days
        END DESC,
        CASE
            WHEN p_sort_by = 'alphabetical' THEN cc.full_name
        END ASC,
        -- Default (relevant or recently active) sort by created_at desc
        cc.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.search_candidates TO postgres, service_role, authenticated, anon;

-- Messages UPDATE Policy (Allows recipients to mark messages as read persistently)
DROP POLICY IF EXISTS "Allow recipients to update message status" ON public.messages;
CREATE POLICY "Allow recipients to update message status" 
ON public.messages FOR UPDATE TO authenticated 
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Force PostgREST cache update
NOTIFY pgrst, 'reload schema';
