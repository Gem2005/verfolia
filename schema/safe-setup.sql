-- Safe Database Setup Script
-- This script checks for existing tables and only creates what's missing

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create updated_at function (safe to re-run)
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create profiles table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    create table public.profiles (
      id uuid references auth.users on delete cascade primary key,
      email text unique not null,
      full_name text,
      avatar_url text,
      bio text,
      website text,
      location text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
  end if;
end $$;

-- Create resumes table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'resumes') then
    create table public.resumes (
      id uuid not null default gen_random_uuid(),
      user_id uuid not null references public.profiles(id) on delete cascade,
      title text not null,
      slug text not null unique,
      template_id text not null default 'classic',
      theme_id text not null default 'black',
      is_public boolean not null default true,
      personal_info jsonb not null default '{}',
      experience jsonb not null default '[]',
      education jsonb not null default '[]',
      skills jsonb not null default '[]',
      projects jsonb not null default '[]',
      certifications jsonb not null default '[]',
      languages jsonb not null default '[]',
      custom_sections jsonb not null default '[]',
      view_count integer not null default 0,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
      constraint resumes_pkey primary key (id)
    );
  end if;
end $$;

-- Create resume_analytics table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'resume_analytics') then
    create table public.resume_analytics (
      id uuid not null default gen_random_uuid(),
      resume_id uuid not null references public.resumes(id) on delete cascade,
      event_type text not null, -- 'view', 'share', 'download'
      ip_address inet,
      user_agent text,
      referrer text,
      location jsonb, -- country, city data
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      constraint resume_analytics_pkey primary key (id)
    );
  end if;
end $$;

-- Create saved_resumes table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'saved_resumes') then
    create table public.saved_resumes (
      id uuid not null default gen_random_uuid(),
      user_id uuid not null references public.profiles(id) on delete cascade,
      resume_id uuid not null references public.resumes(id) on delete cascade,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      constraint saved_resumes_pkey primary key (id),
      constraint unique_user_resume unique (user_id, resume_id)
    );
  end if;
end $$;

-- Create templates table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'templates') then
    create table public.templates (
      id text not null primary key,
      name text not null,
      description text,
      category text not null default 'general', -- 'general', 'creative', 'professional', 'academic'
      preview_image text,
      has_photo boolean not null default false,
      layout_type text not null, -- 'single-column', 'two-column', 'sidebar'
      is_premium boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
  end if;
end $$;

-- Create themes table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'themes') then
    create table public.themes (
      id text not null primary key,
      name text not null,
      colors jsonb not null default '{}', -- primary, secondary, accent colors
      fonts jsonb not null default '{}', -- heading, body font configurations
      is_premium boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
  end if;
end $$;

-- Create user_subscriptions table only if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'user_subscriptions') then
    create table public.user_subscriptions (
      id uuid not null default gen_random_uuid(),
      user_id uuid not null references public.profiles(id) on delete cascade,
      plan_type text not null, -- 'free', 'pro', 'premium'
      status text not null default 'active', -- 'active', 'canceled', 'expired'
      stripe_customer_id text,
      stripe_subscription_id text,
      current_period_start timestamp with time zone,
      current_period_end timestamp with time zone,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
      constraint user_subscriptions_pkey primary key (id),
      constraint unique_user_subscription unique (user_id)
    );
  end if;
end $$;

-- Create indexes (safe to re-run if not exists)
create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists resumes_slug_idx on public.resumes(slug);
create index if not exists resumes_is_public_idx on public.resumes(is_public) where is_public = true;
create index if not exists resumes_created_at_idx on public.resumes(created_at desc);
create index if not exists resume_analytics_resume_id_idx on public.resume_analytics(resume_id);
create index if not exists resume_analytics_created_at_idx on public.resume_analytics(created_at desc);
create index if not exists saved_resumes_user_id_idx on public.saved_resumes(user_id);

