-- =========================================================
-- CRbio — Phase 6 migration ("Trust & Polish")
-- Run after Phases 1-5. Idempotent.
-- =========================================================

-- Tracks whether a creator has completed (or skipped) the first-time
-- dashboard product tour, so it only shows once.
alter table public.profiles add column if not exists has_seen_tour boolean not null default false;
