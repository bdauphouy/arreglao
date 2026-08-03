-- Seed data for local development.
--
-- Profiles can't be inserted directly (no insert policy — see
-- 20260803120000_create_profiles.sql): rows are only created by
-- handle_new_user(), which fires off an auth.users insert. So fake users
-- are seeded by inserting into auth.users first (with a fixed uuid per
-- user so this file is re-runnable via `supabase db reset`), then the
-- profiles rows they produce are enriched with names/bio/location/etc.,
-- and finally a set of annonces are created referencing them.
--
-- Every seeded user has a complete profile (name, bio, location, avatar,
-- category tags) and has posted at least one annonce, except Lucia,
-- Valentina and Gabriela, who are kept as "no declared skills" posters so
-- the home screen's Para-ti-with-no-tags fallback still has real accounts
-- to test against.

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
  ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'andres.torres@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'sofia.jimenez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'camila.reyes@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'fernando.castillo@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'authenticated', 'authenticated', 'isabella.nunez@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'authenticated', 'authenticated', 'miguel.ortiz@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'authenticated', 'authenticated', 'rafael.medina@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'authenticated', 'authenticated', 'gabriela.vargas@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- handle_new_user() already created bare profile rows (id + email) for the
-- inserts above; fill in the rest of the columns per profile.
update public.profiles set
  first_name = 'Maria', last_name = 'Gonzalez',
  display_name = 'Maria Gonzalez',
  bio = 'Plumber with 10 years of experience fixing leaks, installing fixtures, and full bathroom renovations.',
  avatar_url = 'https://i.pravatar.cc/300?img=1',
  location_lat = 18.4861, location_lng = -69.9312,
  category_tags = array['bricolaje']::public.job_category[],
  average_rating = 4.8
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  first_name = 'Carlos', last_name = 'Martinez',
  display_name = 'Carlos Martinez',
  bio = 'Professional house cleaner, available for deep cleans and recurring weekly visits.',
  avatar_url = 'https://i.pravatar.cc/300?img=2',
  location_lat = 18.4756, location_lng = -69.8931,
  category_tags = array['limpieza']::public.job_category[],
  average_rating = 4.6
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  first_name = 'Ana', last_name = 'Rodriguez',
  display_name = 'Ana Rodriguez',
  bio = 'Landscaper and gardener with an eye for detail. Also handle painting and small home repairs.',
  avatar_url = 'https://i.pravatar.cc/300?img=3',
  location_lat = 18.5001, location_lng = -69.9500,
  category_tags = array['jardineria', 'bricolaje']::public.job_category[],
  average_rating = 4.9
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  first_name = 'Jose', last_name = 'Hernandez',
  display_name = 'Jose Hernandez',
  bio = 'Moving crew of 3, own truck. Furniture, appliances, and full apartment moves.',
  avatar_url = 'https://i.pravatar.cc/300?img=4',
  location_lat = 18.4599, location_lng = -69.9387,
  category_tags = array['mudanza']::public.job_category[],
  average_rating = 4.5
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  first_name = 'Lucia', last_name = 'Perez',
  display_name = 'Lucia Perez',
  bio = 'Looking for someone to help around the house — mostly cleaning and small repairs.',
  avatar_url = 'https://i.pravatar.cc/300?img=5',
  location_lat = 18.4700, location_lng = -69.9200,
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '55555555-5555-5555-5555-555555555555';

update public.profiles set
  first_name = 'Diego', last_name = 'Sanchez',
  display_name = 'Diego Sanchez',
  bio = 'Electrician and computer technician — rewiring, outlet installs, home networking, and PC/laptop repairs.',
  avatar_url = 'https://i.pravatar.cc/300?img=6',
  location_lat = 18.4830, location_lng = -69.9110,
  category_tags = array['bricolaje', 'informatica']::public.job_category[],
  average_rating = 4.7
where id = '66666666-6666-6666-6666-666666666666';

update public.profiles set
  first_name = 'Valentina', last_name = 'Ramirez',
  display_name = 'Valentina Ramirez',
  bio = 'New to the app, first time posting a job.',
  avatar_url = 'https://i.pravatar.cc/300?img=7',
  location_lat = 18.4650, location_lng = -69.9450,
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '77777777-7777-7777-7777-777777777777';

