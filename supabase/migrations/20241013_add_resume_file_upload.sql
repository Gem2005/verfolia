-- Add columns to resumes table for storing uploaded file information
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS uploaded_file_path TEXT,
ADD COLUMN IF NOT EXISTS uploaded_file_url TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT,
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create index for faster file path lookups
CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_file_path 
  ON public.resumes(uploaded_file_path);

-- Create index for user's uploaded files
CREATE INDEX IF NOT EXISTS idx_resumes_user_uploaded 
  ON public.resumes(user_id, uploaded_at) 
  WHERE uploaded_file_path IS NOT NULL;

-- Add comments to clarify column purposes
COMMENT ON COLUMN public.resumes.uploaded_file_path IS 
  'Supabase Storage path in format: {user_id}/{resume_id}/{filename}';

COMMENT ON COLUMN public.resumes.uploaded_file_url IS 
  'Public or signed URL for accessing the uploaded file';

COMMENT ON COLUMN public.resumes.original_filename IS 
  'Original filename when user uploaded (e.g., "John_Doe_Resume.pdf")';

COMMENT ON COLUMN public.resumes.file_size_bytes IS 
  'Size of uploaded file in bytes for storage tracking';

COMMENT ON COLUMN public.resumes.mime_type IS 
  'MIME type of uploaded file (e.g., "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")';

COMMENT ON COLUMN public.resumes.uploaded_at IS 
  'Timestamp when the resume file was uploaded';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resume files" ON storage.objects;

-- Storage policies for 'resume' bucket
-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own resume files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'resume' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can view their own resume files
CREATE POLICY "Users can view own resume files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'resume' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own resume files
CREATE POLICY "Users can update own resume files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'resume' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own resume files
CREATE POLICY "Users can delete own resume files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'resume' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optional: Function to automatically delete storage file when resume is deleted
CREATE OR REPLACE FUNCTION delete_resume_storage_file()
RETURNS TRIGGER AS $$
DECLARE
  storage_path TEXT;
BEGIN
  -- Only proceed if there's an uploaded file
  IF OLD.uploaded_file_path IS NOT NULL THEN
    storage_path := OLD.uploaded_file_path;
    
    -- Delete from storage (requires supabase-js client or storage API)
    -- This is a placeholder - actual deletion should be handled in application code
    RAISE NOTICE 'Resume file should be deleted from storage: %', storage_path;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up storage when resume is deleted
DROP TRIGGER IF EXISTS trigger_delete_resume_storage_file ON public.resumes;
CREATE TRIGGER trigger_delete_resume_storage_file
  BEFORE DELETE ON public.resumes
  FOR EACH ROW
  WHEN (OLD.uploaded_file_path IS NOT NULL)
  EXECUTE FUNCTION delete_resume_storage_file();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
