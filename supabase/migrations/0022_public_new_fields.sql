-- Three columns added since this function was last written, added to what a guest is sent.
--
-- photos_note and the two block switches were being set by hosts and never reaching the invite,
-- which is the quietest kind of broken: the setting saves, the screen says it saved, and nothing
-- changes. Appended as a fourth jsonb_build_object rather than edited into the existing three,
-- because that keeps this migration a diff anybody can read next to the one before it.
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
    'photos_note', e.photos_note, 'plate_block', e.plate_block, 'gift_block', e.gift_block
  ) || jsonb_build_object(
    'runsheet', (select coalesce(jsonb_agg(jsonb_build_object('time', r.time, 'title', r.title, 'note', r.note, 'icon', r.icon) order by r.sort, r.time), '[]'::jsonb)
                 from public.runsheet_items r where r.event_id = e.id and r.visibility = 'guests'),
    'updates', (select coalesce(jsonb_agg(jsonb_build_object('body', u.body, 'posted_at', u.posted_at) order by u.posted_at desc), '[]'::jsonb)
                 from public.updates u where u.event_id = e.id)
  );
$$;
