-- =========================================================
-- CRbio — Phase 5 migration ("Scale & Polish")
-- Run after Phases 1-4. Idempotent.
-- =========================================================

-- ---------------------------------------------------------
-- PLATFORM ADMIN FLAG
-- Deliberately NOT settable through the app UI — only via direct
-- database access (Supabase Table Editor or SQL) so no app-level
-- bug or bad actor can self-promote to admin.
-- ---------------------------------------------------------
alter table public.profiles add column if not exists is_platform_admin boolean not null default false;

-- ---------------------------------------------------------
-- Admin aggregate stats — security definer so it can read across
-- every creator's data without weakening any per-row RLS policy.
-- Returns only aggregate counts, never individual private records
-- (leads, bookings, chatbot content stay untouched by this).
-- ---------------------------------------------------------
create or replace function public.admin_platform_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_result jsonb;
begin
  select is_platform_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

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

-- ---------------------------------------------------------
-- Admin recent creators list — basic public-facing fields only
-- (username, display name, published status, join date, totals).
-- Never returns email, bio content, or any private sub-resource.
-- ---------------------------------------------------------
create or replace function public.admin_recent_profiles(p_limit integer default 25)
returns table (
  id uuid,
  username text,
  display_name text,
  is_published boolean,
  created_at timestamptz,
  link_count bigint,
  total_clicks bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  select is_platform_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

  return query
    select
      p.id, p.username, p.display_name, p.is_published, p.created_at,
      (select count(*) from public.links l where l.profile_id = p.id) as link_count,
      (select coalesce(sum(l.click_count), 0) from public.links l where l.profile_id = p.id) as total_clicks
    from public.profiles p
    order by p.created_at desc
    limit p_limit;
end;
$$;

grant execute on function public.admin_recent_profiles(integer) to authenticated;
