-- 2026-08-05 revision pass (GH issues #22-#28): drop the in-app-payment/escrow
-- model in favor of per-job pricing negotiated between poster and helper.
--
-- - annonces gain a budget range (poster-set) and a maintained applications
--   count (shown on home feed cards, per #22).
-- - applications gain a proposed_price (helper's own bid, indriver-style).
-- - profiles gain address_label (human-readable address text, alongside the
--   existing lat/lng, for the new Nominatim-backed autocomplete input, #24)
--   and lose hourly_rate (never actually settable from any screen, and
--   doesn't fit per-job bidding, #25) and display_name (superseded by always
--   deriving the display name from first_name/last_name, #24).
-- - a new saved_annonces table backs the home feed's bookmark button (#22).

alter table public.annonces
  add column budget_min numeric,
  add column budget_max numeric,
  add column applications_count integer not null default 0;

alter table public.applications
  add column proposed_price numeric not null default 0;

alter table public.profiles
  add column address_label text,
  drop column hourly_rate,
  drop column display_name;

create table public.saved_annonces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  annonce_id uuid not null references public.annonces (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, annonce_id)
);

alter table public.saved_annonces enable row level security;

create policy "Users can view their own saved annonces"
  on public.saved_annonces for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can save annonces"
  on public.saved_annonces for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave their own annonces"
  on public.saved_annonces for delete
  to authenticated
  using (auth.uid() = user_id);

-- Keeps annonces.applications_count in sync with the applications table,
-- same security-definer-trigger pattern as reviews_refresh_profile_stats()
-- in 20260803210000_add_provider_details_and_reviews.sql.
create function public.refresh_annonce_applications_count(target_annonce_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.annonces
  set applications_count = (
    select count(*) from public.applications where annonce_id = target_annonce_id
  )
  where id = target_annonce_id;
end;
$$;

create function public.handle_application_count_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_annonce_applications_count(old.annonce_id);
    return old;
  end if;

  perform public.refresh_annonce_applications_count(new.annonce_id);
  return new;
end;
$$;

create trigger applications_refresh_annonce_count
  after insert or delete on public.applications
  for each row execute procedure public.handle_application_count_change();
