-- The group gift, before a guest has answered, and the taps that lead to it in the trail.
--
-- Three changes, one file, because they are one change to a host: the gift is open to anybody
-- holding their own link, and the host can see who has been looking at it.

-- 1. Chipping in no longer waits for a reply.
--
-- The original rule was that money is the wrong question in the middle of deciding whether to
-- come. That is true of a card shoved under the RSVP, which is what it used to be. It is now a
-- quiet line inside the gifts block, behind a button, two taps from anything: somebody who wants
-- to send something can, and everybody else never sees a bank detail. Marcia asked for it, and
-- the moment it stopped interrupting the reply the argument against it went with it.
--
-- No new exposure. A token is still the whole of what this asks for, and the guest holding it was
-- sent it by the host. What changes is that they no longer have to answer first to use it.
create or replace function public.gift_guest(p_token text) returns public.guests
language plpgsql stable security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  return g;
end $$;

create or replace function public.get_gift(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  return public.gift_json(e, g.id);
end $$;

-- 2. A tap on one of the gifts block's parts.
--
-- The host could see that somebody opened their invite and that somebody replied, and nothing in
-- between. Whether anybody is reading the wish list at all is the question behind "should I have
-- bothered", and it was unanswerable.
--
-- Throttled and counted the way a group link open is, and for the same reason: a guest who opens
-- Ideas, shuts it, opens it again and scrolls back later would otherwise be four lines. One row
-- per guest per kind per Brisbane day, its time moved to the most recent tap and a tally beside
-- it. A calendar day rather than a rolling one, so a run can never grow past the day it claims.
create or replace function public.note_gift_tap(p_token text, p_what text) returns void
language plpgsql security definer set search_path = public as $$
-- k, not kind: a plpgsql variable cannot be qualified with the function's name, and an
  -- unqualified `kind` in the lookup below is ambiguous with activity.kind.
declare g public.guests; k text; hit bigint;
begin
  -- An unknown token is somebody guessing, and a bad kind is a typo of ours. Neither is worth an
  -- error on a page whose job is to draw an invitation: this measures, and measuring never breaks
  -- the thing it measures.
  select * into g from public.guests where token = p_token;
  if not found then return; end if;
  k := case p_what when 'ideas' then 'tap_ideas'
                   when 'group' then 'tap_group_gift'
                   when 'chip' then 'tap_chip_in'
                   else null end;
  if k is null then return; end if;

  select id into hit from public.activity
   where event_id = g.event_id and actor_guest_id = g.id and activity.kind = k
     and at >= (date_trunc('day', now() at time zone 'Australia/Brisbane') at time zone 'Australia/Brisbane')
   order by at desc limit 1;

  if hit is not null then
    update public.activity set at = now(), tally = coalesce(tally, 1) + 1 where id = hit;
    return;
  end if;
  insert into public.activity (event_id, actor_guest_id, kind, tally)
  values (g.event_id, g.id, k, 1);
end $$;

revoke all on function public.note_gift_tap(text, text) from public;
grant execute on function public.note_gift_tap(text, text) to anon, authenticated;

-- 3. Chipping in lands in the trail, and unchipping takes it back out.
--
-- The count on the card said how many, never who, which is right for a guest reading it and
-- useless to a host wondering whether to chase anybody. The trail is the host's side and names
-- people, the same as a reply does.
--
-- Deleted rather than left standing on an unchip, because "Sarah chipped in" sitting in the trail
-- under a contribution she has since taken back is the app remembering something that is no
-- longer true.
create or replace function public.gift_chip_in(p_token text, p_amount numeric default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events; amt numeric; fresh boolean;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  if not e.group_gift_enabled then raise exception 'not open'; end if;
  -- A negative or absurd amount is a typo, not a contribution. Blank stays blank: plenty of
  -- people will tick the box and decline to say how much, which is their business.
  amt := case when p_amount is null or p_amount <= 0 or p_amount > 100000 then null else round(p_amount, 2) end;
  fresh := not exists (select 1 from public.gift_contributions where event_id = e.id and guest_id = g.id);
  insert into public.gift_contributions (event_id, guest_id, amount)
  values (e.id, g.id, amt)
  on conflict (event_id, guest_id) do update set amount = excluded.amount, chipped_in_at = now();
  -- Only the first time. Changing the amount is the same person still chipping in, not a second
  -- thing happening.
  if fresh then
    insert into public.activity (event_id, actor_guest_id, kind) values (e.id, g.id, 'chipped_in');
  end if;
  return public.gift_json(e, g.id);
end $$;

create or replace function public.gift_unchip(p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  delete from public.gift_contributions where event_id = e.id and guest_id = g.id;
  delete from public.activity where event_id = e.id and actor_guest_id = g.id and kind = 'chipped_in';
  return public.gift_json(e, g.id);
end $$;