update public.profiles set
  first_name = 'Andres', last_name = 'Torres',
  display_name = 'Andres Torres',
  bio = 'Private tutor for math and languages, also available for home-help tasks like errands and elder care companionship.',
  avatar_url = 'https://i.pravatar.cc/300?img=8',
  location_lat = 18.4920, location_lng = -69.8990,
  category_tags = array['clases_particulares', 'ayuda_domicilio']::public.job_category[],
  average_rating = 4.3
where id = '88888888-8888-8888-8888-888888888888';

update public.profiles set
  first_name = 'Sofia', last_name = 'Jimenez',
  display_name = 'Sofia Jimenez',
  bio = 'Experienced nanny and babysitter, CPR certified. Available evenings and weekends for kids of all ages.',
  avatar_url = 'https://i.pravatar.cc/300?img=9',
  location_lat = 18.4780, location_lng = -69.9050,
  category_tags = array['ninos']::public.job_category[],
  average_rating = 4.9
where id = '99999999-9999-9999-9999-999999999999';

update public.profiles set
  first_name = 'Camila', last_name = 'Reyes',
  display_name = 'Camila Reyes',
  bio = 'Pet sitter and dog walker with a background as a veterinary assistant. Your pets are in good hands.',
  avatar_url = 'https://i.pravatar.cc/300?img=10',
  location_lat = 18.4990, location_lng = -69.9400,
  category_tags = array['animales']::public.job_category[],
  average_rating = 4.6
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.profiles set
  first_name = 'Fernando', last_name = 'Castillo',
  display_name = 'Fernando Castillo',
  bio = 'Computer repair technician — hardware diagnostics, virus removal, and home network setup.',
  avatar_url = 'https://i.pravatar.cc/300?img=11',
  location_lat = 18.4610, location_lng = -69.9280,
  category_tags = array['informatica']::public.job_category[],
  average_rating = 4.4
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.profiles set
  first_name = 'Isabella', last_name = 'Nunez',
  display_name = 'Isabella Nunez',
  bio = 'Home care aide for seniors — companionship, errands, and light housekeeping.',
  avatar_url = 'https://i.pravatar.cc/300?img=12',
  location_lat = 18.4880, location_lng = -69.9430,
  category_tags = array['ayuda_domicilio']::public.job_category[],
  average_rating = 4.8
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

update public.profiles set
  first_name = 'Miguel', last_name = 'Ortiz',
  display_name = 'Miguel Ortiz',
  bio = 'Landscaper specializing in lawn care, hedge trimming, and small garden makeovers.',
  avatar_url = 'https://i.pravatar.cc/300?img=13',
  location_lat = 18.4720, location_lng = -69.8980,
  category_tags = array['jardineria']::public.job_category[],
  average_rating = 4.5
where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

update public.profiles set
  first_name = 'Rafael', last_name = 'Medina',
  display_name = 'Rafael Medina',
  bio = 'Private tutor for science and English, all grade levels. Patient and results-focused.',
  avatar_url = 'https://i.pravatar.cc/300?img=14',
  location_lat = 18.5050, location_lng = -69.9150,
  category_tags = array['clases_particulares']::public.job_category[],
  average_rating = 4.7
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

