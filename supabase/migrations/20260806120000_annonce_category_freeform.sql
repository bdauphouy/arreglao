-- Publish flow (#29): let posters type a custom category when the one they
-- want isn't in the suggested list, instead of being limited to the fixed
-- job_category enum. annonces.category becomes free text; profiles.category_tags
-- (the suggested-skills picker on a helper's profile) is untouched and stays
-- the job_category enum — that's a separate, not-yet-scoped decision (#31).
alter table public.annonces
  alter column category type text
  using category::text;

alter table public.annonces
  add constraint annonces_category_not_blank check (btrim(category) <> '');
