-- Pilot event: Gabriel's 4th. Real party, real wording. Re-runnable: it replaces the event with slug gabriel-4.
-- Ownership: the event is claimed by marcia@nativa.studio the first time that Google account signs in
-- (see handle_new_user), or immediately below if the profile already exists.
delete from public.events where slug = 'gabriel-4';

with e as (
  insert into public.events (
    slug, type, title, host_line, intro, date, start_time, time_note, venue, address,
    serve_preset, serve_text, what_to_bring, gift_stance, gift_note,
    parents_mode, siblings_welcome, photo_sharing, rsvp_by,
    look_mode, layout_id, theme_id, ink, palette, details_strip,
    share_title, share_description,
    ask_party_mode, ask_names, ask_dietary, ask_accessibility, ask_emergency,
    plate_enabled, plate_mode, plate_host_note,
    text_template, claim_email, status
  ) values (
    'gabriel-4', 'kids_party', 'Gabriel is turning 4', 'With love from Gabriel''s mum and dad',
    'A pool party! Come for a swim, a light spread and cake. All the family welcome.',
    '2026-11-01', '14:00', 'From 2pm, come when you can', 'Our place', null,
    'light', 'A light spread, and cake at 4', 'Swimmers, a towel and a hat', 'optional', null,
    'stay', true, 'kids_off_social', '2026-10-25',
    'upload', 'suite', 'gabriel', 'navy',
    '{"sky":"#2B6CB0","navy":"#1B2A4A","yellow":"#F5C531","cream":"#F3E3B5","red":"#D9432C","paper":"#FFF8E6","forest":"#2F7F7A"}'::jsonb, true,
    'Gabriel is turning 4', 'A pool party on Sunday 1 November, from 2pm. Tap to see the details and let us know if you can make it.',
    'split', true, true, true, false,
    true, 'free', 'Bring something for the table if you feel inspired. No pressure at all.',
    'Hi {name}! Gabriel is turning 4 and we''d love you all at his pool party on Sunday 1 November, from 2pm. Everything is here, and you can reply with one tap: {link}',
    'marcia@nativa.studio', 'live'
  ) returning id
)
insert into public.runsheet_items (event_id, time, title, note, icon, visibility, sort)
select e.id, t.time::time, t.title, t.note, t.icon, 'guests', t.sort from e, (values
  ('14:00', 'Arrive', 'Come when you can. Swimmers on under clothes saves a lot of time.', 'gate', 1),
  ('14:15', 'Swim', 'Grown-ups in or poolside, whichever you like.', 'ring', 2),
  ('16:00', 'Cake', 'Candles, a song, and cake for everyone.', 'cake', 3)
) as t(time, title, note, icon, sort);

-- Attach the owner now if the profile already exists (the auth trigger covers the first sign-in case).
insert into public.event_members (event_id, profile_id, role)
select e.id, p.id, 'owner' from public.events e, public.profiles p
where e.slug = 'gabriel-4' and lower(p.email) = 'marcia@nativa.studio'
on conflict do nothing;

-- One preview guest so the personal link can be tried before real guests are added.
insert into public.guests (event_id, name, contact_name, token, source)
select id, 'Preview guest', null, 'previewgab4', 'invited' from public.events where slug = 'gabriel-4';
