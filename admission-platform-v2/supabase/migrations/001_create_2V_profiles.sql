-- Migration: Create 2V_profiles unified table for students and tutors
-- Date: 2025-11-14
-- Purpose: Unified authentication system with roles and forced password change

-- Create 2V_profiles table
CREATE TABLE IF NOT EXISTS "2V_profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  roles JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of roles: ["STUDENT", "TUTOR", "ADMIN"]

  -- Student-specific fields
  tutor_id UUID, -- Will add FK constraint after table creation
  tests JSONB DEFAULT '[]'::jsonb,
  esigenze_speciali BOOLEAN DEFAULT false,

  -- Password management
  must_change_password BOOLEAN DEFAULT true,
  last_password_change TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_2V_profiles_auth_uid ON "2V_profiles"(auth_uid);
CREATE INDEX IF NOT EXISTS idx_2V_profiles_email ON "2V_profiles"(email);
CREATE INDEX IF NOT EXISTS idx_2V_profiles_roles ON "2V_profiles" USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_2V_profiles_tutor_id ON "2V_profiles"(tutor_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_2V_profiles_updated_at ON "2V_profiles";
CREATE TRIGGER update_2V_profiles_updated_at
  BEFORE UPDATE ON "2V_profiles"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "2V_profiles" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON "2V_profiles";
CREATE POLICY "Users can view own profile"
  ON "2V_profiles"
  FOR SELECT
  USING (auth.uid() = auth_uid);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON "2V_profiles";
CREATE POLICY "Users can update own profile"
  ON "2V_profiles"
  FOR UPDATE
  USING (auth.uid() = auth_uid)
  WITH CHECK (auth.uid() = auth_uid);

-- Tutors can view their students
DROP POLICY IF EXISTS "Tutors can view their students" ON "2V_profiles";
CREATE POLICY "Tutors can view their students"
  ON "2V_profiles"
  FOR SELECT
  USING (
    roles @> '"STUDENT"'::jsonb AND tutor_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  );

-- Tutors can view other tutors (for collaboration)
DROP POLICY IF EXISTS "Tutors can view other tutors" ON "2V_profiles";
CREATE POLICY "Tutors can view other tutors"
  ON "2V_profiles"
  FOR SELECT
  USING (
    roles @> '"TUTOR"'::jsonb AND EXISTS (
      SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  );

-- Tutors can insert students
DROP POLICY IF EXISTS "Tutors can insert students" ON "2V_profiles";
CREATE POLICY "Tutors can insert students"
  ON "2V_profiles"
  FOR INSERT
  WITH CHECK (
    roles @> '"STUDENT"'::jsonb AND tutor_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  );

-- Tutors can update their students
DROP POLICY IF EXISTS "Tutors can update their students" ON "2V_profiles";
CREATE POLICY "Tutors can update their students"
  ON "2V_profiles"
  FOR UPDATE
  USING (
    roles @> '"STUDENT"'::jsonb AND tutor_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  )
  WITH CHECK (
    roles @> '"STUDENT"'::jsonb AND tutor_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  );

-- ADMIN role policy (full access to everything)
DROP POLICY IF EXISTS "Admins have full access" ON "2V_profiles";
CREATE POLICY "Admins have full access"
  ON "2V_profiles"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "2V_profiles" TO authenticated;
GRANT SELECT ON "2V_profiles" TO anon;

-- Add self-referential foreign key for tutor_id
ALTER TABLE "2V_profiles"
  ADD CONSTRAINT fk_2V_profiles_tutor
  FOREIGN KEY (tutor_id)
  REFERENCES "2V_profiles"(id)
  ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE "2V_profiles" IS 'Unified profiles for students and tutors with Supabase Auth integration';
COMMENT ON COLUMN "2V_profiles".roles IS 'Array of user roles: ["STUDENT"], ["TUTOR"], ["ADMIN"], or combinations like ["STUDENT", "TUTOR"]';
COMMENT ON COLUMN "2V_profiles".tutor_id IS 'For STUDENT role: references their tutor in 2V_profiles';
COMMENT ON COLUMN "2V_profiles".must_change_password IS 'Forces user to change password on first login';
COMMENT ON COLUMN "2V_profiles".last_password_change IS 'Timestamp of last password change';
