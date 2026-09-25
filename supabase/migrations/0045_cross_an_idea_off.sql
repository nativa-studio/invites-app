-- Crossing an idea off the list.
--
-- The wish list was reading matter: here are some things he would like. Marcia asked for the one
-- thing a list of presents is actually for, which is knowing that somebody has already got the
-- scooter. A guest taps an idea and it goes through. Nothing else happens, and nothing on the
-- invite says it can: "really subtle, I don't want to impose anything, so you don't say
-- anything." She will cross one or two off herself so the rest work it out.
--
-- 0041 left the column out on purpose and said why: two people buy the same thing because one of
-- them did not reload. So the rules live here rather than in the browser, and the browser draws
-- whatever this hands back.
--
-- The first idea is never crossable. It is the general one, the sentence about the kind of thing
-- he likes rather than a thing anybody can buy, and crossing it off would say the whole list is
-- taken. First by the host's own order, since that is the order the list is written in.

alter table public.wishlist_items
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by_guest_id uuid references public.guests(id) on delete set null;

-- A guest who is removed from the list takes their name off the claim (the reference above) but
-- not the claim itself: somebody is still bringing it until a host says otherwise.

-- The state of the list, for whoever is looking at it.
--
-- One builder, called by all three doors: a guest with their own link, the group link with no
-- guest at all, and the host's preview. The labels are already on the page, so this carries only
-- what changes: crossed, and whether it was you who crossed it. Order matches the list as drawn,
-- so the first entry is the first idea.
create or replace function public.wish_state_json(p_event uuid, p_guest uuid) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', w.id,
    'claimed', w.claimed_at is not null,
    -- coalesce, because "claimed and claimed by you" with nobody asking is null rather than
    -- false, and a null here would read as crossed-by-somebody-else in the browser. The same
    -- hole migration 0027 found in the plate board.
    'mine', coalesce(w.claimed_by_guest_id is not null and w.claimed_by_guest_id = p_guest, false)
  ) order by w.sort, w.created_at), '[]'::jsonb)
  from public.wishlist_items w where w.event_id = p_event;
$$;

create or replace function public.wish_state(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  return public.wish_state_json(g.event_id, g.id);
end $$;

create or replace function public.wish_state_slug(p_slug text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e public.events;
begin
  select * into e from public.events where slug = p_slug;
  if not found then return null; end if;
  -- No guest on a group link, so nothing is ever yours to take back. Crossed is still crossed:
  -- the list reads the same whichever door you came through, which is the rule CLAUDE.md opens
  -- with.
  return public.wish_state_json(e.id, null);
end $$;

create or replace function public.preview_wish_state(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_member(p_event) then return null; end if;
  return public.wish_state_json(p_event, null);
end $$;

-- Crossing one off, and taking it back.
--
-- Every rule that decides what may happen is here, because the browser holding a stale list is
-- the normal case and not the exception: two people open the invite, one crosses the scooter off,
-- the other still sees it plain. Claiming something already claimed is refused rather than
-- overwritten, so the first tap wins and the second one simply learns the truth, since what comes
-- back is the state of the list rather than the state of the tap.
--
-- Only the guest who crossed it can put it back. An idea a host crossed off belongs to nobody and
-- stays crossed until the host says otherwise.
create or replace function public.wish_claim(p_token text, p_item uuid, p_on boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; w public.wishlist_items; first_id uuid;
begin
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  select * into w from public.wishlist_items where id = p_item and event_id = g.event_id;
  -- An id from another event, or one the host has since deleted. Nothing to say about it, and an
  -- error here would be an error on an invitation.
  if not found then return public.wish_state_json(g.event_id, g.id); end if;

  select x.id into first_id from public.wishlist_items x
   where x.event_id = g.event_id order by x.sort, x.created_at limit 1;
  if w.id = first_id then return public.wish_state_json(g.event_id, g.id); end if;

  if p_on then
    if w.claimed_at is null then
      update public.wishlist_items set claimed_at = now(), claimed_by_guest_id = g.id where id = w.id;
      -- The host's half of it. A crossed idea is the one thing in this block a host has to act
      -- on, or rather stop acting on: it is the line that says stop wondering about the scooter.
      insert into public.activity (event_id, actor_guest_id, kind, detail)
      values (g.event_id, g.id, 'wish_claimed', w.label);
    end if;
  elsif w.claimed_by_guest_id = g.id then
    update public.wishlist_items set claimed_at = null, claimed_by_guest_id = null where id = w.id;
    -- Deleted rather than left standing, the same as an unchip: a line saying Sarah is bringing
    -- the scooter, under an idea she has put back, is the app remembering something untrue.
    delete from public.activity
     where event_id = g.event_id and actor_guest_id = g.id and kind = 'wish_claimed' and detail = w.label;
  end if;

  return public.wish_state_json(g.event_id, g.id);
end $$;

revoke all on function public.wish_state(text) from public;
revoke all on function public.wish_state_slug(text) from public;
revoke all on function public.wish_claim(text, uuid, boolean) from public;
grant execute on function public.wish_state(text) to anon, authenticated;
grant execute on function public.wish_state_slug(text) to anon, authenticated;
grant execute on function public.wish_claim(text, uuid, boolean) to anon, authenticated;

-- And the id out to the guests, so a tap has something to name. Restated in full because a
-- function cannot be appended to: the body below is the one live in the database, with 'id', w.id
-- added to the wish list object and nothing else touched.
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
    'wishlist', (select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'label', w.label, 'note', w.note, 'url', w.url) order by w.sort, w.created_at), '[]'::jsonb)
                 from public.wishlist_items w where w.event_id = e.id),
    -- What the group gift is, so the gifts block can name it before anybody has replied. Only the
    -- description: where to send money and who has chipped in stay behind get_gift, which takes a
    -- token and answers only for a guest who has said yes.
    'group_gift_what', (select gg.description from public.group_gift gg where gg.event_id = e.id),
    'group_gift_note', e.group_gift_note
  );
$$;
