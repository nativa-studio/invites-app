-- The host's preview asks the database the same question a guest's invite asks.
--
-- Until now it did not. A guest reads the plate and the gift through the functions below, which
-- decide what is visible; the preview had no token to call them with, so it rebuilt both boards
-- from the host's own rows in TypeScript, and re-decided the same visibility rules in a second
-- language in a second file.
--
-- Both of the day's data faults lived in that gap. The two block switches were honoured in the
-- guest functions and not in the copy, so a host switching a block off watched it stay. The
-- guests' board stopped carrying who had claimed each dish, and the copy carried on sending the
-- names. Neither is the kind of thing a typecheck can see: the two files agreed on every type
-- and disagreed about the product.
--
-- So the preview gets its own door into the same room. These take an event id rather than a
-- token, check the caller is a member of that event, and then call the very builders the guest
-- functions call. One set of rules, written once. A host who is not a member gets nothing, which
-- is the same answer row level security would give them anywhere else.
--
-- p_viewer is null throughout: a preview is nobody in particular, so nothing is theirs, nothing
-- is claimed by them and nothing is chipped in by them. That is exactly what a host wants to
-- look at, which is the board as it stands before they are in it.
create or replace function public.preview_plate(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e public.events;
begin
  if not public.is_member(p_event) then return null; end if;
  select * into e from public.events where id = p_event;
  if not found or not e.plate_enabled then return null; end if;
  return public.plate_json(e, null);
end $$;

create or replace function public.preview_gift(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e public.events;
begin
  if not public.is_member(p_event) then return null; end if;
  select * into e from public.events where id = p_event;
  if not found then return null; end if;
  return public.gift_json(e, null);
end $$;

-- And a hole the preview found on its way through.
--
-- plate_item_json answered `mine` with "is claimed AND claimed by you", which with nobody asking
-- comes back null rather than false: true and null is null in SQL, not false. A guest always had
-- an id so it never showed, and the first caller to pass none got a board where an unclaimed dish
-- said false and a claimed one said null. Both are falsy in a browser, so it drew correctly and
-- the type was a lie, which is the kind of thing that holds until somebody writes === false.
create or replace function public.plate_item_json(i public.plate_items, p_guest uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', i.id,
    'label', i.label,
    'quantity', i.quantity,
    'tags', i.tags,
    'claimed', i.claimed_by_guest_id is not null,
    'mine', coalesce(i.claimed_by_guest_id is not null and i.claimed_by_guest_id = p_guest, false),
    'added_by_me', coalesce(i.added_by_guest_id is not null and i.added_by_guest_id = p_guest, false)
  );
$$;
