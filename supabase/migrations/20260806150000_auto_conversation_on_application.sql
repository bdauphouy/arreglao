-- Applying to a post used to only create a conversation once the poster
-- explicitly tapped "Enviar mensaje" from the applicant's profile — #34
-- wants it automatic instead. The insert has to happen here rather than
-- client-side from applyToAnnonce(): the applicant is the one triggering
-- it, and "Posters can start a conversation from their annonce" only lets
-- the poster insert into conversations. Same security-definer-trigger
-- pattern as advance_annonce_on_application() in the applications migration
-- to cross that boundary safely.
create function public.create_conversation_on_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  poster uuid;
begin
  select poster_id into poster from public.annonces where id = new.annonce_id;

  insert into public.conversations (annonce_id, participant_one_id, participant_two_id)
  values (new.annonce_id, poster, new.applicant_id)
  on conflict (
    annonce_id,
    least(participant_one_id, participant_two_id),
    greatest(participant_one_id, participant_two_id)
  ) do nothing;

  return new;
end;
$$;

create trigger applications_create_conversation
  after insert on public.applications
  for each row execute procedure public.create_conversation_on_application();
