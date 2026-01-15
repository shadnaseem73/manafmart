-- Create/upgrade an admin profile in public.profiles
--
-- IMPORTANT:
--   - Supabase auth users must be created via the Auth API / Dashboard.
--   - This migration will ONLY seed the matching row in public.profiles
--     if an auth user with the configured email already exists.
--
-- Change this email to your real admin email if needed.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the auth user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'mizan@manafmart.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Admin auth user not found (mizan@manafmart.com). Skipping admin profile seed.';
    RETURN;
  END IF;

  -- Ensure the profile exists and has a high trust_score
  INSERT INTO profiles (id, trust_score, phone, tech_guru_points)
  VALUES (v_user_id, 100, '+1-800-ADMIN', 5000)
  ON CONFLICT (id) DO UPDATE
    SET trust_score = EXCLUDED.trust_score;
END $$;

-- Demo-only grants (keep restrictive policies in production)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
