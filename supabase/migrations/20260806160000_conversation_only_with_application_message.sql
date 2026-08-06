-- Follow-up to 20260806150000: a bare application (price only, no comment)
-- doesn't carry enough for a poster to act on, so only auto-open a
-- conversation when the applicant actually wrote something — and seed that
-- comment as the conversation's first message instead of leaving the thread
-- empty, so the poster sees exactly what the applicant said without having
-- to flip back to the annonce's applicant list.
create or replace function public.create_conversation_on_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  poster uuid;
  conv_id uuid;
begin
  if coalesce(btrim(new.message), '') = '' then
    return new;
  end if;

  select poster_id into poster from public.annonces where id = new.annonce_id;

  insert into public.conversations (annonce_id, participant_one_id, participant_two_id)
  values (new.annonce_id, poster, new.applicant_id)
  on conflict (
    annonce_id,
    least(participant_one_id, participant_two_id),
    greatest(participant_one_id, participant_two_id)
  ) do nothing
  returning id into conv_id;

  -- A conversation for this annonce/pair can already exist (e.g. the poster
  -- opened the chat from the applicant's profile before they applied) — the
  -- insert above is then a no-op and returns no id, so look it up instead.
  if conv_id is null then
    select id into conv_id
    from public.conversations
    where annonce_id = new.annonce_id
      and least(participant_one_id, participant_two_id) = least(poster, new.applicant_id)
      and greatest(participant_one_id, participant_two_id) = greatest(poster, new.applicant_id);
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (conv_id, new.applicant_id, new.message);

  return new;
end;
$$;
