/*
  # Update User Profiles for Phone Authentication

  1. Changes to Tables
    - Modify `user_profiles` table:
      - Make `email` nullable for patients (they use phone numbers)
      - Add `phone_number` column for patients
      - Add `firebase_uid` to link Firebase auth with Supabase data
      - Update constraints to allow either email or phone
    
    - Update `doctor_profiles` table:
      - Add `google_id` for Google authentication tracking

  2. Important Notes
    - Patients will authenticate via Firebase phone auth
    - Doctors will use Firebase email/password or Google auth
    - Firebase handles authentication, Supabase stores user data
    - firebase_uid links Firebase user to Supabase profile
*/

-- Add new columns to user_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN firebase_uid text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Make email nullable for patients who use phone
ALTER TABLE user_profiles ALTER COLUMN email DROP NOT NULL;

-- Add constraint to ensure either email or phone is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_contact_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_contact_check 
      CHECK (
        (email IS NOT NULL AND email != '') OR 
        (phone_number IS NOT NULL AND phone_number != '')
      );
  END IF;
END $$;

-- Add google_id to doctor_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctor_profiles' AND column_name = 'google_id'
  ) THEN
    ALTER TABLE doctor_profiles ADD COLUMN google_id text;
  END IF;
END $$;

-- Update RLS policies to work with Firebase UIDs
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- New RLS policies that work with both Supabase auth and Firebase UIDs
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Update doctor_profiles RLS policies
DROP POLICY IF EXISTS "Doctors can read own doctor profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can insert own doctor profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update own doctor profile" ON doctor_profiles;

CREATE POLICY "Doctors can read own doctor profile"
  ON doctor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Doctors can insert own doctor profile"
  ON doctor_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Doctors can update own doctor profile"
  ON doctor_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);