-- Phase 3 migration — run only if you already have Phases 1-2 applied.
alter table public.links add column if not exists block_type text not null default 'link' check (block_type in ('link', 'lead_capture', 'embed'));
alter table public.links add column if not exists description text check (char_length(description) <= 280);
alter table public.links add column if not exists embed_provider text check (embed_provider is null or embed_provider in ('youtube', 'spotify', 'tiktok'));
alter table public.links add column if not exists display_style text not null default 'button' check (display_style in ('button', 'icon'));
alter table public.links add column if not exists starts_at timestamptz;
alter table public.links add column if not exists ends_at timestamptz;
create index if not exists links_schedule_idx on public.links (profile_id, starts_at, ends_at);

alter table public.link_clicks add column if not exists country text;
alter table public.link_clicks add column if not exists device text;
alter table public.link_clicks add column if not exists browser text;
alter table public.profile_views add column if not exists country text;
alter table public.profile_views add column if not exists device text;
alter table public.profile_views add column if not exists browser text;

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name text,
  captured_at timestamptz not null default now()
);
alter table public.leads enable row level security;
drop policy if exists "Anyone can submit a lead" on public.leads;
create policy "Anyone can submit a lead" on public.leads for insert with check (true);
drop policy if exists "Owners read own leads" on public.leads;
create policy "Owners read own leads" on public.leads for select using (profile_id = auth.uid());
drop policy if exists "Owners delete own leads" on public.leads;
create policy "Owners delete own leads" on public.leads for delete using (profile_id = auth.uid());

alter table public.profiles add column if not exists custom_domain text unique;
alter table public.profiles add column if not exists custom_domain_verified boolean not null default false;

-- Re-run schema.sql's increment_link_click definition to add analytics params:
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
