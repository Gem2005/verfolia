-- Comprehensive schema verification and fix
-- Run this in Supabase SQL Editor to ensure schema is correct

-- 1. Verify and add missing columns to sessions table
DO $$ 
BEGIN
    -- Add completed_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_creation_sessions' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.resume_creation_sessions 
        ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added completed_at column';
    END IF;

    -- Add session_completed if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resume_creation_sessions' 
        AND column_name = 'session_completed'
    ) THEN
        ALTER TABLE public.resume_creation_sessions 
        ADD COLUMN session_completed BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added session_completed column';
    END IF;
END $$;

-- 2. Display current schema for sessions
SELECT 
    '=== SESSIONS TABLE SCHEMA ===' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'resume_creation_sessions'
ORDER BY ordinal_position;

-- 3. Display current schema for events
SELECT 
    '=== EVENTS TABLE SCHEMA ===' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'resume_creation_events'
ORDER BY ordinal_position;

-- 4. Test data - show sample records
SELECT 
    '=== SAMPLE SESSION DATA ===' as info,
    session_id,
    user_id,
    is_first_time_visitor,
    session_completed,
    completed_at,
    created_at
FROM public.resume_creation_sessions
ORDER BY created_at DESC
LIMIT 5;

SELECT 
    '=== SAMPLE EVENT DATA ===' as info,
    session_id,
    event_type,
    step_number,
    created_at
FROM public.resume_creation_events
ORDER BY created_at DESC
LIMIT 10;
