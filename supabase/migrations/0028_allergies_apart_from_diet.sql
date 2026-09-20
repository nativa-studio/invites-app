-- Allergies, asked on their own.
--
-- There was one question, "Anything we should know about food?", with chips and a box whose
-- placeholder read "Allergies or anything else, in your words". That is two questions wearing one
-- coat, and the two are not the same kind of thing at all. A dietary requirement is a preference
-- or a practice: it changes what somebody is served. An allergy is a safety fact: it changes what
-- may be in the room, it is not always about food at all (latex gloves, a plaster, the dog), and
-- getting it wrong is an ambulance rather than a disappointed guest.
--
-- So: one free-text question for allergies, which no chip can ever say precisely enough, and the
-- existing chips plus note for everything else about food. Allergies are free text on purpose. A
-- chip can say "nut free" and cannot say "peanuts, carries an epipen, fine with other nuts", and
-- the second is the sentence that matters.
--
-- Where it goes: on the reply, to the host. Never onto the potluck board, which shows counts by
-- chip and no names and no free text, and is unchanged by this.
alter table public.guests add column if not exists allergies text;
-- On by default. A host who does not want to ask can switch it off, but an event that has never
-- been thought about should ask rather than not.
alter table public.events add column if not exists ask_allergies boolean not null default true;

-- Out to the guest's own invite, so somebody changing their answer sees what they wrote before.
create or replace function public.guest_public_json(g public.guests) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'name', g.name, 'contact_name', g.contact_name, 'status', g.status, 'party_size', g.party_size, 'children', g.children, 'adults', g.adults,
    'expected_children', g.expected_children, 'expected_adults', g.expected_adults,
    'party_names', g.party_names, 'dietary', g.dietary, 'dietary_note', g.dietary_note, 'allergies', g.allergies,
    'accessibility_note', g.accessibility_note,
    'custom_answer', g.custom_answer, 'note', g.note, 'emergency_name', g.emergency_name, 'emergency_phone', g.emergency_phone,
    'replied_at', g.replied_at, 'dropped_out_at', g.dropped_out_at, 'see_you_soon_sent_at', g.see_you_soon_sent_at,
    'thanks_sent_at', g.thanks_sent_at, 'thanks_photo_path', g.thanks_photo_path, 'source', g.source
  );
$$;

-- And the switch out to the invite, so the question can be drawn. The allowlist again: a column a
-- host can set and a guest never receives saves, says it saved, and changes nothing.
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
    'ask_name_2', e.ask_name_2, 'ask_phone_2', e.ask_phone_2
  ) || jsonb_build_object(
    'runsheet', (select coalesce(jsonb_agg(jsonb_build_object('time', r.time, 'title', r.title, 'note', r.note, 'icon', r.icon) order by r.sort, r.time), '[]'::jsonb)
                 from public.runsheet_items r where r.event_id = e.id and r.visibility = 'guests'),
    'updates', (select coalesce(jsonb_agg(jsonb_build_object('body', u.body, 'posted_at', u.posted_at) order by u.posted_at desc), '[]'::jsonb)
                 from public.updates u where u.event_id = e.id)
  );
$$;

-- The reply itself takes one more answer. The old thirteen-argument function is dropped rather
-- than left beside the new one: two candidates that both match a thirteen-argument call is an
-- ambiguity error, not a fallback. The new argument is last and has a default, so a browser still
-- running the previous build posts thirteen arguments, matches this function, and saves: there is
-- no window between applying this and deploying where a guest's reply fails.
drop function if exists public.submit_rsvp(text, text, int, int, int, text[], text[], text, text, text, text, text, text);

create or replace function public.submit_rsvp(p_token text, p_status text, p_children int default null, p_adults int default null,
  p_party_size int default null, p_party_names text[] default null, p_dietary text[] default null, p_dietary_note text default null,
  p_accessibility_note text default null, p_custom_answer text default null, p_note text default null,
  p_emergency_name text default null, p_emergency_phone text default null, p_allergies text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.guests;
begin
  if p_status not in ('yes','no') then raise exception 'status must be yes or no'; end if;
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  update public.guests set
    status = p_status,
    children = case when p_status = 'yes' then p_children else null end,
    adults = case when p_status = 'yes' then p_adults else null end,
    party_size = case when p_status = 'yes' then coalesce(p_party_size, coalesce(p_children,0) + coalesce(p_adults,0)) else 0 end,
    party_names = case when p_status = 'yes' then coalesce(p_party_names, '{}') else '{}' end,
    dietary = case when p_status = 'yes' then coalesce(p_dietary, '{}') else '{}' end,
    dietary_note = case when p_status = 'yes' then nullif(trim(p_dietary_note), '') else null end,
    allergies = case when p_status = 'yes' then nullif(trim(p_allergies), '') else null end,
    accessibility_note = case when p_status = 'yes' then nullif(trim(p_accessibility_note), '') else null end,
    custom_answer = nullif(trim(p_custom_answer), ''),
    note = nullif(trim(p_note), ''),
    emergency_name = case when p_status = 'yes' then nullif(trim(p_emergency_name), '') else null end,
    emergency_phone = case when p_status = 'yes' then nullif(trim(p_emergency_phone), '') else null end,
    replied_at = now(),
    dropped_out_at = case when p_status = 'no' and g.status = 'yes' and g.see_you_soon_sent_at is not null then now() else dropped_out_at end
  where id = g.id;
  insert into public.activity (event_id, actor_guest_id, kind, detail) values (g.event_id, g.id, 'rsvp', p_status);
  select * into g from public.guests where id = g.id;
  return public.guest_public_json(g);
end $$;

revoke all on function public.submit_rsvp(text, text, int, int, int, text[], text[], text, text, text, text, text, text, text) from public;
grant execute on function public.submit_rsvp(text, text, int, int, int, text[], text[], text, text, text, text, text, text, text) to anon, authenticated;
