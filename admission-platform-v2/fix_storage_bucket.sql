-- Fix storage bucket for question images (AUTHENTICATED USERS ONLY)

-- First, check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'question-images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for question images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update question images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete question images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view question images" ON storage.objects;

-- Create or update bucket (public = FALSE for authenticated-only access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('question-images', 'question-images', false, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id)
DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Allow authenticated users to VIEW images (students and admins)
CREATE POLICY "Authenticated users can view question images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'question-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload question images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'question-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update question images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'question-images')
WITH CHECK (bucket_id = 'question-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete question images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'question-images');

-- Verify setup
SELECT * FROM storage.buckets WHERE id = 'question-images';
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%question%';
