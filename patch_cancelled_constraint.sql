-- SQL Patch: Update interviews table status constraint to allow 'cancelled'
-- Run this in your Supabase SQL Editor.

ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS interviews_status_check;
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'reschedule_requested', 'cancelled'));

-- Force PostgREST schema cache update
NOTIFY pgrst, 'reload schema';
