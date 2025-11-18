-- Check if bucket exists and its configuration
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id = 'question-images';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%question%';

-- Check if any images exist in the bucket
SELECT bucket_id, name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'question-images'
ORDER BY created_at DESC
LIMIT 5;
