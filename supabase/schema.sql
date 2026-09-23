-- =========================================================
-- CRbio — Full database schema (Phases 1-4)
-- Run this once in the Supabase SQL Editor for a brand-new project.
-- Every statement is idempotent — safe to re-run.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text,
  bio text check (char_length(bio) <= 280),
  avatar_url text,
  theme jsonb not null default '{
    "preset": "midnight", "accent": "#7C6CF6", "buttonStyle": "fill", "buttonShape": "rounded",
    "buttonAnimation": "lift", "fontPair": "signature", "backgroundType": "theme",
    "gradientFrom": "#0A0A12", "gradientTo": "#241A3D", "gradientAngle": 160,
    "backgroundImageUrl": null, "backgroundVideoUrl": null, "overlayOpacity": 0.45
  }'::jsonb,
  is_published boolean not null default true,
  custom_domain text unique,
  custom_domain_verified boolean not null default false,
  chatbot_enabled boolean not null default false,
  chatbot_name text not null default 'Assistant',
  chatbot_welcome_message text not null default 'Hi! Ask me anything about this page.',
  chatbot_fallback_message text not null default 'I don''t have an answer for that yet — try one of the links below, or reach out directly.',
  booking_timezone text not null default 'UTC',
  booking_duration_minutes integer not null default 30 check (booking_duration_minutes > 0 and booking_duration_minutes <= 480),
  auto_order_links boolean not null default false,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_custom_domain_idx on public.profiles (custom_domain);

-- ---------------------------------------------------------
-- LINKS / BLOCKS
-- ---------------------------------------------------------
create table if not exists public.links (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 100),
  url text not null,
  icon text default 'link',
  description text check (char_length(description) <= 280),
  block_type text not null default 'link' check (block_type in ('link', 'lead_capture', 'embed', 'product', 'booking')),
  embed_provider text check (embed_provider is null or embed_provider in ('youtube', 'spotify', 'tiktok')),
  display_style text not null default 'button' check (display_style in ('button', 'icon')),
  position integer not null default 0,
  is_active boolean not null default true,
  click_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'USD',
  delivery_type text check (delivery_type is null or delivery_type in ('file', 'external')),
  file_url text,
  external_checkout_url text,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_profile_id_idx on public.links (profile_id, position);
create index if not exists links_schedule_idx on public.links (profile_id, starts_at, ends_at);

-- ---------------------------------------------------------
-- LINK CLICKS / PROFILE VIEWS (analytics)
-- ---------------------------------------------------------
create table if not exists public.link_clicks (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  country text,
  device text,
  browser text
);

create index if not exists link_clicks_profile_id_idx on public.link_clicks (profile_id, clicked_at desc);
create index if not exists link_clicks_link_id_idx on public.link_clicks (link_id, clicked_at desc);
create index if not exists link_clicks_country_idx on public.link_clicks (profile_id, country);

create table if not exists public.profile_views (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  referrer text,
  country text,
  device text,
  browser text
);

create index if not exists profile_views_profile_id_idx on public.profile_views (profile_id, viewed_at desc);
create index if not exists profile_views_country_idx on public.profile_views (profile_id, country);

-- ---------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name text,
  captured_at timestamptz not null default now()
);

create index if not exists leads_profile_id_idx on public.leads (profile_id, captured_at desc);
create index if not exists leads_link_id_idx on public.leads (link_id, captured_at desc);

-- ---------------------------------------------------------
-- CHATBOT
-- ---------------------------------------------------------
create table if not exists public.chatbot_qa (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) <= 200),
  answer text not null check (char_length(answer) <= 1000),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists chatbot_qa_profile_id_idx on public.chatbot_qa (profile_id, position);