-- Add triggers for updated_at (safe to re-run)
drop trigger if exists handle_updated_at_profiles on public.profiles;
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at_resumes on public.resumes;
create trigger handle_updated_at_resumes
  before update on public.resumes
  for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at_templates on public.templates;
create trigger handle_updated_at_templates
  before update on public.templates
  for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at_themes on public.themes;
create trigger handle_updated_at_themes
  before update on public.themes
  for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at_user_subscriptions on public.user_subscriptions;
create trigger handle_updated_at_user_subscriptions
  before update on public.user_subscriptions
  for each row execute function handle_updated_at();

-- Insert default templates (only if they don't exist)
insert into public.templates (id, name, description, category, has_photo, layout_type) 
select 'classic', 'Classic', 'Traditional single-column layout', 'professional', false, 'single-column'
where not exists (select 1 from public.templates where id = 'classic');

insert into public.templates (id, name, description, category, has_photo, layout_type) 
select 'executive', 'Executive', 'Professional with photo header', 'professional', true, 'photo-header'
where not exists (select 1 from public.templates where id = 'executive');

insert into public.templates (id, name, description, category, has_photo, layout_type) 
select 'creative', 'Creative', 'Sidebar with photo and skills', 'creative', true, 'sidebar'
where not exists (select 1 from public.templates where id = 'creative');

insert into public.templates (id, name, description, category, has_photo, layout_type) 
select 'minimal', 'Minimal', 'Clean and spacious layout', 'general', false, 'minimal'
where not exists (select 1 from public.templates where id = 'minimal');

insert into public.templates (id, name, description, category, has_photo, layout_type) 
select 'corporate', 'Corporate', 'Formal business layout with photo', 'professional', true, 'corporate'
where not exists (select 1 from public.templates where id = 'corporate');

-- Insert default themes (only if they don't exist)
insert into public.themes (id, name, colors, fonts) 
select 'black', 'Black', '{"primary": "#000000", "secondary": "#374151", "accent": "#3B82F6"}', '{"heading": "Inter", "body": "Inter"}'
where not exists (select 1 from public.themes where id = 'black');

insert into public.themes (id, name, colors, fonts) 
select 'dark-gray', 'Dark Gray', '{"primary": "#1F2937", "secondary": "#4B5563", "accent": "#3B82F6"}', '{"heading": "Inter", "body": "Inter"}'
where not exists (select 1 from public.themes where id = 'dark-gray');

insert into public.themes (id, name, colors, fonts) 
select 'navy-blue', 'Navy Blue', '{"primary": "#1E3A8A", "secondary": "#3B82F6", "accent": "#EF4444"}', '{"heading": "Inter", "body": "Inter"}'
where not exists (select 1 from public.themes where id = 'navy-blue');

insert into public.themes (id, name, colors, fonts) 
select 'professional', 'Professional', '{"primary": "#374151", "secondary": "#6B7280", "accent": "#059669"}', '{"heading": "Inter", "body": "Inter"}'
where not exists (select 1 from public.themes where id = 'professional');

-- Function to create profile on user signup (safe to re-run)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup (safe to re-run)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to generate unique slug (safe to re-run)
create or replace function generate_unique_slug(base_title text, user_id_param uuid)
returns text as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  -- Convert title to slug format
  base_slug := lower(trim(regexp_replace(base_title, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- If empty, use default
  if base_slug = '' then
    base_slug := 'resume';
  end if;
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if necessary
  while exists (select 1 from public.resumes where slug = final_slug and user_id != user_id_param) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  
  return final_slug;
end;
$$ language plpgsql;

-- Function to increment view count (safe to re-run)
create or replace function increment_resume_view_count(resume_id_param uuid)
returns void as $$
begin
  update public.resumes
  set view_count = view_count + 1
  where id = resume_id_param;
  
  insert into public.resume_analytics (resume_id, event_type)
  values (resume_id_param, 'view');
end;
$$ language plpgsql security definer;
