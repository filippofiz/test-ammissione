-- Migration: 034_create_gmat_materials_bucket.sql
-- Purpose: Create storage bucket for GMAT PDF materials with RLS policies
-- Created: January 2025

-- Create gmat-materials bucket (private, PDF only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gmat-materials',
  'gmat-materials',
  false,
  104857600,  -- 100MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Students can view PDFs only for their assigned and unlocked materials
CREATE POLICY "Students view assigned material PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gmat-materials'
  AND EXISTS (
    SELECT 1 FROM "2V_material_assignments" ma
    JOIN "2V_lesson_materials" lm ON ma.material_id = lm.id
    WHERE lm.pdf_storage_path = name
    AND ma.student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    AND ma.is_unlocked = true
  )
);

-- RLS Policy: Tutors and Admins can upload, update, and delete materials
CREATE POLICY "Tutors manage material PDFs"
ON storage.objects FOR ALL
USING (
  bucket_id = 'gmat-materials'
  AND EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE auth_uid = auth.uid()
    AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
  )
);
