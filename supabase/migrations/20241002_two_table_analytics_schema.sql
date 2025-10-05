-- Two-table analytics schema for normalized data storage
-- Table 1: Session-level metadata
CREATE TABLE IF NOT EXISTS public.resume_creation_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_first_time_visitor BOOLEAN DEFAULT false,
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_ended_at TIMESTAMPTZ,
  session_completed BOOLEAN DEFAULT false,
  CONSTRAINT resume_creation_sessions_session_id_key UNIQUE (session_id)
);

-- Table 2: Event-level data
CREATE TABLE IF NOT EXISTS public.resume_creation_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_number INTEGER,
  step_name TEXT,
  time_spent_on_step INTEGER,
  template_id TEXT,
  theme_id TEXT,
  save_success BOOLEAN,
  save_error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES public.resume_creation_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.resume_creation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.resume_creation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.resume_creation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_first_time ON public.resume_creation_sessions(is_first_time_visitor) WHERE is_first_time_visitor = true;
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON public.resume_creation_sessions(session_completed) WHERE session_completed = true;

CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.resume_creation_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.resume_creation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.resume_creation_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_step_number ON public.resume_creation_events(step_number);
CREATE INDEX IF NOT EXISTS idx_events_template_id ON public.resume_creation_events(template_id);
CREATE INDEX IF NOT EXISTS idx_events_save_success ON public.resume_creation_events(save_success) WHERE save_success = true;

-- Enable RLS
ALTER TABLE public.resume_creation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_creation_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.resume_creation_sessions;
CREATE POLICY "Users can view own sessions" ON public.resume_creation_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anon can insert sessions" ON public.resume_creation_sessions;
CREATE POLICY "Anon can insert sessions" ON public.resume_creation_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update sessions" ON public.resume_creation_sessions;
CREATE POLICY "Anon can update sessions" ON public.resume_creation_sessions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service role full access sessions" ON public.resume_creation_sessions;
CREATE POLICY "Service role full access sessions" ON public.resume_creation_sessions
  FOR ALL USING (true);

-- RLS Policies for events
DROP POLICY IF EXISTS "Users can view own events" ON public.resume_creation_events;
CREATE POLICY "Users can view own events" ON public.resume_creation_events
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM public.resume_creation_sessions WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert events" ON public.resume_creation_events;
CREATE POLICY "Anyone can insert events" ON public.resume_creation_events
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.resume_creation_sessions
    )
  );

DROP POLICY IF EXISTS "Service role full access events" ON public.resume_creation_events;
CREATE POLICY "Service role full access events" ON public.resume_creation_events
  FOR ALL USING (true);

-- Analytics Views
CREATE OR REPLACE VIEW public.session_analytics_summary AS
SELECT 
  s.session_id,
  s.user_id,
  s.is_first_time_visitor,
  s.created_at as session_start,
  s.session_ended_at as session_end,
  s.session_completed,
  EXTRACT(EPOCH FROM (s.session_ended_at - s.created_at)) as session_duration_seconds,
  COUNT(e.id) as total_events,
  COUNT(CASE WHEN e.event_type = 'step_change' THEN 1 END) as step_changes,
  MAX(e.step_number) as max_step_reached,
  COUNT(CASE WHEN e.save_success = true THEN 1 END) as successful_saves
FROM public.resume_creation_sessions s
LEFT JOIN public.resume_creation_events e ON s.session_id = e.session_id
GROUP BY s.id, s.session_id, s.user_id, s.is_first_time_visitor, s.created_at, s.session_ended_at, s.session_completed;

CREATE OR REPLACE VIEW public.conversion_funnel AS
SELECT 
  COUNT(DISTINCT s.session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN s.is_first_time_visitor THEN s.session_id END) as first_time_sessions,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM public.resume_creation_events e 
    WHERE e.session_id = s.session_id AND e.step_number >= 1
  ) THEN s.session_id END) as reached_step_1,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM public.resume_creation_events e 
    WHERE e.session_id = s.session_id AND e.step_number >= 3
  ) THEN s.session_id END) as reached_step_3,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM public.resume_creation_events e 
    WHERE e.session_id = s.session_id AND e.step_number >= 5
  ) THEN s.session_id END) as reached_step_5,
  COUNT(DISTINCT CASE WHEN s.session_completed THEN s.session_id END) as completed_sessions
FROM public.resume_creation_sessions s;

CREATE OR REPLACE VIEW public.daily_session_analytics AS
SELECT 
  DATE(s.created_at) as date,
  COUNT(DISTINCT s.session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN s.is_first_time_visitor THEN s.session_id END) as first_time_visitors,
  COUNT(DISTINCT CASE WHEN s.session_completed THEN s.session_id END) as completed_sessions,
  ROUND(AVG(EXTRACT(EPOCH FROM (s.session_ended_at - s.created_at)))) as avg_duration_seconds
FROM public.resume_creation_sessions s
GROUP BY DATE(s.created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW public.geographic_analytics AS
SELECT 
  s.ip_address,
  COUNT(DISTINCT s.session_id) as sessions,
  COUNT(DISTINCT CASE WHEN s.session_completed THEN s.session_id END) as completed_sessions
FROM public.resume_creation_sessions s
WHERE s.ip_address IS NOT NULL
GROUP BY s.ip_address;

CREATE OR REPLACE VIEW public.step_dropoff_analysis AS
SELECT 
  e.step_number,
  COUNT(DISTINCT e.session_id) as sessions_reached,
  COUNT(DISTINCT CASE WHEN e2.step_number = e.step_number + 1 THEN e.session_id END) as sessions_continued
FROM public.resume_creation_events e
LEFT JOIN public.resume_creation_events e2 
  ON e.session_id = e2.session_id 
  AND e2.step_number = e.step_number + 1
WHERE e.event_type = 'step_change'
GROUP BY e.step_number
ORDER BY e.step_number;
