-- Fix missing completed_at column
-- Run this in Supabase SQL Editor

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_creation_sessions' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.resume_creation_sessions 
        ADD COLUMN completed_at TIMESTAMPTZ;
        
        RAISE NOTICE 'Added completed_at column';
    ELSE
        RAISE NOTICE 'completed_at column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'resume_creation_sessions'
ORDER BY ordinal_position;
