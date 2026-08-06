-- Product call reversed: no more freeform/custom categories for annonces
-- (#29) or profile category tags (#31). Categories are a closed list again,
-- with a single 'otro' catch-all instead of letting users type anything.
-- Any existing free-text value that isn't one of the nine original
-- suggestions collapses to 'otro' during the conversion.

create type public.job_category as enum (
  'bricolaje',
  'jardineria',
  'mudanza',
  'limpieza',
  'ninos',
  'animales',
  'informatica',
  'ayuda_domicilio',
  'clases_particulares',
  'otro'
);

alter table public.annonces
  drop constraint annonces_category_not_blank;

alter table public.annonces
  alter column category type public.job_category
  using (
    case
      when category in (
        'bricolaje', 'jardineria', 'mudanza', 'limpieza', 'ninos', 'animales',
        'informatica', 'ayuda_domicilio', 'clases_particulares'
      ) then category
      else 'otro'
    end::public.job_category
  );

alter table public.profiles
  drop constraint profiles_category_tags_no_blank;

alter table public.profiles
  alter column category_tags drop default;

-- Postgres's ALTER COLUMN TYPE ... USING clause can't unnest+dedupe an
-- array inline, so the remap (and drop of now-duplicate 'otro' entries)
-- goes through a throwaway helper function, same pattern as the original
-- 20260803190000 enum migration.
create function public.job_category_tags_to_enum(tags text[])
returns public.job_category[]
language plpgsql
as $$
declare
  result public.job_category[] := '{}';
  tag text;
  mapped public.job_category;
begin
  foreach tag in array tags loop
    mapped := (case
      when tag in (
        'bricolaje', 'jardineria', 'mudanza', 'limpieza', 'ninos', 'animales',
        'informatica', 'ayuda_domicilio', 'clases_particulares'
      ) then tag
      else 'otro'
    end)::public.job_category;
    if not (mapped = any(result)) then
      result := result || mapped;
    end if;
  end loop;
  return result;
end;
$$;

alter table public.profiles
  alter column category_tags type public.job_category[]
  using public.job_category_tags_to_enum(category_tags);

alter table public.profiles
  alter column category_tags set default '{}'::public.job_category[];

drop function public.job_category_tags_to_enum(text[]);
