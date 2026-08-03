-- Home screen redesign: replace the placeholder 5-value job_category enum
-- with the real category taxonomy (bricolaje, jardineria, mudanza, limpieza,
-- ninos, animales, informatica, ayuda_domicilio, clases_particulares).
--
-- Postgres can't drop enum values in place, so this creates a new type,
-- migrates both columns that use it via an explicit value remap, then drops
-- the old type and renames the new one into its place.
--
-- profiles.category_tags is an array column, and Postgres's ALTER COLUMN
-- TYPE ... USING clause doesn't allow a subquery in the transform
-- expression (needed to remap each array element), so the remap for that
-- column goes through a throwaway helper function instead of an inline
-- `unnest`/`array_agg` subquery.

create type public.job_category_new as enum (
  'bricolaje',
  'jardineria',
  'mudanza',
  'limpieza',
  'ninos',
  'animales',
  'informatica',
  'ayuda_domicilio',
  'clases_particulares'
);

create function public.job_category_v1_to_v2(tags public.job_category[])
returns public.job_category_new[]
language plpgsql
as $$
declare
  result public.job_category_new[] := '{}';
  tag public.job_category;
begin
  foreach tag in array tags loop
    result := result || (case tag::text
      when 'cleaning' then 'limpieza'
      when 'moving' then 'mudanza'
      else 'bricolaje'
    end::public.job_category_new);
  end loop;
  return result;
end;
$$;

alter table public.profiles
  alter column category_tags drop default;

alter table public.profiles
  alter column category_tags type public.job_category_new[]
  using public.job_category_v1_to_v2(category_tags);

alter table public.profiles
  alter column category_tags set default '{}'::public.job_category_new[];

alter table public.annonces
  alter column category type public.job_category_new
  using (
    case category::text
      when 'cleaning' then 'limpieza'
      when 'moving' then 'mudanza'
      else 'bricolaje'
    end::public.job_category_new
  );

drop function public.job_category_v1_to_v2(public.job_category[]);
drop type public.job_category;
alter type public.job_category_new rename to job_category;
