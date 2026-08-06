-- Expo push token per profile, plus a ticket log so a background job can
-- reconcile delivery receipts and clear tokens Expo reports as stale
-- (DeviceNotRegistered) instead of retrying them forever.

alter table public.profiles add column push_token text;

-- Covered by the existing "Users can update their own profile" policy
-- (row-level, not column-level) — no new profiles policy needed.

create table public.push_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticket_id text not null,
  status text not null default 'pending' check (status in ('pending', 'ok', 'error')),
  created_at timestamptz not null default now()
);

create index push_tickets_status_idx on public.push_tickets (status);

alter table public.push_tickets enable row level security;

-- No policies for `authenticated`/`anon`: only the send-push and
-- check-push-receipts edge functions touch this table, using the service
-- role key, which bypasses RLS entirely.
