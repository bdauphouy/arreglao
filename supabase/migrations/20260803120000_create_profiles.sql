-- One profile row per authenticated user, created automatically on signup.
-- Later tickets extend this table (location, category tags, average_rating).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert policy for end users: rows are created only via handle_new_user()
-- below, which runs as security definer and bypasses RLS.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
