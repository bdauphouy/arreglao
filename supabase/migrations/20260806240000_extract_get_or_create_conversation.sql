-- #40 follow-up: notify_helper_on_assignment() (previous migration) duplicated
-- create_conversation_on_application()'s get-or-create-conversation dance
-- almost verbatim, differing only in which two ids are the participants —
-- pull it into one shared helper both triggers call instead of two copies
-- that'll drift apart the next time either changes.
create function public.get_or_create_conversation(
  target_annonce_id uuid,
  user_a uuid,
  user_b uuid
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  conv_id uuid;
begin
  insert into public.conversations (annonce_id, participant_one_id, participant_two_id)
  values (target_annonce_id, user_a, user_b)
  on conflict (
    annonce_id,
    least(participant_one_id, participant_two_id),
    greatest(participant_one_id, participant_two_id)
  ) do nothing
  returning id into conv_id;

  if conv_id is null then
    select id into conv_id
    from public.conversations
    where annonce_id = target_annonce_id
      and least(participant_one_id, participant_two_id) = least(user_a, user_b)
      and greatest(participant_one_id, participant_two_id) = greatest(user_a, user_b);
  end if;

  return conv_id;
end;
$$;

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
  conv_id := public.get_or_create_conversation(new.annonce_id, poster, new.applicant_id);

  insert into public.messages (conversation_id, sender_id, body)
  values (conv_id, new.applicant_id, new.message);

  return new;
end;
$$;

create or replace function public.notify_helper_on_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  conv_id uuid;
begin
  if new.status = 'assigned'
    and (old.status is distinct from 'assigned' or old.chosen_helper_id is distinct from new.chosen_helper_id)
  then
    conv_id := public.get_or_create_conversation(new.id, new.poster_id, new.chosen_helper_id);

    insert into public.messages (conversation_id, sender_id, body, is_system)
    values (conv_id, new.poster_id, 'Has sido elegido/a para este trabajo.', true);
  end if;

  return new;
end;
$$;
