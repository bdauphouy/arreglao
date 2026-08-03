-- Collected via a "complete your profile" step shown once, right after a
-- user's first OTP login (see app/(auth)/profile-details.tsx). Nullable:
-- a null first_name is how the app detects an incomplete profile.
alter table public.profiles add column first_name text;
alter table public.profiles add column last_name text;
