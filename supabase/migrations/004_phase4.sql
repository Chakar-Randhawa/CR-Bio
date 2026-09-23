-- Phase 4 migration — run only if you already have Phases 1-3 applied.

-- TEAM MANAGEMENT
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
alter table public.team_members enable row level security;

drop policy if exists "Owners manage their team" on public.team_members;
create policy "Owners manage their team" on public.team_members for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists "Members can see their own membership" on public.team_members;
create policy "Members can see their own membership" on public.team_members for select using (auth.uid() = user_id);

create or replace function public.can_manage_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() = p_profile_id or exists (
    select 1 from public.team_members tm where tm.profile_id = p_profile_id and tm.user_id = auth.uid() and tm.status = 'accepted'
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

-- Extend existing owner-only policies to also allow accepted editors
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (public.can_manage_profile(id));
drop policy if exists "Owners manage own links" on public.links;
create policy "Owners manage own links" on public.links for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));
drop policy if exists "Owners read own click data" on public.link_clicks;
create policy "Owners read own click data" on public.link_clicks for select using (public.can_manage_profile(profile_id));
drop policy if exists "Owners read own view data" on public.profile_views;
create policy "Owners read own view data" on public.profile_views for select using (public.can_manage_profile(profile_id));
drop policy if exists "Owners read own leads" on public.leads;
create policy "Owners read own leads" on public.leads for select using (public.can_manage_profile(profile_id));
drop policy if exists "Owners delete own leads" on public.leads;
create policy "Owners delete own leads" on public.leads for delete using (public.can_manage_profile(profile_id));

-- CHATBOT
alter table public.profiles add column if not exists chatbot_enabled boolean not null default false;
alter table public.profiles add column if not exists chatbot_name text not null default 'Assistant';
alter table public.profiles add column if not exists chatbot_welcome_message text not null default 'Hi! Ask me anything about this page.';
alter table public.profiles add column if not exists chatbot_fallback_message text not null default 'I don''t have an answer for that yet — try one of the links below, or reach out directly.';

create table if not exists public.chatbot_qa (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) <= 200),
  answer text not null check (char_length(answer) <= 1000),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists chatbot_qa_profile_id_idx on public.chatbot_qa (profile_id, position);
alter table public.chatbot_qa enable row level security;
drop policy if exists "Public can read chatbot QA for enabled profiles" on public.chatbot_qa;
create policy "Public can read chatbot QA for enabled profiles" on public.chatbot_qa for select using (
  exists (select 1 from public.profiles p where p.id = chatbot_qa.profile_id and p.is_published = true and p.chatbot_enabled = true)
);
drop policy if exists "Owners manage own chatbot QA" on public.chatbot_qa;
create policy "Owners manage own chatbot QA" on public.chatbot_qa for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

-- PRODUCTS
alter table public.links drop constraint if exists links_block_type_check;
alter table public.links add constraint links_block_type_check check (block_type in ('link', 'lead_capture', 'embed', 'product', 'booking'));
alter table public.links add column if not exists price_cents integer check (price_cents is null or price_cents >= 0);
alter table public.links add column if not exists currency text not null default 'USD';
alter table public.links add column if not exists delivery_type text check (delivery_type is null or delivery_type in ('file', 'external'));
alter table public.links add column if not exists file_url text;
alter table public.links add column if not exists external_checkout_url text;

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
alter table public.product_orders enable row level security;
drop policy if exists "Anyone can record a product claim" on public.product_orders;
create policy "Anyone can record a product claim" on public.product_orders for insert with check (true);
drop policy if exists "Owners read own product orders" on public.product_orders;
create policy "Owners read own product orders" on public.product_orders for select using (public.can_manage_profile(profile_id));

insert into storage.buckets (id, name, public, file_size_limit) values ('products', 'products', true, 52428800) on conflict (id) do nothing;
drop policy if exists "Product files are publicly accessible" on storage.objects;
create policy "Product files are publicly accessible" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "Owners upload their own product files" on storage.objects;
create policy "Owners upload their own product files" on storage.objects for insert with check (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));
drop policy if exists "Owners update their own product files" on storage.objects;
create policy "Owners update their own product files" on storage.objects for update using (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));
drop policy if exists "Owners delete their own product files" on storage.objects;
create policy "Owners delete their own product files" on storage.objects for delete using (bucket_id = 'products' and public.can_manage_profile((storage.foldername(name))[1]::uuid));

-- BOOKING
alter table public.profiles add column if not exists booking_timezone text not null default 'UTC';
alter table public.profiles add column if not exists booking_duration_minutes integer not null default 30 check (booking_duration_minutes > 0 and booking_duration_minutes <= 480);

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
alter table public.booking_availability enable row level security;
drop policy if exists "Public can read availability for published profiles" on public.booking_availability;
create policy "Public can read availability for published profiles" on public.booking_availability for select using (
  exists (select 1 from public.profiles p where p.id = booking_availability.profile_id and p.is_published = true)
);
drop policy if exists "Owners manage own availability" on public.booking_availability;
create policy "Owners manage own availability" on public.booking_availability for all using (public.can_manage_profile(profile_id)) with check (public.can_manage_profile(profile_id));

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
alter table public.bookings enable row level security;
drop policy if exists "Anyone can create a booking" on public.bookings;
create policy "Anyone can create a booking" on public.bookings for insert with check (true);
drop policy if exists "Owners read own bookings" on public.bookings;
create policy "Owners read own bookings" on public.bookings for select using (public.can_manage_profile(profile_id));
drop policy if exists "Owners update own bookings" on public.bookings;
create policy "Owners update own bookings" on public.bookings for update using (public.can_manage_profile(profile_id));

create or replace view public.public_booking_slots with (security_invoker = true) as
  select profile_id, starts_at, duration_minutes from public.bookings where status = 'confirmed';
grant select on public.public_booking_slots to anon, authenticated;

-- AUTO-ORDER + TRANSLATIONS
alter table public.profiles add column if not exists auto_order_links boolean not null default false;
alter table public.profiles add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.links add column if not exists translations jsonb not null default '{}'::jsonb;
