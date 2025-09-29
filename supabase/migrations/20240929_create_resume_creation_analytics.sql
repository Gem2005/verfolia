-- Create table for resume creation analytics
CREATE TABLE public.resume_creation_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  event_type text NOT NULL, -- 'page_view', 'step_change', 'step_duration', 'template_selection', 'theme_selection', 'save_attempt', 'session_end'
  
  -- Step tracking
  step_number integer,
  step_name text,
  time_spent_on_step integer, -- milliseconds spent on this step
  
  -- Template/Theme selections
  template_id text,
  theme_id text,
  
  -- Session tracking
  total_time_on_page integer, -- total milliseconds spent on create-resume page
  is_first_time_visitor boolean DEFAULT false,
  
  -- Save tracking
  save_success boolean,
  save_error_message text,
  
  -- Basic tracking
  user_agent text,
  ip_address inet,
  country text,
  city text,
  region text,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT resume_creation_analytics_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX idx_resume_creation_analytics_session ON resume_creation_analytics(session_id);
CREATE INDEX idx_resume_creation_analytics_user ON resume_creation_analytics(user_id);
CREATE INDEX idx_resume_creation_analytics_event ON resume_creation_analytics(event_type);
CREATE INDEX idx_resume_creation_analytics_created ON resume_creation_analytics(created_at);
CREATE INDEX idx_resume_creation_analytics_step ON resume_creation_analytics(step_number);
CREATE INDEX idx_resume_creation_analytics_first_time ON resume_creation_analytics(is_first_time_visitor);

-- Enable RLS (Row Level Security)
ALTER TABLE resume_creation_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own analytics
CREATE POLICY "Users can view their own creation analytics" ON resume_creation_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to insert analytics
CREATE POLICY "Authenticated users can insert creation analytics" ON resume_creation_analytics
  FOR INSERT WITH CHECK (true);