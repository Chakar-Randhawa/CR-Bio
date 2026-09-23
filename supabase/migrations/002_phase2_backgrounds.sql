-- Phase 2 migration — run only if you already have Phase 1's schema applied.
insert into storage.buckets (id, name, public, file_size_limit) values ('backgrounds', 'backgrounds', true, 26214400) on conflict (id) do nothing;
drop policy if exists "Background media is publicly accessible" on storage.objects;
create policy "Background media is publicly accessible" on storage.objects for select using (bucket_id = 'backgrounds');
drop policy if exists "Users can upload their own background" on storage.objects;
create policy "Users can upload their own background" on storage.objects for insert with check (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can update their own background" on storage.objects;
create policy "Users can update their own background" on storage.objects for update using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can delete their own background" on storage.objects;
create policy "Users can delete their own background" on storage.objects for delete using (bucket_id = 'backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
