-- Migration to switch from profiles table to auth.users table
-- This removes the dependency on the profiles table

-- Revert any custom role values to 'authenticated' (Supabase's default for authenticated users)
UPDATE auth.users 
SET "role" = 'authenticated' 
WHERE "role" = 'user' OR "role" = '' OR "role" IS NULL;

-- Remove foreign key constraint from resumes table that references profiles
ALTER TABLE public.resumes
DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;

-- Change user_id to reference auth.users instead of profiles
ALTER TABLE public.resumes
ADD CONSTRAINT resumes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix resume_creation_sessions table
ALTER TABLE public.resume_creation_sessions
DROP CONSTRAINT IF EXISTS resume_creation_sessions_user_id_fkey;

ALTER TABLE public.resume_creation_sessions
ADD CONSTRAINT resume_creation_sessions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Fix resume_views table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'resume_views'
  ) THEN
    ALTER TABLE public.resume_views
    DROP CONSTRAINT IF EXISTS resume_views_resume_id_fkey;
    
    ALTER TABLE public.resume_views
    ADD CONSTRAINT resume_views_resume_id_fkey 
    FOREIGN KEY (resume_id) 
    REFERENCES public.resumes(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Fix resume_interactions table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'resume_interactions'
  ) THEN
    ALTER TABLE public.resume_interactions
    DROP CONSTRAINT IF EXISTS resume_interactions_resume_id_fkey;
    
    ALTER TABLE public.resume_interactions
    ADD CONSTRAINT resume_interactions_resume_id_fkey 
    FOREIGN KEY (resume_id) 
    REFERENCES public.resumes(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Drop profile-related triggers since we're not using profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create RLS policy for resumes to work with auth.users
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Public resumes are viewable by everyone" ON public.resumes;

-- Enable RLS on resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for resumes using auth.uid()
CREATE POLICY "Users can view own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" 
ON public.resumes 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public resumes are viewable by everyone" 
ON public.resumes 
FOR SELECT 
USING (is_public = true);
