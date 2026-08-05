-- ─────────────────────────────────────────────────────────────────────────────
-- Find auth users where user_metadata.role is missing/null
-- These are accounts created before Fix #6 (updateUser silently failed) or
-- accounts that bypassed the normal signup flow.
--
-- Run this in the Supabase SQL Editor → Dashboard → SQL
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  au.id                                         AS user_id,
  au.email                                      AS email,
  au.raw_user_meta_data->>'role'               AS jwt_role,        -- what user_metadata.role contains
  p.role                                        AS profiles_role,   -- what the DB says
  au.created_at                                 AS created_at,
  CASE
    WHEN au.raw_user_meta_data->>'role' IS NULL  THEN 'MISSING — would have hit || "candidate" default'
    WHEN au.raw_user_meta_data->>'role' = ''     THEN 'EMPTY — same problem'
    WHEN au.raw_user_meta_data->>'role' <> p.role THEN 'STALE — JWT and DB disagree!'
    ELSE 'OK'
  END AS status
FROM
  auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
WHERE
  -- Show any account with missing, empty, or mismatched role
  au.raw_user_meta_data->>'role' IS NULL
  OR au.raw_user_meta_data->>'role' = ''
  OR (au.raw_user_meta_data->>'role' IS NOT NULL AND p.role IS NOT NULL
      AND au.raw_user_meta_data->>'role' <> p.role)
ORDER BY
  au.created_at DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- Repair query: backfill user_metadata.role for all affected accounts
-- WARNING: Only run after reviewing the SELECT results above.
-- This uses the Supabase admin API, not SQL. Run it via:
--   supabase.auth.admin.updateUserById(userId, { user_metadata: { role: profiles_role } })
-- or use the Supabase Dashboard → Authentication → Users to update manually.
-- ─────────────────────────────────────────────────────────────────────────────

-- To count affected accounts:
SELECT COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.raw_user_meta_data->>'role' IS NULL
   OR au.raw_user_meta_data->>'role' = '';
