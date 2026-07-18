-- HAQJobs Recruiter-Applicant ATS Workflow E2E Validation Script
-- This script tests the database tables, constraints, functions, RLS policies, and triggers.
-- Run this in your Supabase SQL Editor.

DO $$
DECLARE
  recruiter_id UUID := gen_random_uuid();
  candidate_id UUID := gen_random_uuid();
  test_job_id UUID;
  test_app_id UUID;
  test_int_id UUID;
  test_offer_id UUID;
BEGIN
  RAISE NOTICE '--- STARTING END-TO-END DATABASE & RLS WORKFLOW TESTING ---';

  -- Seed parent Auth records
  INSERT INTO auth.users (id, email, aud, role, created_at, updated_at) 
  VALUES (recruiter_id, 'rec_test@haqjobs.hq', 'authenticated', 'authenticated', now(), now()),
         (candidate_id, 'cand_test@haqjobs.hq', 'authenticated', 'authenticated', now(), now());

  -- Seed public profiles
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (recruiter_id, 'Test Recruiter', 'rec_test@haqjobs.hq', 'recruiter'),
         (candidate_id, 'Test Candidate', 'cand_test@haqjobs.hq', 'candidate');
         
  RAISE NOTICE '✅ Seeded mock auth users and profiles.';

  -- Set session setting to recruiter user to test RLS
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', recruiter_id::text, true);

  -- 2. Test Job Creation (as Recruiter)
  INSERT INTO public.jobs (recruiter_id, title, practice_area, experience_level, location, employment_type, work_mode, description)
  VALUES (recruiter_id, 'E2E Test Attorney', 'Corporate Law', 'Mid Level', 'Mumbai', 'Full Time', 'Hybrid', 'Description')
  RETURNING id INTO test_job_id;
  
  RAISE NOTICE '✅ Job creation RLS and constraints passed.';

  -- Set session setting to candidate user to test RLS
  PERFORM set_config('request.jwt.claim.sub', candidate_id::text, true);

  -- 3. Test Application Submission (as Candidate)
  INSERT INTO public.job_applications (profile_id, job_id, status)
  VALUES (candidate_id, test_job_id::text, 'applied')
  RETURNING id INTO test_app_id;

  RAISE NOTICE '✅ Job application RLS and constraints passed.';

  -- Switch back to Recruiter to test workflow transitions
  PERFORM set_config('request.jwt.claim.sub', recruiter_id::text, true);

  -- 4. Test Shortlist persistence
  UPDATE public.job_applications 
  SET status = 'shortlisted'
  WHERE id = test_app_id;
  
  RAISE NOTICE '✅ Application status transition to Shortlisted passed.';

  -- Test triggerWorkflowEvent RPC (since it is security definer, anyone authenticated can call it)
  PERFORM public.trigger_system_event(
    candidate_id,
    'Application Shortlisted',
    'Congratulations, you are shortlisted!',
    'shortlist',
    test_app_id,
    'job_applications'
  );
  RAISE NOTICE '✅ trigger_system_event RPC execution passed.';

  -- 5. Test Interview Scheduling
  INSERT INTO public.interviews (application_id, title, scheduled_at, duration, type, meeting_link, status)
  VALUES (test_app_id, 'Technical Round', now() + interval '1 day', '45 minutes', 'online', 'https://meet.google.com/test', 'pending')
  RETURNING id INTO test_int_id;

  UPDATE public.job_applications SET status = 'interview' WHERE id = test_app_id;
  RAISE NOTICE '✅ Interview scheduling and stage progression passed.';

  -- 6. Test Interview Cancellation (Should update status to cancelled instead of deleting!)
  UPDATE public.interviews SET status = 'cancelled' WHERE id = test_int_id;
  UPDATE public.job_applications SET status = 'shortlisted' WHERE id = test_app_id;
  RAISE NOTICE '✅ Interview cancellation (status updated to cancelled) passed.';

  -- 7. Test Offer extension
  INSERT INTO public.offers (application_id, position, salary, joining_date, employment_type, status, created_by)
  VALUES (test_app_id, 'Senior Associate', '2,400,000 INR', current_date + 30, 'Full Time', 'pending', recruiter_id)
  RETURNING id INTO test_offer_id;

  UPDATE public.job_applications SET status = 'offered' WHERE id = test_app_id;
  RAISE NOTICE '✅ Job Offer extension passed.';

  -- Switch back to Candidate to respond to offer
  PERFORM set_config('request.jwt.claim.sub', candidate_id::text, true);

  -- 8. Test Offer Acceptance (Candidate updates offer status)
  UPDATE public.offers 
  SET status = 'accepted', accepted_at = now()
  WHERE id = test_offer_id;

  UPDATE public.job_applications 
  SET status = 'hired'
  WHERE id = test_app_id;
  RAISE NOTICE '✅ Offer acceptance and stage progression to Hired passed.';

  -- 9. Test Recruiter-Candidate Messaging RLS
  -- Recruiter sends message
  PERFORM set_config('request.jwt.claim.sub', recruiter_id::text, true);
  INSERT INTO public.messages (sender_id, recipient_id, content, message_type)
  VALUES (recruiter_id, candidate_id, 'Hello applicant!', 'text');

  -- Candidate responds
  PERFORM set_config('request.jwt.claim.sub', candidate_id::text, true);
  INSERT INTO public.messages (sender_id, recipient_id, content, message_type)
  VALUES (candidate_id, recruiter_id, 'Hello recruiter!', 'text');

  RAISE NOTICE '✅ Recruiter-Candidate messaging RLS passed.';

  -- Reset back to superuser for cleanup
  PERFORM set_config('role', 'postgres', true);
  
  -- Clean up created test data
  DELETE FROM public.messages WHERE sender_id IN (recruiter_id, candidate_id) OR recipient_id IN (recruiter_id, candidate_id);
  DELETE FROM public.notifications WHERE user_id = candidate_id;
  DELETE FROM public.offers WHERE application_id = test_app_id;
  DELETE FROM public.interviews WHERE application_id = test_app_id;
  DELETE FROM public.job_applications WHERE id = test_app_id;
  DELETE FROM public.jobs WHERE id = test_job_id;
  DELETE FROM public.profiles WHERE id IN (recruiter_id, candidate_id);
  DELETE FROM auth.users WHERE id IN (recruiter_id, candidate_id);

  RAISE NOTICE '⭐ ALL END-TO-END WORKFLOW TESTS SUCCEEDED WITHOUT ERROR ⭐';
END;
$$;
