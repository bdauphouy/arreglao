-- Fix for sync_applications_on_annonce_assignment() (added in
-- 20260806180000): the CASE expression's branches are untyped string
-- literals, which Postgres resolves to `text`, not `application_status` —
-- assigning that straight into applications.status fails with "column
-- \"status\" is of type application_status but expression is of type
-- text". Cast the CASE result explicitly.
create or replace function public.sync_applications_on_annonce_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'assigned'
    and (old.status is distinct from 'assigned' or old.chosen_helper_id is distinct from new.chosen_helper_id)
  then
    update public.applications
    set status = (case when applicant_id = new.chosen_helper_id then 'accepted' else 'rejected' end)::application_status
    where annonce_id = new.id
      and status <> 'withdrawn';
  elsif old.status = 'assigned' and new.status <> 'assigned' then
    update public.applications
    set status = 'pending'
    where annonce_id = new.id
      and status <> 'withdrawn';
  end if;
  return new;
end;
$$;
