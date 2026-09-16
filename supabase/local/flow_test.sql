-- Guest flow, run as anon through the security definer functions.
set role anon;
select (public.get_invite('previewgab4')->'event'->>'title') as title, (public.get_invite('previewgab4')->'guest'->>'name') as guest;
select public.submit_rsvp('previewgab4', 'yes', 1, 2, null, array['Gabe','Marcia','Tom'], array['Nut free'], null, 'Step-free entry helps', null, 'Can''t wait') ->> 'status' as status;
select public.get_invite('previewgab4')->'event'->'runsheet'->0->>'title' as first_stop;
select public.claim_group_link('gabriel-4', 'Priya Nair', '0400 111 222') ->> 'token' as new_token;
select public.claim_group_link('gabriel-4', 'Priya', '+61 400 111 222') = public.claim_group_link('gabriel-4', 'Priya Nair', null) as matched_same_guest;
-- Direct table access shows anon nothing (RLS with no anon policy).
select count(*) as guests_visible_to_anon from public.guests;
reset role;
-- Owner claim on first sign-in.
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-000000000001', 'Marcia@nativa.studio', '{"full_name":"Marcia Portela"}');
select count(*) as owner_rows from public.event_members m join public.events e on e.id = m.event_id where e.slug = 'gabriel-4' and m.role = 'owner';
-- Host reads through RLS.
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select count(*) as guests_visible_to_owner from public.guests;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select count(*) as guests_visible_to_stranger from public.guests;
reset role;
