create table public.resumes (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  title text not null,
  slug text not null,
  template_id text null default 'default'::text,
  is_public boolean null default true,
  personal_info jsonb null default '{}'::jsonb,
  experience jsonb null default '[]'::jsonb,
  education jsonb null default '[]'::jsonb,
  skills jsonb null default '[]'::jsonb,
  projects jsonb null default '[]'::jsonb,
  certifications jsonb null default '[]'::jsonb,
  languages jsonb null default '[]'::jsonb,
  custom_sections jsonb null default '[]'::jsonb,
  theme_config jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint resumes_pkey primary key (id),
  constraint resumes_slug_key unique (slug),
  constraint resumes_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists resumes_slug_idx on public.resumes using btree (slug) TABLESPACE pg_default;

create index IF not exists resumes_user_id_idx on public.resumes using btree (user_id) TABLESPACE pg_default;

create trigger handle_updated_at_resumes BEFORE
update on resumes for EACH row
execute FUNCTION handle_updated_at ();