-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_analytics enable row level security;
alter table public.saved_resumes enable row level security;
alter table public.user_subscriptions enable row level security;

-- Profiles policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Resumes policies
create policy "Users can view their own resumes" on public.resumes
  for select using (auth.uid() = user_id);

create policy "Anyone can view public resumes" on public.resumes
  for select using (is_public = true);

create policy "Users can insert their own resumes" on public.resumes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own resumes" on public.resumes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own resumes" on public.resumes
  for delete using (auth.uid() = user_id);

-- Resume analytics policies
create policy "Users can view analytics for their resumes" on public.resume_analytics
  for select using (
    exists (
      select 1 from public.resumes 
      where resumes.id = resume_analytics.resume_id 
      and resumes.user_id = auth.uid()
    )
  );

create policy "Anyone can insert analytics for public resumes" on public.resume_analytics
  for insert with check (
    exists (
      select 1 from public.resumes 
      where resumes.id = resume_analytics.resume_id 
      and resumes.is_public = true
    )
  );

-- Saved resumes policies
create policy "Users can view their saved resumes" on public.saved_resumes
  for select using (auth.uid() = user_id);

create policy "Users can save public resumes" on public.saved_resumes
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.resumes 
      where resumes.id = saved_resumes.resume_id 
      and resumes.is_public = true
    )
  );

create policy "Users can remove their saved resumes" on public.saved_resumes
  for delete using (auth.uid() = user_id);

-- User subscriptions policies
create policy "Users can view their own subscription" on public.user_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own subscription" on public.user_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscription" on public.user_subscriptions
  for update using (auth.uid() = user_id);

-- Templates and themes are readable by everyone (no RLS needed)
alter table public.templates enable row level security;
alter table public.themes enable row level security;

create policy "Anyone can view templates" on public.templates
  for select using (true);

create policy "Anyone can view themes" on public.themes
  for select using (true);