update public.profiles set
  first_name = 'Gabriela', last_name = 'Vargas',
  display_name = 'Gabriela Vargas',
  bio = 'New to the app, looking for reliable help around the house.',
  avatar_url = 'https://i.pravatar.cc/300?img=15',
  location_lat = 18.4550, location_lng = -69.9300,
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Annonces posted by Lucia and Valentina, spanning every status in the
-- lifecycle so screens for each state have something to show.
insert into public.annonces (poster_id, title, description, category, location_lat, location_lng, status, chosen_helper_id) values
  ('55555555-5555-5555-5555-555555555555', 'Leaking kitchen faucet', 'Water dripping under the sink, needs a plumber this week.', 'bricolaje', 18.4705, -69.9205, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Deep clean before move-in', 'Empty 2-bedroom apartment, needs a full deep clean.', 'limpieza', 18.4655, -69.9455, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Paint living room and hallway', 'Approx 40m2, walls only, paint already bought.', 'bricolaje', 18.4710, -69.9210, 'in_review', null),
  ('77777777-7777-7777-7777-777777777777', 'Move furniture to new apartment', 'One bedroom set and a sofa, 15 minutes away.', 'mudanza', 18.4660, -69.9460, 'assigned', '44444444-4444-4444-4444-444444444444'),
  ('55555555-5555-5555-5555-555555555555', 'Fix broken bathroom tile', 'A few cracked tiles near the shower, need replacing.', 'bricolaje', 18.4715, -69.9215, 'assigned', '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'Math tutoring for teenager', 'Weekly algebra and geometry help ahead of exams.', 'clases_particulares', 18.4665, -69.9465, 'done', '88888888-8888-8888-8888-888888888888'),
  ('55555555-5555-5555-5555-555555555555', 'Rewire old ceiling lights', 'Two bedrooms, old wiring needs replacing.', 'bricolaje', 18.4720, -69.9220, 'done', '66666666-6666-6666-6666-666666666666'),
  ('77777777-7777-7777-7777-777777777777', 'Weekly house cleaning', 'Looking for a recurring cleaner, 3-bedroom house.', 'limpieza', 18.4670, -69.9470, 'cancelled', null),
  ('55555555-5555-5555-5555-555555555555', 'Trim the backyard hedges', 'Overgrown hedges and a small flower bed need tidying up.', 'jardineria', 18.4725, -69.9225, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Babysitter needed Friday night', 'One evening, two kids aged 5 and 8, until 11pm.', 'ninos', 18.4675, -69.9475, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Dog walking twice a day', 'One friendly labrador, mornings and evenings on weekdays.', 'animales', 18.4730, -69.9230, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Laptop won''t turn on, need diagnosis', 'Stopped powering on suddenly, probably a hardware issue.', 'informatica', 18.4680, -69.9480, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Grocery runs and light housework for elderly parent', 'A few hours a week helping around the house.', 'ayuda_domicilio', 18.4735, -69.9235, 'open', null);

-- Every other seeded user also posts at least one annonce, so the app has a
-- realistic mix of people who are both helpers (declared skills) and
-- posters (things they themselves need done), across all nine categories.
insert into public.annonces (poster_id, title, description, category, location_lat, location_lng, status, chosen_helper_id) values
  ('11111111-1111-1111-1111-111111111111', 'Need help with the backyard garden', 'Weeds have taken over, want it cleared and replanted.', 'jardineria', 18.4865, -69.9315, 'open', null),
  ('22222222-2222-2222-2222-222222222222', 'Dog sitting this weekend', 'Traveling for two days, need someone to watch my dog.', 'animales', 18.4760, -69.8935, 'open', null),
  ('33333333-3333-3333-3333-333333333333', 'English tutor for my son', '12 year old needs help catching up before the school year ends.', 'clases_particulares', 18.5005, -69.9505, 'open', null),
  ('44444444-4444-4444-4444-444444444444', 'Fix the AC unit', 'Not cooling properly, might need a recharge or a part replaced.', 'bricolaje', 18.4602, -69.9390, 'in_review', null),
  ('66666666-6666-6666-6666-666666666666', 'Babysitter for Saturday night', 'One kid, 6 years old, from 7pm to midnight.', 'ninos', 18.4833, -69.9113, 'open', null),
  ('88888888-8888-8888-8888-888888888888', 'Deep clean before a party', 'Hosting family this weekend, need the whole house cleaned Friday.', 'limpieza', 18.4923, -69.8993, 'open', null),
  ('99999999-9999-9999-9999-999999999999', 'Help moving office furniture', 'Small office, a few desks and chairs, one floor up.', 'mudanza', 18.4783, -69.9053, 'open', null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Install shelves in the living room', 'Three floating shelves, brackets and shelves already bought.', 'bricolaje', 18.4993, -69.9403, 'open', null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dog walker needed', 'Energetic dog needs walks twice a day while I''m at work.', 'animales', 18.4613, -69.9283, 'done', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Set up home wifi network', 'New router, need it configured and extended to cover the whole house.', 'informatica', 18.4883, -69.9433, 'open', null),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Companion for elderly father', 'A few hours a week, company and help with errands.', 'ayuda_domicilio', 18.4723, -69.8983, 'open', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Trim the trees in the backyard', 'Two mango trees need pruning before hurricane season.', 'jardineria', 18.5053, -69.9153, 'assigned', '33333333-3333-3333-3333-333333333333'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Math tutor needed urgently', 'High schooler struggling with calculus, exam next week.', 'clases_particulares', 18.4553, -69.9303, 'open', null);
