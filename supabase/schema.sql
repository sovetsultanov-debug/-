-- Saiyakat database schema. Run once in Supabase → SQL Editor.
-- Chats are private: row-level security lets each user see only their own rows.

create table if not exists public.chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.chats (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null check (char_length(content) <= 100000),
  created_at  timestamptz not null default now()
);

create index if not exists chats_user_updated_idx on public.chats (user_id, updated_at desc);
create index if not exists messages_chat_created_idx on public.messages (chat_id, created_at);

alter table public.chats enable row level security;
alter table public.messages enable row level security;

drop policy if exists "own chats" on public.chats;
create policy "own chats" on public.chats
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "own messages" on public.messages;
create policy "own messages" on public.messages
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.chats c where c.id = chat_id and c.user_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- Profiles, usage log and app settings (admin panel + access control).
-- These tables are only written by the server with the service-role key;
-- regular users can read their own profile and nothing else.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  banned      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.usage_events (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  input_tokens   integer not null default 0,
  output_tokens  integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists usage_user_created_idx on public.usage_events (user_id, created_at desc);
create index if not exists usage_created_idx on public.usage_events (created_at desc);

create table if not exists public.app_settings (
  id           smallint primary key default 1 check (id = 1),
  ai_enabled   boolean not null default true,
  daily_limit  integer not null default 30 check (daily_limit between 0 and 10000),
  updated_at   timestamptz not null default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.usage_events enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
-- usage_events and app_settings: no policies → only the service role can touch them.

-- Create a profile row for every new user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users created before this script ran.
insert into public.profiles (id, email, created_at)
select id, email, created_at from auth.users
on conflict (id) do nothing;

-- Per-user stats for the admin panel. Server (service role) only.
create or replace view public.admin_user_stats with (security_invoker = true) as
select
  p.id,
  p.email,
  p.banned,
  p.created_at,
  count(u.id)                                                         as requests_total,
  count(u.id) filter (where u.created_at > now() - interval '1 day')  as requests_today,
  coalesce(sum(u.input_tokens + u.output_tokens), 0)                  as tokens_total,
  max(u.created_at)                                                   as last_active,
  (select count(*) from public.chats c where c.user_id = p.id)        as chats
from public.profiles p
left join public.usage_events u on u.user_id = p.id
group by p.id;

revoke all on public.admin_user_stats from anon, authenticated;
revoke all on public.usage_events from anon, authenticated;
revoke all on public.app_settings from anon, authenticated;
