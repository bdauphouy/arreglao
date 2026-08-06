-- #41: withdrawing an application used to be a dead end — the table's
-- unique (annonce_id, applicant_id) constraint meant a withdrawn row
-- permanently blocked ever applying to that annonce again. Replace it with
-- a partial index that only guards against duplicate *active* applications,
-- so a fresh apply after withdrawing is a normal insert (and gets all the
-- usual insert-trigger side effects — advancing the annonce to in_review,
-- seeding the conversation — for free, instead of needing new upsert-path
-- triggers).
alter table public.applications
  drop constraint applications_annonce_id_applicant_id_key;

create unique index applications_active_unique_idx
  on public.applications (annonce_id, applicant_id)
  where status <> 'withdrawn';
