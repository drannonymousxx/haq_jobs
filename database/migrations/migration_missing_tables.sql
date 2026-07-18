-- Migration: Create Missing Tables, Setup RPC System Trigger, and RLS Policies
-- Safe to run multiple times (idempotent).
-- Run this in your Supabase SQL Editor.

-- =========================================================================
-- 1. CREATE MISSING CHILD TABLES
-- =========================================================================

-- messages table (sender_id is nullable to support system-generated messages natively)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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


-- =========================================================================
-- 2. CREATE SECURITY DEFINER RPC FOR SYSTEM EVENTS (Prevents spoofing)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.trigger_system_event(
    p_user_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_type TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_attachment_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- 1. Insert into public.notifications
    INSERT INTO public.notifications (user_id, title, content, type, reference_id, reference_type)
    VALUES (p_user_id, p_title, p_content, p_type, p_reference_id, p_reference_type);
    
    -- 2. Insert into public.messages (sender_id IS NULL denotes official system bot)
    INSERT INTO public.messages (sender_id, recipient_id, content, message_type, attachment_url)
    VALUES (NULL, p_user_id, p_content, p_type, p_attachment_url);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- 3. CREATE OPTIMIZATION INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_interviews_app ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_app ON public.offers(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);


-- =========================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 5. CONFIGURE ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Messages SELECT Policy
DROP POLICY IF EXISTS "Allow users to read their own messages" ON public.messages;
CREATE POLICY "Allow users to read their own messages" 
ON public.messages FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR sender_id IS NULL);

-- Messages INSERT Policy (Strictly restricts users to only insert messages AS themselves)
DROP POLICY IF EXISTS "Allow users to send messages" ON public.messages;
CREATE POLICY "Allow users to send messages" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);

-- Messages UPDATE Policy (Allows recipients to mark messages as read persistently)
DROP POLICY IF EXISTS "Allow recipients to update message status" ON public.messages;
CREATE POLICY "Allow recipients to update message status" 
ON public.messages FOR UPDATE TO authenticated 
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Interviews SELECT Policy
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

-- Interviews Recruiters Manage Policy
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

-- Interviews Candidates Update Policy
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

-- Offers SELECT Policy
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

-- Offers Recruiters Manage Policy
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

-- Offers Candidates Update Policy
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

-- Notifications SELECT Policy
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
CREATE POLICY "Allow users to read their own notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Notifications INSERT Policy
DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated to insert notifications" 
ON public.notifications FOR INSERT TO authenticated 
WITH CHECK (true);

-- Notifications UPDATE Policy
DROP POLICY IF EXISTS "Allow users to update their own notifications" ON public.notifications;
CREATE POLICY "Allow users to update their own notifications" 
ON public.notifications FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications DELETE Policy
DROP POLICY IF EXISTS "Allow users to delete their own notifications" ON public.notifications;
CREATE POLICY "Allow users to delete their own notifications" 
ON public.notifications FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Recruiter UPDATE Application Status Policy
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


-- =========================================================================
-- 6. RELOAD SCHEMA CACHE & APPLY LATEST SCHEMA CONSTRAINTS
-- =========================================================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check CHECK (message_type IN ('text', 'image', 'file', 'system', 'interview', 'offer', 'rejection', 'shortlist', 'cancelled'));

-- Signals PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
