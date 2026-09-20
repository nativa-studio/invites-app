-- The block switches, applied where the board is handed over.
--
-- Off means the guest's page is built without a board rather than with one that something later
-- declines to draw. The line in Good to know is unaffected: that is driven by plate_enabled and
-- group_gift_enabled, which is the point of the two being separate. The announcement stays, the
-- panel goes.
create or replace function public.get_plate(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  if not e.plate_enabled or not coalesce(e.plate_block, true) then return null; end if;
  return public.plate_json(e, g.id);
end $$;

create or replace function public.get_gift(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found or g.status = 'pending' then return null; end if;
  select * into e from public.events where id = g.event_id;
  if not coalesce(e.gift_block, true) then return null; end if;
  return public.gift_json(e, g.id);
end $$;
