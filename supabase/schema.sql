-- DutyLookup DB2 Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists duty_books (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  garage text not null default 'DB2',
  zone text,
  routes text[],
  release_name text not null,
  valid_from date,
  valid_to date,
  is_active boolean not null default false,
  imported_at timestamptz not null default now(),
  notes text
);

create table if not exists duties (
  id uuid primary key default gen_random_uuid(),
  duty_book_id uuid references duty_books(id) on delete cascade,
  garage text not null default 'DB2',
  zone text not null,
  day_type text not null check (day_type in ('weekday','saturday','sunday')),
  roster_number text not null,
  duty_number text,
  display_duty_number text not null,
  route text,
  ticket_machine_number text default '000',
  shift_type text,
  sign_on_time text,
  sign_on_location text,
  start_time text,
  start_location text,
  finish_time text,
  finish_location text,
  sign_off_time text,
  raw_source jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(duty_book_id, day_type, roster_number)
);

create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  duty_id uuid references duties(id) on delete cascade,
  sequence integer not null,
  event_type text not null,
  event_time text,
  location text,
  route text,
  from_duty_number text,
  to_duty_number text,
  vehicle_or_block text,
  notes text,
  raw_source jsonb default '{}'::jsonb
);

create table if not exists import_logs (
  id uuid primary key default gen_random_uuid(),
  duty_book_id uuid references duty_books(id) on delete set null,
  source_file text,
  status text not null,
  message text,
  created_at timestamptz not null default now()
);

create or replace view duty_cards as
select
  d.*,
  b.code as duty_book_code,
  b.release_name,
  b.is_active
from duties d
join duty_books b on b.id = d.duty_book_id;

alter table duty_books enable row level security;
alter table duties enable row level security;
alter table timeline_events enable row level security;
alter table import_logs enable row level security;

-- Public read access for driver app. Restrict later if you require driver login.
drop policy if exists "Public read active duty books" on duty_books;
create policy "Public read active duty books" on duty_books for select using (true);

drop policy if exists "Public read duties" on duties;
create policy "Public read duties" on duties for select using (true);

drop policy if exists "Public read timeline events" on timeline_events;
create policy "Public read timeline events" on timeline_events for select using (true);

-- Admin writes should be done through authenticated users / service role later.
