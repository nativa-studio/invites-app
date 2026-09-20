-- The allergy banner comes off the guest's plate card, and off the wire with it.
--
-- It read "Please keep in mind: 1 guest needs Dairy free, 1 guest needs Vegetarian" on the card
-- where a guest claims a dish. Whoever is cooking needs that. A guest bringing a salad does not,
-- and it put the room's food needs, counted, on a card forty people can open. The host's own
-- potluck board still carries it, which is where it belongs.
--
-- Stopping the UI drawing it would have been enough to satisfy the eye. It is dropped from the
-- function as well, because a payload that carries something nothing displays is still a payload
-- that left the server: the next person to write a plate card would find the counts sitting there
-- and reasonably assume they were meant to be shown.
create or replace function public.plate_json(e public.events, p_guest uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'enabled', e.plate_enabled,
    'mode', e.plate_mode,
    'host_note', e.plate_host_note,
    'items', (
      select coalesce(jsonb_agg(public.plate_item_json(i, p_guest) order by i.created_at), '[]'::jsonb)
      from public.plate_items i where i.event_id = e.id
    )
  );
$$;
