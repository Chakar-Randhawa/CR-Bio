-- =========================================================
-- CRbio — Phase 7 migration ("Premium Design System + Missing Features")
-- Run after Phases 1-6. Idempotent.
-- =========================================================

-- ---------------------------------------------------------
-- LINK COLLECTIONS (folders) — group blocks together on the page
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- PAGE PASSWORD PROTECTION (Enhance)
-- ---------------------------------------------------------
alter table public.profiles add column if not exists is_password_protected boolean not null default false;
alter table public.profiles add column if not exists page_password_hash text;

-- Verifies a visitor-entered password against the stored hash without
-- ever exposing the hash itself to the client.
create or replace function public.verify_page_password(p_profile_id uuid, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select page_password_hash into v_hash from public.profiles where id = p_profile_id;
  if v_hash is null then
    return true; -- not password protected
  end if;
  return crypt(p_password, v_hash) = v_hash;
end;
$$;

grant execute on function public.verify_page_password(uuid, text) to anon, authenticated;

create or replace function public.set_page_password(p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  if p_password is null or length(p_password) = 0 then
    update public.profiles set page_password_hash = null, is_password_protected = false where id = auth.uid();
  else
    update public.profiles set page_password_hash = crypt(p_password, gen_salt('bf')), is_password_protected = true where id = auth.uid();
  end if;
end;
$$;

grant execute on function public.set_page_password(text) to authenticated;

-- pgcrypto powers crypt()/gen_salt() above
create extension if not exists pgcrypto;
