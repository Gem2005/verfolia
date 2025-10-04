-- Create table for storing parsed resume data
CREATE TABLE IF NOT EXISTS parsed_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT, -- Supabase Storage URL
  
  -- Parsed data (JSONB for flexibility)
  personal_info JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  custom_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  raw_text TEXT, -- Original extracted text
  markdown_content TEXT, -- Formatted markdown
  warnings JSONB DEFAULT '[]'::jsonb,
  parsing_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Version control
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES parsed_resumes(id) ON DELETE SET NULL,
  
  -- Status and tags
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_user_id ON parsed_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_status ON parsed_resumes(status);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_created_at ON parsed_resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_parent_id ON parsed_resumes(parent_id);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_deleted_at ON parsed_resumes(deleted_at) WHERE deleted_at IS NULL;

-- Create GIN index for JSONB fields for faster searches
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_personal_info ON parsed_resumes USING GIN (personal_info);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_skills ON parsed_resumes USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_tags ON parsed_resumes USING GIN (tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_parsed_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parsed_resumes_updated_at
  BEFORE UPDATE ON parsed_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_parsed_resumes_updated_at();

-- Row Level Security (RLS)
ALTER TABLE parsed_resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON parsed_resumes
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Policy: Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
  ON parsed_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON parsed_resumes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete (soft delete) their own resumes
CREATE POLICY "Users can delete own resumes"
  ON parsed_resumes
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Create table for resume sharing/collaboration (optional feature)
CREATE TABLE IF NOT EXISTS resume_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES parsed_resumes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'edit')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(resume_id, shared_with_email)
);

CREATE INDEX IF NOT EXISTS idx_resume_shares_resume_id ON resume_shares(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_shares_shared_with ON resume_shares(shared_with_email);

-- RLS for resume_shares
ALTER TABLE resume_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares of their resumes"
  ON resume_shares
  FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can create shares for their resumes"
  ON resume_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (SELECT 1 FROM parsed_resumes WHERE id = resume_id AND user_id = auth.uid())
  );
