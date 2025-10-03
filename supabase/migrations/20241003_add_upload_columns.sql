-- Add columns for resume file upload tracking
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS original_filename TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT 
  CHECK (file_type IN ('pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'manual')),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS parsing_status TEXT DEFAULT 'manual' 
  CHECK (parsing_status IN ('manual', 'pending', 'success', 'failed')),
ADD COLUMN IF NOT EXISTS parsing_warnings JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_file_type 
  ON public.resumes(file_type);

CREATE INDEX IF NOT EXISTS idx_resumes_parsing_status 
  ON public.resumes(parsing_status);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id 
  ON public.resumes(user_id);

-- Update existing resumes to have 'manual' status
UPDATE public.resumes 
SET 
  parsing_status = 'manual',
  file_type = 'manual'
WHERE parsing_status IS NULL;
