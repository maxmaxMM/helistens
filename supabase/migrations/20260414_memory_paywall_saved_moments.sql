create extension if not exists "uuid-ossp";

create table if not exists public.user_memory (
  user_id text primary key,
  summary text,
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_moments (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  input text,
  response text,
  verse text,
  prayer text,
  created_at timestamptz not null default now()
);
