-- Migration: Create profiles table for HAQJobs candidates and recruiters
-- Run this in your Supabase SQL Editor to set up the database tables and policies.

-- Create profiles table
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- 1. Allow public or authenticated users to read profiles
-- (Needed so that job applications, company details, etc. can be verified)
CREATE POLICY "Allow read access to profiles for authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Allow users to insert their own profile
-- (Needed during the signup callback/process)
CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
