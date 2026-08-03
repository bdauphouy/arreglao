-- Seed data for local development.
--
-- Profiles can't be inserted directly (no insert policy — see
-- 20260803120000_create_profiles.sql): rows are only created by
-- handle_new_user(), which fires off an auth.users insert. So fake users
-- are seeded by inserting into auth.users first (with a fixed uuid per
-- user so this file is re-runnable via `supabase db reset`), then the
-- profiles rows they produce are enriched with names/bio/location/etc.,
-- and finally a handful of annonces are created referencing them.

insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'maria.gonzalez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'carlos.martinez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'ana.rodriguez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'jose.hernandez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'lucia.perez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'diego.sanchez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'valentina.ramirez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'andres.torres@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- handle_new_user() already created bare profile rows (id + email) for the
-- inserts above; fill in the rest of the columns per profile.
update public.profiles set
  first_name = 'Maria', last_name = 'Gonzalez',
  display_name = 'Maria Gonzalez',
  bio = 'Plumber with 10 years of experience fixing leaks, installing fixtures, and full bathroom renovations.',
  location_lat = 18.4861, location_lng = -69.9312,
  category_tags = array['repairs', 'renovation']::public.job_category[],
  average_rating = 4.8
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  first_name = 'Carlos', last_name = 'Martinez',
  display_name = 'Carlos Martinez',
  bio = 'Professional house cleaner, available for deep cleans and recurring weekly visits.',
  location_lat = 18.4756, location_lng = -69.8931,
  category_tags = array['cleaning']::public.job_category[],
  average_rating = 4.6
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  first_name = 'Ana', last_name = 'Rodriguez',
  display_name = 'Ana Rodriguez',
  bio = 'Interior painter and drywall specialist. Free quotes, no job too small.',
  location_lat = 18.5001, location_lng = -69.9500,
  category_tags = array['renovation', 'repairs']::public.job_category[],
  average_rating = 4.9
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  first_name = 'Jose', last_name = 'Hernandez',
  display_name = 'Jose Hernandez',
  bio = 'Moving crew of 3, own truck. Furniture, appliances, and full apartment moves.',
  location_lat = 18.4599, location_lng = -69.9387,
  category_tags = array['moving']::public.job_category[],
  average_rating = 4.5
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  first_name = 'Lucia', last_name = 'Perez',
  display_name = 'Lucia Perez',
  bio = 'Looking for someone to help around the house — mostly cleaning and small repairs.',
  location_lat = 18.4700, location_lng = -69.9200,
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '55555555-5555-5555-5555-555555555555';

update public.profiles set
  first_name = 'Diego', last_name = 'Sanchez',
  display_name = 'Diego Sanchez',
  bio = 'Electrician, licensed. Rewiring, outlet installs, and panel upgrades.',
  location_lat = 18.4830, location_lng = -69.9110,
  category_tags = array['repairs']::public.job_category[],
  average_rating = 4.7
where id = '66666666-6666-6666-6666-666666666666';

update public.profiles set
  first_name = 'Valentina', last_name = 'Ramirez',
  display_name = 'Valentina Ramirez',
  bio = 'New to the app, first time posting a job.',
  location_lat = 18.4650, location_lng = -69.9450,
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '77777777-7777-7777-7777-777777777777';

update public.profiles set
  first_name = 'Andres', last_name = 'Torres',
  display_name = 'Andres Torres',
  bio = 'General handyman — repairs, small renovations, furniture assembly.',
  location_lat = 18.4920, location_lng = -69.8990,
  category_tags = array['repairs', 'renovation', 'other']::public.job_category[],
  average_rating = 4.3
where id = '88888888-8888-8888-8888-888888888888';

-- Annonces posted by the "customer-leaning" fake users, spanning every
-- status in the lifecycle so screens for each state have something to show.
insert into public.annonces (poster_id, title, description, category, location_lat, location_lng, status, chosen_helper_id) values
  ('55555555-5555-5555-5555-555555555555', 'Leaking kitchen faucet', 'Water dripping under the sink, needs a plumber this week.', 'repairs', 18.4705, -69.9205, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Deep clean before move-in', 'Empty 2-bedroom apartment, needs a full deep clean.', 'cleaning', 18.4655, -69.9455, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Paint living room and hallway', 'Approx 40m2, walls only, paint already bought.', 'renovation', 18.4710, -69.9210, 'in_review', null),
  ('77777777-7777-7777-7777-777777777777', 'Move furniture to new apartment', 'One bedroom set and a sofa, 15 minutes away.', 'moving', 18.4660, -69.9460, 'assigned', '44444444-4444-4444-4444-444444444444'),
  ('55555555-5555-5555-5555-555555555555', 'Fix broken bathroom tile', 'A few cracked tiles near the shower, need replacing.', 'repairs', 18.4715, -69.9215, 'assigned', '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'Assemble new wardrobe', 'IKEA wardrobe, flat-packed, needs assembly.', 'other', 18.4665, -69.9465, 'done', '88888888-8888-8888-8888-888888888888'),
  ('55555555-5555-5555-5555-555555555555', 'Rewire old ceiling lights', 'Two bedrooms, old wiring needs replacing.', 'repairs', 18.4720, -69.9220, 'done', '66666666-6666-6666-6666-666666666666'),
  ('77777777-7777-7777-7777-777777777777', 'Weekly house cleaning', 'Looking for a recurring cleaner, 3-bedroom house.', 'cleaning', 18.4670, -69.9470, 'cancelled', null);
