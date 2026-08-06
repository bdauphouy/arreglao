-- Profile screen (#31): let a helper tag themselves with a custom category
-- when the suggested list doesn't fit, same request as the publish flow
-- (#29). profiles.category_tags becomes free text; the job_category enum
-- has no remaining columns after this, so it's dropped.
alter table public.profiles
  alter column category_tags drop default;

alter table public.profiles
  alter column category_tags type text[]
  using category_tags::text[];

alter table public.profiles
  alter column category_tags set default '{}'::text[];

alter table public.profiles
  add constraint profiles_category_tags_no_blank check (array_position(category_tags, '') is null);

drop type public.job_category;
