-- Provider-facing profile details (rate, badges, equipment, verification)
-- and a reviews table, for the AlloVoisins/Yoojo-style profile screen (#see
-- profile redesign). average_rating already existed as a column intended to
-- be "populated once reviews exist" (see 20260803170000's comment) — this
-- adds review_count alongside it and a trigger that keeps both in sync with
-- the reviews table, rather than requiring callers to maintain them by hand.

alter table public.profiles
  add column hourly_rate numeric,
  add column review_count integer not null default 0,
  add column is_top_provider boolean not null default false,
  add column experience_years integer,
  add column certification text,
  add column equipment_tags text[] not null default '{}',
  add column commitment_tags text[] not null default '{}',
  add column service_radius_km integer,
  add column identity_verified boolean not null default false,
  add column phone_verified boolean not null default false;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  relationship_rating smallint check (relationship_rating between 1 and 5),
  punctuality_rating smallint check (punctuality_rating between 1 and 5),
  comment text not null,
  service_label text,
  photo_url text,
  is_repeat_customer boolean not null default false,
  -- Free-text snapshot of the reviewer's city at review time (e.g. "Piantini"),
  -- not a live join to their profile location.
  reviewer_location_label text,
  created_at timestamptz not null default now()
);

create index reviews_profile_id_created_at_idx
  on public.reviews (profile_id, created_at desc);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  to authenticated
  using (true);

create policy "Users can leave reviews for others, not themselves"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id and auth.uid() <> profile_id);

create function public.refresh_profile_rating_stats(target_profile_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set
    average_rating = (
      select avg(rating)::numeric(3,2) from public.reviews where profile_id = target_profile_id
    ),
    review_count = (
      select count(*) from public.reviews where profile_id = target_profile_id
    )
  where id = target_profile_id;
end;
$$;

create function public.handle_review_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_rating_stats(old.profile_id);
    return old;
  end if;

  perform public.refresh_profile_rating_stats(new.profile_id);
  if tg_op = 'UPDATE' and old.profile_id <> new.profile_id then
    perform public.refresh_profile_rating_stats(old.profile_id);
  end if;
  return new;
end;
$$;

create trigger reviews_refresh_profile_stats
  after insert or update or delete on public.reviews
  for each row execute procedure public.handle_review_change();
