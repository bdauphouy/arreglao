-- Per-application status (#pending/accepted/rejected/withdrawn), backing:
-- - the Postulaciones grouping (En revisión / Aprobado / Rechazado /
--   Cancelado);
-- - an applicant withdrawing their own application ("not ready at the
--   end");
-- - a poster changing their mind after assigning someone (un-assign,
--   reopen the post for review).
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

alter table public.applications
  add column status public.application_status not null default 'pending';

-- Applicants manage their own application (the client only ever sets
-- status to 'withdrawn' via withdrawApplication() — same "RLS doesn't
-- restrict which columns/values, the API layer does" posture as the
-- existing "Posters can update their own annonces" policy).
create policy "Applicants can update their own application"
  on public.applications for update
  to authenticated
  using (auth.uid() = applicant_id)
  with check (auth.uid() = applicant_id);

-- Keeps applications in sync when a poster assigns (accept the chosen one,
-- reject every other still-live application) or un-assigns (put every
-- still-live application back to pending so review can start over).
-- Security definer: the poster only has UPDATE rights on annonces, not on
-- other applicants' application rows — same boundary-crossing pattern as
-- advance_annonce_on_application() in the original applications migration.
create function public.sync_applications_on_annonce_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'assigned'
    and (old.status is distinct from 'assigned' or old.chosen_helper_id is distinct from new.chosen_helper_id)
  then
    update public.applications
    set status = case when applicant_id = new.chosen_helper_id then 'accepted' else 'rejected' end
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

create trigger annonces_sync_application_statuses
  after update on public.annonces
  for each row execute procedure public.sync_applications_on_annonce_assignment();

-- If the applicant the poster had chosen withdraws, the annonce can't stay
-- 'assigned' with a dangling chosen_helper_id — reopen it so the poster can
-- pick someone else (their other, previously-rejected applications flow
-- back to 'pending' via the trigger above). Security definer: the
-- applicant only has UPDATE rights on their own application, not on the
-- annonce.
create function public.reopen_annonce_on_chosen_withdrawal()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'withdrawn' and old.status is distinct from 'withdrawn' then
    update public.annonces
    set status = 'in_review', chosen_helper_id = null
    where id = new.annonce_id
      and chosen_helper_id = new.applicant_id
      and status = 'assigned';
  end if;
  return new;
end;
$$;

create trigger applications_reopen_annonce_on_withdrawal
  after update on public.applications
  for each row execute procedure public.reopen_annonce_on_chosen_withdrawal();

-- applications_count (shown as "N aplicantes" on annonce cards) should
-- read as "people still in the running", not include withdrawals.
create or replace function public.refresh_annonce_applications_count(target_annonce_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.annonces
  set applications_count = (
    select count(*) from public.applications
    where annonce_id = target_annonce_id and status <> 'withdrawn'
  )
  where id = target_annonce_id;
end;
$$;

-- The original trigger only ran on insert/delete, so a withdrawal (an
-- update, not a delete — applications are kept for the Postulaciones
-- history) never recomputed the count. handle_application_count_change()
-- itself needs no change: it already just re-derives the count from
-- new.annonce_id for any non-delete op.
create or replace trigger applications_refresh_annonce_count
  after insert or delete or update of status on public.applications
  for each row execute procedure public.handle_application_count_change();
