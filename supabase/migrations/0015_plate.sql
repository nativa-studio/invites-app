-- Bring a plate: the board, and the four things a guest can do to it.
--
-- The table has existed since 0001 and nothing has ever read or written it. This is the rest:
-- what a guest sees, and how they claim, release, add and remove, all through security definer
-- functions that take a token. Guest pages never touch a table, so every one of these is the
-- whole of what a guest can do, and each checks the token itself rather than trusting a caller.
--
-- Only a guest who has said yes can touch the board. The board is not on the invite before that:
-- what to bring is a question for somebody who is coming, and a claim from somebody who then says
-- no would leave a dish nobody is carrying.
--
-- Names on the board are first names, because a board is read in the room: "Mia is bringing the
-- pavlova" is what it is for, and the rest of somebody's name is not the host's to hand out.
--
-- The allergy line counts and never names. It is the same promise the brief makes about the host
-- screen: counts by chip only, no names and no free text, so a guest's note about their child's
-- allergy does not get read out to forty people.

-- One item, as a guest sees it. p_guest is who is asking, which decides `mine`.
create or replace function public.plate_item_json(i public.plate_items, p_guest uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', i.id,
    'label', i.label,
    'quantity', i.quantity,
    'tags', i.tags,
    'bringing', (select split_part(btrim(g.name), ' ', 1) from public.guests g where g.id = i.claimed_by_guest_id),
    'claimed', i.claimed_by_guest_id is not null,
    'mine', i.claimed_by_guest_id is not null and i.claimed_by_guest_id = p_guest,
    'added_by_me', i.added_by_guest_id is not null and i.added_by_guest_id = p_guest
  );
$$;

-- The whole board for one event, asked for by one guest.
create or replace function public.plate_json(e public.events, p_guest uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'enabled', e.plate_enabled,
    'mode', e.plate_mode,
    'host_note', e.plate_host_note,
    'items', (
      select coalesce(jsonb_agg(public.plate_item_json(i, p_guest) order by i.created_at), '[]'::jsonb)
      from public.plate_items i where i.event_id = e.id
    ),
    -- Counts by chip across the guests who are coming. No names, no free text, and a chip nobody
    -- has chosen does not appear at all.
    'allergies', (
      select coalesce(jsonb_agg(jsonb_build_object('chip', t.chip, 'n', t.n) order by t.n desc, t.chip), '[]'::jsonb)
      from (
        select d.chip, count(*)::int as n
        from public.guests g, unnest(g.dietary) as d(chip)
        where g.event_id = e.id and g.status = 'yes'
        group by d.chip
      ) t
    )
  );
$$;

-- Who is asking. Every function below starts here: an unknown token is not an error a guest
-- should be able to tell apart from an empty board, and a guest who has not said yes has no
-- business on it.
create or replace function public.plate_guest(p_token text) returns public.guests
language plpgsql stable security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  if g.status <> 'yes' then raise exception 'not coming'; end if;
  return g;
end $$;

create or replace function public.get_plate(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  if not e.plate_enabled then return null; end if;
  return public.plate_json(e, g.id);
end $$;

-- Claiming is a race: two guests tap the last pavlova at once. The where clause is the lock, so
-- the second one changes nothing and gets the board back with somebody else's name on it, rather
-- than quietly taking it off them.
create or replace function public.plate_claim(p_token text, p_item uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  g := public.plate_guest(p_token);
  select * into e from public.events where id = g.event_id;
  if not e.plate_enabled then raise exception 'not open'; end if;
  update public.plate_items set claimed_by_guest_id = g.id
   where id = p_item and event_id = g.event_id and claimed_by_guest_id is null;
  return public.plate_json(e, g.id);
end $$;

-- Putting one back. Only your own: a board where anyone can unclaim anyone is a board that ends
-- with an argument at the door.
create or replace function public.plate_unclaim(p_token text, p_item uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  g := public.plate_guest(p_token);
  select * into e from public.events where id = g.event_id;
  -- An item the guest added themselves goes away entirely rather than sitting there unclaimed,
  -- since nobody else asked for it and an orphan on the list reads as a job for someone.
  delete from public.plate_items
   where id = p_item and event_id = g.event_id and added_by_guest_id = g.id and claimed_by_guest_id = g.id;
  update public.plate_items set claimed_by_guest_id = null
   where id = p_item and event_id = g.event_id and claimed_by_guest_id = g.id;
  return public.plate_json(e, g.id);
end $$;

-- Adding your own, already claimed by you, because you are telling the board what you are
-- bringing rather than asking somebody else to bring it.
create or replace function public.plate_add(p_token text, p_label text, p_tags text[] default '{}') returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events; label text;
begin
  g := public.plate_guest(p_token);
  select * into e from public.events where id = g.event_id;
  if not e.plate_enabled then raise exception 'not open'; end if;
  label := btrim(coalesce(p_label, ''));
  if label = '' then raise exception 'needs a name'; end if;
  if length(label) > 80 then label := left(label, 80); end if;
  -- A guest holding five dishes has stopped reading the board and started filling it. This is
  -- not a limit anyone will meet by accident.
  if (select count(*) from public.plate_items where event_id = g.event_id and added_by_guest_id = g.id) >= 10 then
    raise exception 'too many';
  end if;
  insert into public.plate_items (event_id, label, tags, added_by_guest_id, claimed_by_guest_id)
  values (g.event_id, label, coalesce(p_tags, '{}'), g.id, g.id);
  return public.plate_json(e, g.id);
end $$;
