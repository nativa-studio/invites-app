-- The guests' board stops sending who claimed each dish.
--
-- It used to carry the first name of whoever had claimed an item, and the card printed it:
-- "Priya is bringing this". Taking it out of the card is not enough on its own, because the name
-- still arrives in the page a guest is holding and is readable by anybody who looks. So it stops
-- at the database, which is the only place a thing is actually not sent.
--
-- What a guest needs is whether a dish is already covered, and that is `claimed`, which stays.
-- Whether it is theirs is `mine`, which stays too. Who else has what is the host's business:
-- their table, their chasing, and it is on their own board in full names.
create or replace function public.plate_item_json(i public.plate_items, p_guest uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', i.id,
    'label', i.label,
    'quantity', i.quantity,
    'tags', i.tags,
    'claimed', i.claimed_by_guest_id is not null,
    'mine', i.claimed_by_guest_id is not null and i.claimed_by_guest_id = p_guest,
    'added_by_me', i.added_by_guest_id is not null and i.added_by_guest_id = p_guest
  );
$$;
