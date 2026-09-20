-- "Give it a block on the invite" means a block in the invite, not whether guests can take part.
--
-- Built the wrong way round: the switch was gating the card that appears under a guest's reply,
-- which is the only place they can claim a dish or tick that they have chipped in. So a host who
-- did not want a potluck panel in the middle of their invite lost the potluck.
--
-- The two are different moments. While a guest is deciding, a potluck or a group gift is news,
-- and the info booth already carries it: whether it also gets a card of its own is taste, which
-- is what the switch is for. Once they have said yes it is a job, and the card that does that job
-- is not optional, because without it the feature does not exist.
--
-- So: these two functions stop consulting the switch. It is read on the invite's own side now,
-- where it decides whether a card is drawn among the cards a guest reads before replying.
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

create or replace function public.get_gift(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found or g.status = 'pending' then return null; end if;
  select * into e from public.events where id = g.event_id;
  return public.gift_json(e, g.id);
end $$;

-- Off by default, because the info booth already tells a guest it is happening and a second
-- announcement above the reply is the host choosing to make a point of it.
alter table public.events alter column plate_block set default false;
alter table public.events alter column gift_block set default false;
