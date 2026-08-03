-- Applications ("apply with a comment", free & unlimited — no credits system
-- yet) and in-app chat, per the AlloVoisins-inspired rework. This finally
-- builds the lifecycle already described in 20260803180000_create_annonces's
-- comment: open -> (auto, first application) in_review -> (poster picks)
-- assigned -> (poster marks) done.

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid not null references public.annonces (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  unique (annonce_id, applicant_id)
);

alter table public.applications enable row level security;

create policy "Applicants and posters can view applications"
  on public.applications for select
  to authenticated
  using (
    auth.uid() = applicant_id
    or auth.uid() = (select poster_id from public.annonces where id = annonce_id)
  );

create policy "Users can apply to open annonces that aren't their own"
  on public.applications for insert
  to authenticated
  with check (
    auth.uid() = applicant_id
    and auth.uid() <> (select poster_id from public.annonces where id = annonce_id)
    and (select status from public.annonces where id = annonce_id) in ('open', 'in_review')
  );

-- Applying is what moves a fresh annonce into review. Runs as security
-- definer (same pattern as handle_new_user() in the profiles migration)
-- since the applicant — not the poster — is the one triggering this update,
-- and the "Posters can update their own annonces" policy wouldn't otherwise
-- allow it.
create function public.advance_annonce_on_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.annonces
  set status = 'in_review'
  where id = new.annonce_id
    and status = 'open';
  return new;
end;
$$;

create trigger applications_advance_annonce_status
  after insert on public.applications
  for each row execute procedure public.advance_annonce_on_application();

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid not null references public.annonces (id) on delete cascade,
  participant_one_id uuid not null references public.profiles (id) on delete cascade,
  participant_two_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participant_one_id <> participant_two_id)
);

-- One thread per (annonce, pair of participants), regardless of insertion order.
create unique index conversations_unique_thread on public.conversations (
  annonce_id,
  least(participant_one_id, participant_two_id),
  greatest(participant_one_id, participant_two_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() in (participant_one_id, participant_two_id));

-- Only the poster can start a conversation from their annonce — applicants
-- reply, they don't cold-message a poster first.
create policy "Posters can start a conversation from their annonce"
  on public.conversations for insert
  to authenticated
  with check (
    auth.uid() in (participant_one_id, participant_two_id)
    and auth.uid() = (select poster_id from public.annonces where id = annonce_id)
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can view messages in their conversations"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one_id, c.participant_two_id)
    )
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_one_id, c.participant_two_id)
    )
  );

alter publication supabase_realtime add table public.messages;