-- ---------------------------------------------------------
-- PRODUCTS / ORDERS
-- ---------------------------------------------------------
create table if not exists public.product_orders (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name text,
  amount_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_orders_profile_id_idx on public.product_orders (profile_id, created_at desc);

-- ---------------------------------------------------------
-- BOOKING
-- ---------------------------------------------------------
create table if not exists public.booking_availability (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists booking_availability_profile_id_idx on public.booking_availability (profile_id, day_of_week);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  notes text check (char_length(notes) <= 500),
  starts_at timestamptz not null,
  duration_minutes integer not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (profile_id, starts_at)
);

create index if not exists bookings_profile_id_idx on public.bookings (profile_id, starts_at);

-- ---------------------------------------------------------
-- TEAM MANAGEMENT
-- ---------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role text not null default 'editor' check (role in ('editor')),
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  invite_token uuid not null default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

create unique index if not exists team_members_profile_user_idx on public.team_members (profile_id, user_id) where user_id is not null;
create index if not exists team_members_profile_id_idx on public.team_members (profile_id);
create unique index if not exists team_members_invite_token_idx on public.team_members (invite_token);

-- ---------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists trg_links_updated_at on public.links;
create trigger trg_links_updated_at before update on public.links for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- can_manage_profile — central permission check (owner OR accepted editor)
-- ---------------------------------------------------------
create or replace function public.can_manage_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    auth.uid() = p_profile_id
    or exists (
      select 1 from public.team_members tm
      where tm.profile_id = p_profile_id and tm.user_id = auth.uid() and tm.status = 'accepted'
    );
$$;

grant execute on function public.can_manage_profile(uuid) to anon, authenticated;

create or replace function public.accept_team_invite(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_row public.team_members;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'You must be signed in to accept an invite.'); end if;
  select * into v_row from public.team_members where invite_token = p_token and status = 'pending';
  if v_row.id is null then return jsonb_build_object('ok', false, 'error', 'This invite is invalid or has already been used.'); end if;
  update public.team_members set user_id = auth.uid(), status = 'accepted' where id = v_row.id;
  return jsonb_build_object('ok', true, 'profile_id', v_row.profile_id);
end;
$$;

grant execute on function public.accept_team_invite(uuid) to authenticated;

-- ---------------------------------------------------------
-- Atomic click-count increment with analytics fields
-- ---------------------------------------------------------
create or replace function public.increment_link_click(
  p_link_id uuid, p_referrer text default null, p_country text default null, p_device text default null, p_browser text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare v_profile_id uuid;
begin
  select profile_id into v_profile_id from public.links where id = p_link_id;
  if v_profile_id is null then return; end if;
  update public.links set click_count = click_count + 1 where id = p_link_id;
  insert into public.link_clicks (link_id, profile_id, referrer, country, device, browser)
  values (p_link_id, v_profile_id, p_referrer, p_country, p_device, p_browser);
end;
$$;

grant execute on function public.increment_link_click(uuid, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.link_clicks enable row level security;
alter table public.profile_views enable row level security;
alter table public.leads enable row level security;
alter table public.chatbot_qa enable row level security;
alter table public.product_orders enable row level security;
alter table public.booking_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.team_members enable row level security;

-- Profiles
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable" on public.profiles for select using (is_published = true or auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (public.can_manage_profile(id));

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

-- Links
drop policy if exists "Public links are viewable" on public.links;
create policy "Public links are viewable" on public.links for select using (is_active = true or public.can_manage_profile(profile_id));

drop policy if exists "Owners manage own links" on public.links;
create policy "Owners manage own links" on public.links for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

-- Link clicks
drop policy if exists "Anyone can log a click" on public.link_clicks;
create policy "Anyone can log a click" on public.link_clicks for insert with check (true);

drop policy if exists "Owners read own click data" on public.link_clicks;
create policy "Owners read own click data" on public.link_clicks for select using (public.can_manage_profile(profile_id));

-- Profile views
drop policy if exists "Anyone can log a view" on public.profile_views;
create policy "Anyone can log a view" on public.profile_views for insert with check (true);

drop policy if exists "Owners read own view data" on public.profile_views;
create policy "Owners read own view data" on public.profile_views for select using (public.can_manage_profile(profile_id));

-- Leads
drop policy if exists "Anyone can submit a lead" on public.leads;
create policy "Anyone can submit a lead" on public.leads for insert with check (true);

drop policy if exists "Owners read own leads" on public.leads;
create policy "Owners read own leads" on public.leads for select using (public.can_manage_profile(profile_id));

drop policy if exists "Owners delete own leads" on public.leads;
create policy "Owners delete own leads" on public.leads for delete using (public.can_manage_profile(profile_id));

-- Chatbot QA
drop policy if exists "Public can read chatbot QA for enabled profiles" on public.chatbot_qa;
create policy "Public can read chatbot QA for enabled profiles" on public.chatbot_qa for select using (
  exists (select 1 from public.profiles p where p.id = chatbot_qa.profile_id and p.is_published = true and p.chatbot_enabled = true)
);

drop policy if exists "Owners manage own chatbot QA" on public.chatbot_qa;
create policy "Owners manage own chatbot QA" on public.chatbot_qa for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

-- Product orders
drop policy if exists "Anyone can record a product claim" on public.product_orders;
create policy "Anyone can record a product claim" on public.product_orders for insert with check (true);

drop policy if exists "Owners read own product orders" on public.product_orders;
create policy "Owners read own product orders" on public.product_orders for select using (public.can_manage_profile(profile_id));

-- Booking availability
drop policy if exists "Public can read availability for published profiles" on public.booking_availability;
create policy "Public can read availability for published profiles" on public.booking_availability for select using (
  exists (select 1 from public.profiles p where p.id = booking_availability.profile_id and p.is_published = true)
);

drop policy if exists "Owners manage own availability" on public.booking_availability;
create policy "Owners manage own availability" on public.booking_availability for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

-- Bookings
drop policy if exists "Anyone can create a booking" on public.bookings;
create policy "Anyone can create a booking" on public.bookings for insert with check (true);

drop policy if exists "Owners read own bookings" on public.bookings;
create policy "Owners read own bookings" on public.bookings for select using (public.can_manage_profile(profile_id));

drop policy if exists "Owners update own bookings" on public.bookings;
create policy "Owners update own bookings" on public.bookings for update using (public.can_manage_profile(profile_id));

create or replace view public.public_booking_slots with (security_invoker = true) as
  select profile_id, starts_at, duration_minutes from public.bookings where status = 'confirmed';

grant select on public.public_booking_slots to anon, authenticated;

-- Team members
drop policy if exists "Owners manage their team" on public.team_members;
create policy "Owners manage their team" on public.team_members for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "Members can see their own membership" on public.team_members;
create policy "Members can see their own membership" on public.team_members for select using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- STORAGE BUCKETS
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit) values ('backgrounds', 'backgrounds', true, 26214400) on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit) values ('products', 'products', true, 52428800) on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Background media is publicly accessible" on storage.objects;
create policy "Background media is publicly accessible" on storage.objects for select using (bucket_id = 'backgrounds');
drop policy if exists "Users can upload their own background" on storage.objects;
create policy "Users can upload their own background" on storage.objects for insert with check (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can update their own background" on storage.objects;
create policy "Users can update their own background" on storage.objects for update using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can delete their own background" on storage.objects;
create policy "Users can delete their own background" on storage.objects for delete using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Product files are publicly accessible" on storage.objects;
create policy "Product files are publicly accessible" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "Owners upload their own product files" on storage.objects;
create policy "Owners upload their own product files" on storage.objects for insert with check (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));
drop policy if exists "Owners update their own product files" on storage.objects;
create policy "Owners update their own product files" on storage.objects for update using (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));
drop policy if exists "Owners delete their own product files" on storage.objects;
create policy "Owners delete their own product files" on storage.objects for delete using (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));

