-- Create table for tracking all uploaded resume files independently
-- This allows users to see upload history and reuse files for multiple resumes

CREATE TABLE IF NOT EXISTS public.uploaded_resume_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  file_path TEXT NOT NULL UNIQUE,
  file_url TEXT,
  original_filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Parsed data (store AI-extracted resume data for reuse)
  parsed_data JSONB,
  
  -- Status tracking
  is_used BOOLEAN DEFAULT false,
  associated_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Soft delete (for cleanup tracking)
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id 
  ON public.uploaded_resume_files(user_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_active 
  ON public.uploaded_resume_files(user_id, uploaded_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_uploaded_files_resume_id 
  ON public.uploaded_resume_files(associated_resume_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_unused 
  ON public.uploaded_resume_files(user_id, is_used, uploaded_at DESC) 
  WHERE is_used = false AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_uploaded_files_cleanup 
  ON public.uploaded_resume_files(uploaded_at, is_used) 
  WHERE is_used = false AND deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.uploaded_resume_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own uploaded files
CREATE POLICY "Users can view own uploaded files"
  ON public.uploaded_resume_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded files"
  ON public.uploaded_resume_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploaded files"
  ON public.uploaded_resume_files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded files"
  ON public.uploaded_resume_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update last_accessed_at timestamp
CREATE OR REPLACE FUNCTION update_file_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_accessed_at on any update
CREATE TRIGGER trigger_update_file_accessed
  BEFORE UPDATE ON public.uploaded_resume_files
  FOR EACH ROW
  EXECUTE FUNCTION update_file_last_accessed();

-- Add foreign key to resumes table to link with uploaded files
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS uploaded_file_id UUID REFERENCES public.uploaded_resume_files(id) ON DELETE SET NULL;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_file_id 
  ON public.resumes(uploaded_file_id);

-- Add helpful comments
COMMENT ON TABLE public.uploaded_resume_files IS 
  'Tracks all resume files uploaded by users, independent of resume creation. Allows file reuse and history tracking.';

COMMENT ON COLUMN public.uploaded_resume_files.is_used IS 
  'Marks if file is currently associated with an active resume';

COMMENT ON COLUMN public.uploaded_resume_files.parsed_data IS 
  'Stores AI-parsed resume data (JSON) for instant reuse without re-parsing';

COMMENT ON COLUMN public.uploaded_resume_files.deleted_at IS 
  'Soft delete timestamp - allows recovery and audit trail';

COMMENT ON COLUMN public.uploaded_resume_files.last_accessed_at IS 
  'Auto-updated on any modification - useful for cleanup decisions';

COMMENT ON COLUMN public.resumes.uploaded_file_id IS 
  'Links resume to its source uploaded file (if created from upload)';
