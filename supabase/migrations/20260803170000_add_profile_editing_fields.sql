-- Profile editing (#10): bio, manual-pin location, helper category tags,
-- and a computed average rating column (populated once reviews exist).
-- job_category is shared with the future annonces table (#11), which
-- reuses the same enum for its own category column.
create type public.job_category as enum ('repairs', 'cleaning', 'moving', 'renovation', 'other');

alter table public.profiles
  add column bio text,
  add column location_lat double precision,
  add column location_lng double precision,
  add column category_tags public.job_category[] not null default '{}',
  add column average_rating numeric;

-- Avatar images: one folder per user (avatars/<user_id>/<filename>), publicly
-- readable, writable only by the owning user.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
