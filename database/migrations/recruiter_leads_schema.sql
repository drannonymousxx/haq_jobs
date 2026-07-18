-- SQL Migration: Recruiter Leads / Consultation Lead Capture System
-- Run this in your Supabase SQL Editor.

-- =========================================================================
-- 1. CREATE TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.recruiter_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    contact_name TEXT,
    role TEXT,
    hiring_locations TEXT, -- Store location selection string
    company_headcount TEXT,
    expected_hires TEXT,
    hiring_timeline TEXT,
    interested_plan TEXT,
    additional_notes TEXT,
    source TEXT DEFAULT 'companies-page' NOT NULL,
    status TEXT DEFAULT 'NEW' NOT NULL CHECK (status IN ('NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'NEGOTIATING', 'CONVERTED', 'CLOSED')),
    
    -- Analytics & Conversion fields
    converted_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Future CRM / Sales fields
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    conversion_source TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. CREATE SEARCH INDEXES
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_recruiter_leads_email ON public.recruiter_leads(work_email);
CREATE INDEX IF NOT EXISTS idx_recruiter_leads_status ON public.recruiter_leads(status);
CREATE INDEX IF NOT EXISTS idx_recruiter_leads_converted_user ON public.recruiter_leads(converted_user_id);

-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.recruiter_leads ENABLE ROW LEVEL SECURITY;

-- Deny public reading, updating, deleting. Only allow database administrators (using service role) 
-- or internal database functions to execute SELECT / UPDATE queries.
-- Public users can ONLY insert.

DROP POLICY IF EXISTS "Allow public insert to recruiter_leads" ON public.recruiter_leads;
CREATE POLICY "Allow public insert to recruiter_leads" 
ON public.recruiter_leads FOR INSERT 
WITH CHECK (true);

-- =========================================================================
-- 4. CREATE SECURITY DEFINER RPC FUNCTIONS (Bypasses RLS safely on server-side)
-- =========================================================================

-- Function 1: Submit lead (handles duplicate check and honeypot validation)
CREATE OR REPLACE FUNCTION public.submit_recruiter_lead(
    p_company_name TEXT,
    p_work_email TEXT,
    p_phone TEXT,
    p_website TEXT,
    p_contact_name TEXT,
    p_role TEXT,
    p_hiring_locations TEXT,
    p_company_headcount TEXT,
    p_expected_hires TEXT,
    p_hiring_timeline TEXT,
    p_interested_plan TEXT,
    p_additional_notes TEXT,
    p_source TEXT,
    p_honeypot TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_lead_id UUID;
    v_clean_email TEXT;
BEGIN
    -- 1. Honeypot check for spam protection
    IF p_honeypot IS NOT NULL AND p_honeypot <> '' THEN
        RETURN FALSE; -- Silent reject
    END IF;

    -- 2. Basic email validation
    v_clean_email := LOWER(TRIM(p_work_email));
    IF POSITION('@' IN v_clean_email) = 0 THEN
        RAISE EXCEPTION 'Invalid work email format.';
    END IF;

    -- 3. Check for existing, unconverted lead with same email
    SELECT id INTO v_lead_id 
    FROM public.recruiter_leads
    WHERE work_email = v_clean_email AND status <> 'CONVERTED'
    LIMIT 1;

    -- 4. Insert or Update
    IF v_lead_id IS NOT NULL THEN
        UPDATE public.recruiter_leads
        SET company_name = p_company_name,
            phone = p_phone,
            website = p_website,
            contact_name = p_contact_name,
            role = p_role,
            hiring_locations = p_hiring_locations,
            company_headcount = p_company_headcount,
            expected_hires = p_expected_hires,
            hiring_timeline = p_hiring_timeline,
            interested_plan = p_interested_plan,
            additional_notes = p_additional_notes,
            source = p_source,
            last_activity_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_lead_id;
    ELSE
        INSERT INTO public.recruiter_leads (
            company_name,
            work_email,
            phone,
            website,
            contact_name,
            role,
            hiring_locations,
            company_headcount,
            expected_hires,
            hiring_timeline,
            interested_plan,
            additional_notes,
            source,
            status,
            first_seen_at,
            last_activity_at
        ) VALUES (
            p_company_name,
            v_clean_email,
            p_phone,
            p_website,
            p_contact_name,
            p_role,
            p_hiring_locations,
            p_company_headcount,
            p_expected_hires,
            p_hiring_timeline,
            p_interested_plan,
            p_additional_notes,
            p_source,
            'NEW',
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function 2: Convert existing lead (links profile ID when recruiter registers)
CREATE OR REPLACE FUNCTION public.convert_recruiter_lead(
    p_email TEXT,
    p_profile_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    
    UPDATE public.recruiter_leads
    SET status = 'CONVERTED',
        converted_user_id = p_profile_id,
        converted_at = timezone('utc'::text, now()),
        last_activity_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now()),
        conversion_source = 'signup'
    WHERE work_email = v_clean_email AND status <> 'CONVERTED';
    
    IF FOUND THEN
        v_updated := TRUE;
    END IF;
    
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload postgrest cache
NOTIFY pgrst, 'reload schema';
