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
-- All seeded profiles are Latino and live in San Pedro Sula, Honduras;
-- all budgets/prices are in Lempiras (GH issue #27, 2026-08-05 revision
-- pass — was previously Santo Domingo/DR coordinates with USD hourly rates).
--
-- Every seeded user has a complete profile (name, bio, address, avatar,
-- category tags) and has posted at least one annonce, except Lucia,
-- Valentina and Gabriela, who are kept as "no declared skills" posters so
-- the home screen's Para-ti-with-no-tags fallback still has real accounts
-- to test against.
--
-- NOTE: the annonces insert below has no on-conflict guard (annonce ids are
-- left to gen_random_uuid()), so this file is only safe to run once against
-- a given database — see project memory "feedback-supabase-seed-idempotency"
-- for the hosted-project gotchas around re-running it.

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
-- inserts above; fill in the rest of the columns per profile. Avatars use a
-- larger pravatar.cc size param (400 vs. the old 300) to reduce upscaling
-- artifacts, on top of the profile screen no longer stretching them across
-- a full-bleed hero (see GH issue #25).
update public.profiles set
  first_name = 'Maria', last_name = 'Gonzalez',
  bio = 'Plomera con 10 años de experiencia arreglando fugas, instalando accesorios y renovando baños completos.',
  avatar_url = 'https://i.pravatar.cc/400?img=1',
  location_lat = 15.5045, location_lng = -88.0285,
  address_label = 'Barrio Guamilito, San Pedro Sula, Cortés, Honduras',
  category_tags = array['bricolaje']::public.job_category[],
  average_rating = 4.8
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  first_name = 'Carlos', last_name = 'Martinez',
  bio = 'Limpiador profesional de casas, disponible para limpiezas profundas y visitas semanales recurrentes.',
  avatar_url = 'https://i.pravatar.cc/400?img=2',
  location_lat = 15.4990, location_lng = -88.0210,
  address_label = 'Colonia Trejo, San Pedro Sula, Cortés, Honduras',
  category_tags = array['limpieza']::public.job_category[],
  average_rating = 4.6
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  first_name = 'Ana', last_name = 'Rodriguez',
  bio = 'Jardinera y paisajista con buen ojo para el detalle. También hago pintura y pequeñas reparaciones del hogar.',
  avatar_url = 'https://i.pravatar.cc/400?img=3',
  location_lat = 15.5110, location_lng = -88.0330,
  address_label = 'Colonia Universidad, San Pedro Sula, Cortés, Honduras',
  category_tags = array['jardineria', 'bricolaje']::public.job_category[],
  average_rating = 4.9
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  first_name = 'Jose', last_name = 'Hernandez',
  bio = 'Equipo de mudanzas de 3 personas, camión propio. Muebles, electrodomésticos y mudanzas completas de apartamentos.',
  avatar_url = 'https://i.pravatar.cc/400?img=4',
  location_lat = 15.4950, location_lng = -88.0180,
  address_label = 'Bella Vista, San Pedro Sula, Cortés, Honduras',
  category_tags = array['mudanza']::public.job_category[],
  average_rating = 4.5
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  first_name = 'Lucia', last_name = 'Perez',
  bio = 'Busco ayuda en la casa — sobre todo limpieza y pequeñas reparaciones.',
  avatar_url = 'https://i.pravatar.cc/400?img=5',
  location_lat = 15.5020, location_lng = -88.0260,
  address_label = 'Colonia Moderna, San Pedro Sula, Cortés, Honduras',
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '55555555-5555-5555-5555-555555555555';

update public.profiles set
  first_name = 'Diego', last_name = 'Sanchez',
  bio = 'Electricista y técnico en computación — cableado, instalación de tomacorrientes, redes domésticas y reparación de PC/laptop.',
  avatar_url = 'https://i.pravatar.cc/400?img=6',
  location_lat = 15.5080, location_lng = -88.0150,
  address_label = 'Colonia Satélite, San Pedro Sula, Cortés, Honduras',
  category_tags = array['bricolaje', 'informatica']::public.job_category[],
  average_rating = 4.7
where id = '66666666-6666-6666-6666-666666666666';

update public.profiles set
  first_name = 'Valentina', last_name = 'Ramirez',
  bio = 'Nueva en la app, primera vez publicando un trabajo.',
  avatar_url = 'https://i.pravatar.cc/400?img=7',
  location_lat = 15.4900, location_lng = -88.0230,
  address_label = 'Barrio Río de Piedras, San Pedro Sula, Cortés, Honduras',
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = '77777777-7777-7777-7777-777777777777';

update public.profiles set
  first_name = 'Andres', last_name = 'Torres',
  bio = 'Profesor particular de matemáticas e idiomas, también disponible para tareas de ayuda a domicilio como mandados y compañía a adultos mayores.',
  avatar_url = 'https://i.pravatar.cc/400?img=8',
  location_lat = 15.5150, location_lng = -88.0290,
  address_label = 'Colonia Altiplano, San Pedro Sula, Cortés, Honduras',
  category_tags = array['clases_particulares', 'ayuda_domicilio']::public.job_category[],
  average_rating = 4.3
where id = '88888888-8888-8888-8888-888888888888';

update public.profiles set
  first_name = 'Sofia', last_name = 'Jimenez',
  bio = 'Niñera experimentada certificada en RCP. Disponible tardes y fines de semana para niños de todas las edades.',
  avatar_url = 'https://i.pravatar.cc/400?img=9',
  location_lat = 15.4980, location_lng = -88.0350,
  address_label = 'Colonia Jardines del Valle, San Pedro Sula, Cortés, Honduras',
  category_tags = array['ninos']::public.job_category[],
  average_rating = 4.9
where id = '99999999-9999-9999-9999-999999999999';

update public.profiles set
  first_name = 'Camila', last_name = 'Reyes',
  bio = 'Paseadora y cuidadora de mascotas con experiencia como asistente veterinaria. Tus mascotas están en buenas manos.',
  avatar_url = 'https://i.pravatar.cc/400?img=10',
  location_lat = 15.5060, location_lng = -88.0400,
  address_label = 'Colonia Los Andes, San Pedro Sula, Cortés, Honduras',
  category_tags = array['animales']::public.job_category[],
  average_rating = 4.6
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.profiles set
  first_name = 'Fernando', last_name = 'Castillo',
  bio = 'Técnico en reparación de computadoras — diagnóstico de hardware, eliminación de virus y configuración de redes domésticas.',
  avatar_url = 'https://i.pravatar.cc/400?img=11',
  location_lat = 15.4930, location_lng = -88.0120,
  address_label = 'Colonia El Prado, San Pedro Sula, Cortés, Honduras',
  category_tags = array['informatica']::public.job_category[],
  average_rating = 4.4
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.profiles set
  first_name = 'Isabella', last_name = 'Nunez',
  bio = 'Asistente de cuidado a domicilio para adultos mayores — compañía, mandados y limpieza ligera.',
  avatar_url = 'https://i.pravatar.cc/400?img=12',
  location_lat = 15.5030, location_lng = -88.0100,
  address_label = 'Colonia Circunvalación, San Pedro Sula, Cortés, Honduras',
  category_tags = array['ayuda_domicilio']::public.job_category[],
  average_rating = 4.8
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

update public.profiles set
  first_name = 'Miguel', last_name = 'Ortiz',
  bio = 'Jardinero especializado en cuidado de césped, poda de setos y pequeñas remodelaciones de jardín.',
  avatar_url = 'https://i.pravatar.cc/400?img=13',
  location_lat = 15.5000, location_lng = -88.0300,
  address_label = 'Barrio El Centro, San Pedro Sula, Cortés, Honduras',
  category_tags = array['jardineria']::public.job_category[],
  average_rating = 4.5
where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

update public.profiles set
  first_name = 'Rafael', last_name = 'Medina',
  bio = 'Profesor particular de ciencias e inglés, todos los niveles. Paciente y enfocado en resultados.',
  avatar_url = 'https://i.pravatar.cc/400?img=14',
  location_lat = 15.5120, location_lng = -88.0210,
  address_label = 'Colonia Zerón, San Pedro Sula, Cortés, Honduras',
  category_tags = array['clases_particulares']::public.job_category[],
  average_rating = 4.7
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

update public.profiles set
  first_name = 'Gabriela', last_name = 'Vargas',
  bio = 'Nueva en la app, buscando ayuda confiable en la casa.',
  avatar_url = 'https://i.pravatar.cc/400?img=15',
  location_lat = 15.4960, location_lng = -88.0270,
  address_label = 'Colonia Miraflores, San Pedro Sula, Cortés, Honduras',
  category_tags = array[]::public.job_category[],
  average_rating = null
where id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Annonces posted by Lucia and Valentina, spanning every status in the
-- lifecycle so screens for each state have something to show. Budgets are
-- per-job totals in Lempiras, not hourly rates — helpers propose their own
-- price per application (see applications below).
insert into public.annonces (poster_id, title, description, category, location_lat, location_lng, budget_min, budget_max, status, chosen_helper_id) values
  ('55555555-5555-5555-5555-555555555555', 'Leaking kitchen faucet', 'Water dripping under the sink, needs a plumber this week.', 'bricolaje', 15.5022, -88.0262, 400, 800, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Deep clean before move-in', 'Empty 2-bedroom apartment, needs a full deep clean.', 'limpieza', 15.4902, -88.0232, 800, 1500, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Paint living room and hallway', 'Approx 40m2, walls only, paint already bought.', 'bricolaje', 15.5024, -88.0264, 1500, 2500, 'in_review', null),
  ('77777777-7777-7777-7777-777777777777', 'Move furniture to new apartment', 'One bedroom set and a sofa, 15 minutes away.', 'mudanza', 15.4904, -88.0234, 1000, 1800, 'assigned', '44444444-4444-4444-4444-444444444444'),
  ('55555555-5555-5555-5555-555555555555', 'Fix broken bathroom tile', 'A few cracked tiles near the shower, need replacing.', 'bricolaje', 15.5026, -88.0266, 600, 1200, 'assigned', '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'Math tutoring for teenager', 'Weekly algebra and geometry help ahead of exams.', 'clases_particulares', 15.4906, -88.0236, 300, 500, 'done', '88888888-8888-8888-8888-888888888888'),
  ('55555555-5555-5555-5555-555555555555', 'Rewire old ceiling lights', 'Two bedrooms, old wiring needs replacing.', 'bricolaje', 15.5028, -88.0268, 900, 1600, 'done', '66666666-6666-6666-6666-666666666666'),
  ('77777777-7777-7777-7777-777777777777', 'Weekly house cleaning', 'Looking for a recurring cleaner, 3-bedroom house.', 'limpieza', 15.4908, -88.0238, 600, 1000, 'cancelled', null),
  ('55555555-5555-5555-5555-555555555555', 'Trim the backyard hedges', 'Overgrown hedges and a small flower bed need tidying up.', 'jardineria', 15.5030, -88.0270, 350, 700, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Babysitter needed Friday night', 'One evening, two kids aged 5 and 8, until 11pm.', 'ninos', 15.4910, -88.0240, 250, 450, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Dog walking twice a day', 'One friendly labrador, mornings and evenings on weekdays.', 'animales', 15.5032, -88.0272, 200, 400, 'open', null),
  ('77777777-7777-7777-7777-777777777777', 'Laptop won''t turn on, need diagnosis', 'Stopped powering on suddenly, probably a hardware issue.', 'informatica', 15.4912, -88.0242, 400, 900, 'open', null),
  ('55555555-5555-5555-5555-555555555555', 'Grocery runs and light housework for elderly parent', 'A few hours a week helping around the house.', 'ayuda_domicilio', 15.5034, -88.0274, 300, 600, 'open', null);

-- Every other seeded user also posts at least one annonce, so the app has a
-- realistic mix of people who are both helpers (declared skills) and
-- posters (things they themselves need done), across all nine categories.
insert into public.annonces (poster_id, title, description, category, location_lat, location_lng, budget_min, budget_max, status, chosen_helper_id) values
  ('11111111-1111-1111-1111-111111111111', 'Need help with the backyard garden', 'Weeds have taken over, want it cleared and replanted.', 'jardineria', 15.5049, -88.0289, 400, 800, 'open', null),
  ('22222222-2222-2222-2222-222222222222', 'Dog sitting this weekend', 'Traveling for two days, need someone to watch my dog.', 'animales', 15.4994, -88.0214, 300, 600, 'open', null),
  ('33333333-3333-3333-3333-333333333333', 'English tutor for my son', '12 year old needs help catching up before the school year ends.', 'clases_particulares', 15.5114, -88.0334, 350, 650, 'open', null),
  ('44444444-4444-4444-4444-444444444444', 'Fix the AC unit', 'Not cooling properly, might need a recharge or a part replaced.', 'bricolaje', 15.4954, -88.0184, 1200, 2200, 'in_review', null),
  ('66666666-6666-6666-6666-666666666666', 'Babysitter for Saturday night', 'One kid, 6 years old, from 7pm to midnight.', 'ninos', 15.5084, -88.0154, 300, 500, 'open', null),
  ('88888888-8888-8888-8888-888888888888', 'Deep clean before a party', 'Hosting family this weekend, need the whole house cleaned Friday.', 'limpieza', 15.5154, -88.0294, 700, 1300, 'open', null),
  ('99999999-9999-9999-9999-999999999999', 'Help moving office furniture', 'Small office, a few desks and chairs, one floor up.', 'mudanza', 15.4984, -88.0354, 1500, 2800, 'open', null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Install shelves in the living room', 'Three floating shelves, brackets and shelves already bought.', 'bricolaje', 15.5064, -88.0404, 500, 900, 'open', null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dog walker needed', 'Energetic dog needs walks twice a day while I''m at work.', 'animales', 15.4934, -88.0124, 250, 450, 'done', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Set up home wifi network', 'New router, need it configured and extended to cover the whole house.', 'informatica', 15.5034, -88.0104, 500, 900, 'open', null),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Companion for elderly father', 'A few hours a week, company and help with errands.', 'ayuda_domicilio', 15.5004, -88.0304, 400, 700, 'open', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Trim the trees in the backyard', 'Two mango trees need pruning before hurricane season.', 'jardineria', 15.5124, -88.0214, 600, 1100, 'assigned', '33333333-3333-3333-3333-333333333333'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Math tutor needed urgently', 'High schooler struggling with calculus, exam next week.', 'clases_particulares', 15.4964, -88.0274, 350, 600, 'open', null);

-- A handful of applications on two already-in_review annonces, so the home
-- feed / annonce detail's "see other applicants' prices before you bid"
-- feature (GH issue #22) has real data to show. Matched by poster+title
-- since annonces don't have fixed seed ids (see the note at the top of this
-- file about re-run safety).
insert into public.applications (id, annonce_id, applicant_id, message, proposed_price)
select '00000000-0000-0000-0000-0000a0000001'::uuid, a.id, '11111111-1111-1111-1111-111111111111'::uuid, 'Puedo empezar esta semana, tengo todo el material.', 1800
from public.annonces a where a.poster_id = '55555555-5555-5555-5555-555555555555' and a.title = 'Paint living room and hallway'
union all
select '00000000-0000-0000-0000-0000a0000002'::uuid, a.id, '66666666-6666-6666-6666-666666666666'::uuid, 'Hago pintura y electricidad, puedo revisar todo junto.', 2000
from public.annonces a where a.poster_id = '55555555-5555-5555-5555-555555555555' and a.title = 'Paint living room and hallway'
union all
select '00000000-0000-0000-0000-0000a0000003'::uuid, a.id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Disponible desde mañana, buen precio por ser dos ambientes.', 1650
from public.annonces a where a.poster_id = '55555555-5555-5555-5555-555555555555' and a.title = 'Paint living room and hallway'
on conflict (id) do nothing;

insert into public.applications (id, annonce_id, applicant_id, message, proposed_price)
select '00000000-0000-0000-0000-0000a0000004'::uuid, a.id, '66666666-6666-6666-6666-666666666666'::uuid, 'Tengo experiencia con recarga de gas refrigerante.', 1500
from public.annonces a where a.poster_id = '44444444-4444-4444-4444-444444444444' and a.title = 'Fix the AC unit'
union all
select '00000000-0000-0000-0000-0000a0000005'::uuid, a.id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Puedo revisar hoy mismo, traigo mis propias herramientas.', 1400
from public.annonces a where a.poster_id = '44444444-4444-4444-4444-444444444444' and a.title = 'Fix the AC unit'
on conflict (id) do nothing;

-- Provider-facing details (#profile redesign) for the twelve seeded users
-- who declare skills (i.e. everyone except Lucia, Valentina and Gabriela,
-- who are posters only). average_rating and review_count are left alone
-- here — they get recomputed by reviews_refresh_profile_stats() once the
-- review rows below are inserted, per 20260803210000's trigger.
update public.profiles set
  experience_years = 10, certification = 'Certificación en plomería residencial',
  equipment_tags = array['Llave inglesa', 'Soplete', 'Detector de fugas', 'Taladro'],
  commitment_tags = array['Resultado impecable', 'Puntualidad garantizada'],
  service_radius_km = 20, is_top_provider = true, identity_verified = true, phone_verified = true
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  experience_years = 6, certification = '+6 años de experiencia en limpieza profesional',
  equipment_tags = array['Aspiradora industrial', 'Máquina de vapor', 'Kit de limpieza ecológico'],
  commitment_tags = array['Trabajo cuidadoso', 'Buena comunicación'],
  service_radius_km = 15, is_top_provider = false, identity_verified = true, phone_verified = true
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  experience_years = 8, certification = 'Técnico en paisajismo',
  equipment_tags = array['Cortasetos', 'Desbrozadora', 'Kit de pintura', 'Nivel'],
  commitment_tags = array['Resultado impecable', 'Trabajo cuidadoso'],
  service_radius_km = 18, is_top_provider = true, identity_verified = true, phone_verified = true
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  experience_years = 12, certification = 'Licencia de conducir profesional',
  equipment_tags = array['Camión propio', 'Carretilla', 'Correas de mudanza', 'Mantas protectoras'],
  commitment_tags = array['Puntualidad garantizada', 'Manejo cuidadoso'],
  service_radius_km = 30, is_top_provider = false, identity_verified = true, phone_verified = false
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  experience_years = 7, certification = 'Técnico electricista certificado',
  equipment_tags = array['Multímetro', 'Kit de herramientas eléctricas', 'Probador de cables'],
  commitment_tags = array['Resultado impecable', 'Buena comunicación'],
  service_radius_km = 15, is_top_provider = false, identity_verified = true, phone_verified = true
where id = '66666666-6666-6666-6666-666666666666';

update public.profiles set
  experience_years = 5, certification = 'Licenciado en Educación',
  equipment_tags = array['Material didáctico propio'],
  commitment_tags = array['Paciencia y dedicación', 'Puntualidad garantizada'],
  service_radius_km = 10, is_top_provider = false, identity_verified = true, phone_verified = true
where id = '88888888-8888-8888-8888-888888888888';

update public.profiles set
  experience_years = 6, certification = 'Certificación en primeros auxilios pediátricos',
  equipment_tags = array['Botiquín de primeros auxilios', 'Silla para el auto'],
  commitment_tags = array['Confianza y seguridad', 'Puntualidad garantizada'],
  service_radius_km = 12, is_top_provider = true, identity_verified = true, phone_verified = true
where id = '99999999-9999-9999-9999-999999999999';

update public.profiles set
  experience_years = 4, certification = 'Auxiliar veterinaria certificada',
  equipment_tags = array['Correa y arnés', 'Transportadora'],
  commitment_tags = array['Cuidado responsable', 'Buena comunicación'],
  service_radius_km = 10, is_top_provider = false, identity_verified = true, phone_verified = true
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.profiles set
  experience_years = 9, certification = 'Técnico en soporte informático',
  equipment_tags = array['Kit de destornilladores de precisión', 'Software de diagnóstico'],
  commitment_tags = array['Resultado impecable', 'Trabajo cuidadoso'],
  service_radius_km = 15, is_top_provider = false, identity_verified = false, phone_verified = true
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.profiles set
  experience_years = 7, certification = 'Auxiliar de enfermería geriátrica',
  equipment_tags = array['Silla de ruedas plegable', 'Kit de primeros auxilios'],
  commitment_tags = array['Confianza y seguridad', 'Buena comunicación'],
  service_radius_km = 12, is_top_provider = false, identity_verified = true, phone_verified = true
where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

update public.profiles set
  experience_years = 5, certification = 'Técnico en jardinería y paisajismo',
  equipment_tags = array['Cortacésped', 'Cortasetos', 'Motosierra'],
  commitment_tags = array['Resultado impecable', 'Puntualidad garantizada'],
  service_radius_km = 18, is_top_provider = false, identity_verified = true, phone_verified = true
where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

update public.profiles set
  experience_years = 8, certification = 'Profesor certificado de ciencias',
  equipment_tags = array['Material didáctico propio', 'Pizarra portátil'],
  commitment_tags = array['Paciencia y dedicación', 'Buena comunicación'],
  service_radius_km = 10, is_top_provider = false, identity_verified = false, phone_verified = true
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- Reviews for the same twelve helper profiles, three each. Fixed ids so
-- this block is safe to re-run (matches the auth.users insert's pattern,
-- see feedback-supabase-seed-idempotency in project memory for why this
-- matters against the hosted project). Inserting these fires
-- reviews_refresh_profile_stats() per row, which is what actually sets
-- average_rating/review_count on the profiles above. reviewer_location_label
-- values are San Pedro Sula neighborhoods, matching the profiles above.
insert into public.reviews (id, profile_id, reviewer_id, rating, relationship_rating, punctuality_rating, comment, service_label, photo_url, is_repeat_customer, reviewer_location_label, created_at) values
  ('00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 5, 5, 5, 'Solucionó la fuga en menos de una hora, súper profesional y dejó todo limpio.', 'Reparación de fuga', 'https://picsum.photos/seed/rev101/600/400', true, 'Colonia Moderna', now() - interval '24 days'),
  ('00000000-0000-0000-0000-000000000102', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 5, 5, 4, 'Muy puntual y explica bien lo que va a hacer antes de empezar.', 'Instalación de grifo', null, false, 'Barrio Río de Piedras', now() - interval '40 days'),
  ('00000000-0000-0000-0000-000000000103', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 4, 4, 5, 'Buen trabajo en el baño, aunque tardó un poco más de lo previsto.', 'Renovación de baño', 'https://picsum.photos/seed/rev103/600/400', false, 'Colonia Universidad', now() - interval '58 days'),

  ('00000000-0000-0000-0000-000000000201', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 5, 5, 5, 'Limpieza impecable, la casa quedó como nueva. Ya lo volví a contratar.', 'Limpieza profunda', 'https://picsum.photos/seed/rev201/600/400', true, 'Colonia Jardines del Valle', now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000202', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 4, 4, 'Muy buen servicio, solo llegó unos minutos tarde.', 'Limpieza recurrente', null, true, 'Barrio El Centro', now() - interval '33 days'),
  ('00000000-0000-0000-0000-000000000203', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 5, 5, 5, 'Súper detallista, hasta organizó los closets sin que se lo pidiera.', 'Limpieza profunda', null, false, 'Colonia Miraflores', now() - interval '61 days'),

  ('00000000-0000-0000-0000-000000000301', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5, 5, 5, 'El jardín quedó espectacular, muy buen ojo para el diseño.', 'Mantenimiento de jardín', 'https://picsum.photos/seed/rev301/600/400', false, 'Barrio Guamilito', now() - interval '15 days'),
  ('00000000-0000-0000-0000-000000000302', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, 4, 5, 'Recomendada al 100%, también nos ayudó a pintar la fachada.', 'Pintura exterior', null, true, 'Colonia El Prado', now() - interval '29 days'),
  ('00000000-0000-0000-0000-000000000303', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 5, 4, 'Excelente trabajo de poda, dejó el patio irreconocible.', 'Poda de setos', 'https://picsum.photos/seed/rev303/600/400', false, 'Colonia Zerón', now() - interval '47 days'),

  ('00000000-0000-0000-0000-000000000401', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 5, 5, 5, 'Mudanza rápida y sin ningún daño, tres personas muy organizadas.', 'Mudanza de apartamento', 'https://picsum.photos/seed/rev401/600/400', false, 'Colonia Trejo', now() - interval '12 days'),
  ('00000000-0000-0000-0000-000000000402', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 4, 3, 'Buen equipo, aunque llegaron media hora después de lo acordado.', 'Mudanza de oficina', null, false, 'Colonia Circunvalación', now() - interval '38 days'),
  ('00000000-0000-0000-0000-000000000403', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 5, 5, 'Muy cuidadosos con los muebles, protegieron todo antes de cargar.', 'Mudanza de apartamento', null, true, 'Colonia Los Andes', now() - interval '66 days'),

  ('00000000-0000-0000-0000-000000000501', '66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 5, 5, 'Encontró el problema eléctrico que otros dos técnicos no pudieron resolver.', 'Instalación eléctrica', 'https://picsum.photos/seed/rev501/600/400', false, 'Barrio El Centro', now() - interval '9 days'),
  ('00000000-0000-0000-0000-000000000502', '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 5, 4, 5, 'Rápido con el diagnóstico de la laptop y precio justo.', 'Reparación de laptop', null, true, 'Barrio Guamilito', now() - interval '27 days'),
  ('00000000-0000-0000-0000-000000000503', '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 4, 5, 4, 'Buen trabajo con el cableado de red, quedó todo bien identificado.', 'Instalación eléctrica', null, false, 'Colonia Jardines del Valle', now() - interval '52 days'),

  ('00000000-0000-0000-0000-000000000601', '88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 5, 5, 5, 'Mi hijo mejoró muchísimo en matemáticas, muy paciente explicando.', 'Clases de matemáticas', null, true, 'Barrio Río de Piedras', now() - interval '18 days'),
  ('00000000-0000-0000-0000-000000000602', '88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 5, 4, 'Muy buen profesor, se adapta al ritmo del estudiante.', 'Clases de inglés', null, false, 'Colonia El Prado', now() - interval '44 days'),
  ('00000000-0000-0000-0000-000000000603', '88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 5, 5, 'También nos ayudó con trámites del abuelo, muy atento y confiable.', 'Ayuda a domicilio', null, true, 'Colonia Circunvalación', now() - interval '70 days'),

  ('00000000-0000-0000-0000-000000000701', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 5, 5, 5, 'Los niños la adoran, siempre trae actividades y llega antes de tiempo.', 'Cuidado de niños', 'https://picsum.photos/seed/rev701/600/400', true, 'Colonia Trejo', now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000702', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 5, 5, 4, 'Certificada en primeros auxilios y se nota, muy tranquila con emergencias.', 'Niñera fin de semana', null, false, 'Colonia Universidad', now() - interval '31 days'),
  ('00000000-0000-0000-0000-000000000703', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 5, 4, 5, 'Excelente comunicación, nos mandaba fotos durante la tarde.', 'Cuidado de niños', 'https://picsum.photos/seed/rev703/600/400', true, 'Bella Vista', now() - interval '55 days'),

  ('00000000-0000-0000-0000-000000000801', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 5, 5, 5, 'Mi perro la adora, siempre puntual con los paseos.', 'Paseo de perros', null, true, 'Colonia Satélite', now() - interval '11 days'),
  ('00000000-0000-0000-0000-000000000802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 4, 4, 5, 'Muy responsable, nos mandó actualizaciones mientras viajábamos.', 'Cuidado de mascotas', null, false, 'Colonia Altiplano', now() - interval '34 days'),
  ('00000000-0000-0000-0000-000000000803', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 5, 5, 'Se nota la experiencia como auxiliar veterinaria, muy segura con los animales.', 'Paseo de perros', 'https://picsum.photos/seed/rev803/600/400', false, 'Colonia Zerón', now() - interval '63 days'),

  ('00000000-0000-0000-0000-000000000901', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 4, 4, 4, 'Diagnosticó bien el problema de la PC y explicó todo con calma.', 'Reparación de computadora', null, false, 'Barrio Guamilito', now() - interval '14 days'),
  ('00000000-0000-0000-0000-000000000902', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '99999999-9999-9999-9999-999999999999', 5, 5, 4, 'Configuró la red de toda la casa en una tarde, quedó rapidísima.', 'Configuración de red', null, true, 'Colonia Jardines del Valle', now() - interval '42 days'),
  ('00000000-0000-0000-0000-000000000903', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 4, 4, 'Buen precio y resolvió el problema del virus rápido.', 'Reparación de computadora', null, false, 'Colonia Circunvalación', now() - interval '59 days'),

  ('00000000-0000-0000-0000-000000001001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 5, 5, 5, 'Muy cariñosa y paciente con mi mamá, la recomiendo totalmente.', 'Acompañamiento a adulto mayor', null, true, 'Colonia Trejo', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000001002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 5, 5, 4, 'Ayudó con las compras y la casa, siempre de buen ánimo.', 'Ayuda a domicilio', null, false, 'Bella Vista', now() - interval '36 days'),
  ('00000000-0000-0000-0000-000000001003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 4, 5, 4, 'Muy atenta, aunque un par de veces llegó unos minutos tarde.', 'Acompañamiento a adulto mayor', null, true, 'Colonia Satélite', now() - interval '64 days'),

  ('00000000-0000-0000-0000-000000001101', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 5, 5, 5, 'Dejó el jardín precioso, cortó el césped y arregló los setos.', 'Mantenimiento de jardín', 'https://picsum.photos/seed/rev1101/600/400', true, 'Colonia Universidad', now() - interval '13 days'),
  ('00000000-0000-0000-0000-000000001102', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 4, 4, 5, 'Buen trabajo, trajo su propia motosierra para los árboles grandes.', 'Poda de árboles', null, false, 'Barrio Río de Piedras', now() - interval '39 days'),
  ('00000000-0000-0000-0000-000000001103', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', 5, 5, 5, 'Muy profesional y el precio fue justo por el tamaño del trabajo.', 'Mantenimiento de jardín', null, true, 'Colonia Jardines del Valle', now() - interval '67 days'),

  ('00000000-0000-0000-0000-000000001201', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 5, 5, 4, 'Mi hija pasó el examen de ciencias gracias a sus clases.', 'Clases de ciencias', null, true, 'Barrio Guamilito', now() - interval '16 days'),
  ('00000000-0000-0000-0000-000000001202', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 4, 4, 4, 'Buen profesor, muy claro explicando temas de inglés.', 'Clases de inglés', null, false, 'Colonia Trejo', now() - interval '45 days'),
  ('00000000-0000-0000-0000-000000001203', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 5, 5, 5, 'Muy dedicado, preparó material extra para el examen final.', 'Clases de ciencias', 'https://picsum.photos/seed/rev1203/600/400', false, 'Colonia Universidad', now() - interval '72 days')
on conflict (id) do nothing;
