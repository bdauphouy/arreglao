-- Read/unread status per message, backing the unread-count badge on the
-- Mensajes tab. Existing messages backfill as 'read' (nobody should see a
-- pile of "new" messages appear the moment this ships) — only messages sent
-- from here on start life 'unread'.
create type public.message_status as enum ('unread', 'read');

alter table public.messages
  add column status public.message_status not null default 'read';

alter table public.messages
  alter column status set default 'unread';

-- Needed so a participant can mark the other side's messages as read when
-- they open the conversation — there was no update policy on messages at
-- all before this.
create policy "Participants can mark messages in their conversations as read"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one_id, c.participant_two_id)
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one_id, c.participant_two_id)
    )
  );