-- =========================================================
-- PHASE 5 — "Scale & Polish"
-- Platform admin flag + aggregate stats functions for an internal
-- admin dashboard. See supabase/migrations/005_phase5.sql for the
-- standalone upgrade path.
-- =========================================================

alter table public.profiles add column if not exists is_platform_admin boolean not null default false;

create or replace function public.admin_platform_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_is_admin boolean; v_result jsonb;
begin
  select is_platform_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'total_profiles', (select count(*) from public.profiles),
    'published_profiles', (select count(*) from public.profiles where is_published = true),
    'total_links', (select count(*) from public.links),
    'total_clicks_all_time', (select coalesce(sum(click_count), 0) from public.links),
    'total_views_30d', (select count(*) from public.profile_views where viewed_at >= now() - interval '30 days'),
    'total_clicks_30d', (select count(*) from public.link_clicks where clicked_at >= now() - interval '30 days'),
    'total_leads', (select count(*) from public.leads),
    'total_bookings', (select count(*) from public.bookings where status = 'confirmed'),
    'total_product_orders', (select count(*) from public.product_orders),
    'new_profiles_7d', (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'chatbot_enabled_count', (select count(*) from public.profiles where chatbot_enabled = true),
    'custom_domain_count', (select count(*) from public.profiles where custom_domain is not null)
  ) into v_result;
  return v_result;
