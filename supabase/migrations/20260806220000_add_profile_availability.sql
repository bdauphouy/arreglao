-- Profile screen feedback (#39): let a helper mark themselves unavailable so
-- they stop showing up on the Helpers screen (#38) without deleting their
-- category tags or other profile data.
alter table public.profiles
  add column is_available boolean not null default true;
