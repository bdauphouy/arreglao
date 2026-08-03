-- Post & browse annonces (#11). Status lifecycle and category enum reuse
-- per the domain model (#4): open -> (auto, first application) in_review ->
-- (poster picks) assigned -> (poster marks) done; cancelled reachable from
-- open/in_review only. category reuses profiles.category_tags' job_category
-- enum, per #4's "reusing the annonce category enum" instruction.
create type public.annonce_status as enum ('open', 'in_review', 'assigned', 'done', 'cancelled');

create table public.annonces (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category public.job_category not null,
  location_lat double precision not null,
  location_lng double precision not null,
  status public.annonce_status not null default 'open',
  chosen_helper_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.annonces enable row level security;

create policy "Annonces are viewable by everyone"
  on public.annonces for select
  to authenticated
  using (true);

create policy "Posters can create their own annonces"
  on public.annonces for insert
  to authenticated
  with check (auth.uid() = poster_id);

create policy "Posters can update their own annonces"
  on public.annonces for update
  to authenticated
  using (auth.uid() = poster_id)
  with check (auth.uid() = poster_id);