end;
$$;
grant execute on function public.admin_platform_stats() to authenticated;

create or replace function public.admin_recent_profiles(p_limit integer default 25)
returns table (id uuid, username text, display_name text, is_published boolean, created_at timestamptz, link_count bigint, total_clicks bigint)
language plpgsql security definer set search_path = public as $$
declare v_is_admin boolean;
begin
  select is_platform_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then raise exception 'Not authorized'; end if;
  return query
    select p.id, p.username, p.display_name, p.is_published, p.created_at,
      (select count(*) from public.links l where l.profile_id = p.id) as link_count,
      (select coalesce(sum(l.click_count), 0) from public.links l where l.profile_id = p.id) as total_clicks
    from public.profiles p order by p.created_at desc limit p_limit;
end;
$$;
grant execute on function public.admin_recent_profiles(integer) to authenticated;

-- =========================================================
-- PHASE 6 — "Trust & Polish"
-- First-time dashboard product tour tracking.
-- =========================================================
alter table public.profiles add column if not exists has_seen_tour boolean not null default false;

-- =========================================================
-- PHASE 7 — "Premium Design System + Missing Features"
-- Link collections (folders), page password protection.
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists public.link_collections (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 80),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists link_collections_profile_id_idx on public.link_collections (profile_id, position);
alter table public.link_collections enable row level security;

drop policy if exists "Public collections are viewable" on public.link_collections;
create policy "Public collections are viewable" on public.link_collections for select using (
  exists (select 1 from public.profiles p where p.id = link_collections.profile_id and p.is_published = true)
  or public.can_manage_profile(profile_id)
);
drop policy if exists "Owners manage own collections" on public.link_collections;
create policy "Owners manage own collections" on public.link_collections for all
  using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

alter table public.links add column if not exists collection_id uuid references public.link_collections(id) on delete set null;
create index if not exists links_collection_id_idx on public.links (collection_id);

alter table public.profiles add column if not exists is_password_protected boolean not null default false;
alter table public.profiles add column if not exists page_password_hash text;

create or replace function public.verify_page_password(p_profile_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text;
begin
  select page_password_hash into v_hash from public.profiles where id = p_profile_id;
  if v_hash is null then return true; end if;
  return crypt(p_password, v_hash) = v_hash;
end;
$$;
grant execute on function public.verify_page_password(uuid, text) to anon, authenticated;

create or replace function public.set_page_password(p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'Not authorized'; end if;
  if p_password is null or length(p_password) = 0 then
    update public.profiles set page_password_hash = null, is_password_protected = false where id = auth.uid();
  else
    update public.profiles set page_password_hash = crypt(p_password, gen_salt('bf')), is_password_protected = true where id = auth.uid();
  end if;
end;
$$;
grant execute on function public.set_page_password(text) to authenticated;
