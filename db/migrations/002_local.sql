-- Migration: 002_local
-- Schema for local PostgreSQL development (no Supabase auth.users dependency).
-- Run this instead of 001_initial.sql when using a plain local postgres instance:
--   psql $DATABASE_URL -f db/migrations/002_local.sql

-- users: lightweight local stand-in for Supabase auth.users
create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

-- plans: saved FIRE input snapshots per user
create table if not exists plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  inputs     jsonb not null,
  is_public  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_user_id_idx on plans(user_id);

-- tracker_categories: per-user savings categories
create table if not exists tracker_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  label      text not null,
  color      text not null,
  sort_order integer not null default 0
);

create index if not exists tracker_categories_user_id_idx on tracker_categories(user_id);

-- tracker_entries: monthly planned vs actual per category
create table if not exists tracker_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  month       varchar(7) not null,
  category_id uuid not null references tracker_categories(id) on delete cascade,
  planned     numeric,
  actual      numeric,
  unique (user_id, month, category_id)
);

create index if not exists tracker_entries_user_month_idx on tracker_entries(user_id, month);

-- chat_sessions (Phase 12)
create table if not exists chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- chat_messages (Phase 12)
create table if not exists chat_messages (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references chat_sessions(id) on delete cascade,
  role             text not null check (role in ('user', 'assistant')),
  content          text not null,
  extracted_inputs jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx on chat_messages(session_id);
