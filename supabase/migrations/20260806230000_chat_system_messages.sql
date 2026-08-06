-- #40: when a poster assigns/chooses a helper, post a system chat message
-- notifying them, instead of relying solely on the (easy-to-miss) push
-- notification. is_system distinguishes it from a regular chat bubble on
-- the client without relaxing the sender_id not-null / RLS shape.
alter table public.messages add column is_system boolean not null default false;

-- Same get-or-create-conversation shape as create_conversation_on_-
-- application(): the applicant may have applied with no comment, so no
-- conversation (and therefore no seeded message) is guaranteed to exist
-- yet by the time the poster assigns them. Security definer for the same
-- reason as that trigger — the poster only has UPDATE rights on annonces,
-- not INSERT rights into another pair's conversations/messages.
create function public.notify_helper_on_assignment()
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
    insert into public.conversations (annonce_id, participant_one_id, participant_two_id)
    values (new.id, new.poster_id, new.chosen_helper_id)
    on conflict (
      annonce_id,
      least(participant_one_id, participant_two_id),
      greatest(participant_one_id, participant_two_id)
    ) do nothing
    returning id into conv_id;

    if conv_id is null then
      select id into conv_id
      from public.conversations
      where annonce_id = new.id
        and least(participant_one_id, participant_two_id) = least(new.poster_id, new.chosen_helper_id)
        and greatest(participant_one_id, participant_two_id) = greatest(new.poster_id, new.chosen_helper_id);
    end if;

    insert into public.messages (conversation_id, sender_id, body, is_system)
    values (conv_id, new.poster_id, 'Has sido elegido/a para este trabajo.', true);
  end if;

  return new;
end;
$$;

create trigger annonces_notify_helper_on_assignment
  after update on public.annonces
  for each row execute procedure public.notify_helper_on_assignment();
