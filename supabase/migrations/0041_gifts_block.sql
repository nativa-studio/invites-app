-- Gifts, as a block of its own on the invite.
--
-- Until now everything about gifts was one line in the info booth: whatever the host typed, or a
-- sentence the group gift switch wrote when they typed nothing. That is the right size for "gifts
-- optional" and far too small for a wish list, which is a list of things and reads as one.
--
-- So it becomes a part, with its own switch, sitting in the order with the rest. Off by default,
-- including on every event that already exists, because an invite that grew a new block overnight
-- is an invite the host did not write.
--
-- The info booth keeps its gifts line. The two are not the same thing: the line is one sentence
-- for somebody deciding whether to come, and the block is the detail for somebody who is coming.
-- A host who turns the block on and wants the line gone clears gift_note, which is the field the
-- line is made of.
alter table public.events add column if not exists show_gifts boolean not null default false;

-- The wish list. A table rather than a column, for the same reasons runsheet_items is one: it is
-- an ordered list the host writes, it wants a sort that survives editing, and a row leaves room
-- for a guest to claim one later without a migration that rewrites everybody's JSON.
--
-- Guests only read it. There is no claim column yet, deliberately: Marcia asked for a list, and a
-- claimable list is a different feature with a different failure (two people buy the same thing
-- because one of them did not reload).
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  note text,
  url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wishlist_items_event on public.wishlist_items (event_id, sort, created_at);

alter table public.wishlist_items enable row level security;

-- The same policy every host table has: the row's event has an event_members row for auth.uid().
-- Guests never read this table directly. It reaches them inside event_public_json, which is a
-- security definer function taking a token or a slug.
drop policy if exists wishlist_items_member on public.wishlist_items;
create policy wishlist_items_member on public.wishlist_items
  for all using (public.is_member(event_id)) with check (public.is_member(event_id));

-- And out to the guests, which is the half that gets forgotten. Restated in full because a
-- function cannot be appended to: the body below is lifted from 0035 unchanged, with one new
-- jsonb_build_object on the end.
create or replace function public.event_public_json(e public.events) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', e.id, 'slug', e.slug, 'type', e.type, 'title', e.title, 'host_line', e.host_line, 'intro', e.intro,
    'date', e.date, 'start_time', e.start_time, 'end_time', e.end_time, 'time_note', e.time_note,
    'venue', e.venue, 'address', e.address, 'parking', e.parking, 'facilities', e.facilities, 'facilities_note', e.facilities_note,
    'public_transport', e.public_transport, 'serve_preset', e.serve_preset, 'serve_text', e.serve_text,
    'good_to_know', e.good_to_know, 'what_to_bring', e.what_to_bring, 'gift_stance', e.gift_stance, 'gift_note', e.gift_note,
    'gift_prefs_ok', e.gift_prefs_ok, 'gift_prefs_avoid', e.gift_prefs_avoid, 'group_gift_enabled', e.group_gift_enabled,
    'accessibility_venue', e.accessibility_venue, 'parents_mode', e.parents_mode, 'siblings_welcome', e.siblings_welcome
  ) || jsonb_build_object(
    'photo_sharing', e.photo_sharing, 'rsvp_by', e.rsvp_by, 'save_the_date', e.save_the_date, 'group_link_enabled', e.group_link_enabled,
    'look_mode', e.look_mode, 'theme_id', e.theme_id, 'layout_id', e.layout_id, 'ink', e.ink, 'palette', e.palette,
    'invite_image_path', e.invite_image_path, 'details_strip', e.details_strip, 'accent', e.accent,
    'share_title', e.share_title, 'share_description', e.share_description, 'yes_label', e.yes_label, 'no_label', e.no_label,
    'ask_party_mode', e.ask_party_mode, 'ask_names', e.ask_names, 'ask_dietary', e.ask_dietary, 'dietary_chips', e.dietary_chips,
    'ask_allergies', e.ask_allergies,
    'ask_accessibility', e.ask_accessibility, 'ask_emergency', e.ask_emergency, 'custom_question', e.custom_question,
    'custom_question_type', e.custom_question_type, 'plate_enabled', e.plate_enabled, 'plate_mode', e.plate_mode, 'plate_host_note', e.plate_host_note,
    'host_phone', e.host_phone, 'status', e.status
  ) || jsonb_build_object(
    'show_details', e.show_details, 'show_runsheet', e.show_runsheet,
    'show_good_to_know', e.show_good_to_know, 'show_after', e.show_after,
    'section_order', e.section_order, 'ask_note', e.ask_note,
    'show_signoff', e.show_signoff, 'signoff_note', e.signoff_note,
    'know_order', e.know_order, 'ask_name', e.ask_name, 'ask_phone', e.ask_phone
  ) || jsonb_build_object(
    'photos_note', e.photos_note, 'plate_block', e.plate_block, 'gift_block', e.gift_block,
    'ask_name_2', e.ask_name_2, 'ask_phone_2', e.ask_phone_2, 'drinks_note', e.drinks_note,
    'strip_set', e.strip_set
  ) || jsonb_build_object(
    'runsheet', (select coalesce(jsonb_agg(jsonb_build_object('time', r.time, 'title', r.title, 'note', r.note, 'icon', r.icon) order by r.sort, r.time), '[]'::jsonb)
                 from public.runsheet_items r where r.event_id = e.id and r.visibility = 'guests'),
    'updates', (select coalesce(jsonb_agg(jsonb_build_object('body', u.body, 'posted_at', u.posted_at) order by u.posted_at desc), '[]'::jsonb)
                 from public.updates u where u.event_id = e.id)
  ) || jsonb_build_object(
    'show_gifts', e.show_gifts,
    'wishlist', (select coalesce(jsonb_agg(jsonb_build_object('label', w.label, 'note', w.note, 'url', w.url) order by w.sort, w.created_at), '[]'::jsonb)
                 from public.wishlist_items w where w.event_id = e.id),
    -- What the group gift is, so the gifts block can name it before anybody has replied. Only the
    -- description: where to send money and who has chipped in stay behind get_gift, which takes a
    -- token and answers only for a guest who has said yes.
    'group_gift_what', (select gg.description from public.group_gift gg where gg.event_id = e.id)
  );
$$;
