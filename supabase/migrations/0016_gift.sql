-- The group gift, from the guest's side and the organiser's.
--
-- Money never touches this app. The organiser types their PayID or bank details, guests read them
-- and pay each other however they already pay each other, and the app keeps the one thing a
-- spreadsheet in a group chat never does: who has chipped in, so nobody is asked twice and nobody
-- is forgotten. "I've chipped in" is a tick a guest sets themselves, and the amount beside it is
-- optional, because plenty of people will not want to say.
--
-- Same shape as the plate: every function takes the token and nothing that could be swapped for
-- somebody else's, and every one of them returns the whole block, so the screen after a tap is
-- what is in the database rather than what the tap hoped for.

-- One contribution per guest, which is what makes the tick a tick rather than a tally.
create unique index if not exists gift_contributions_one_each on public.gift_contributions(event_id, guest_id);

-- Who is asking. A guest still deciding is not shown the gift at all: the invite's job at that
-- point is the date, the place and who is hosting, and a question about money belongs after the
-- answer. Someone who said no still sees it, because being unable to come and wanting to chip in
-- are not the same thing, and being shut out of the present because of a prior engagement is a
-- small meanness the app should not commit.
create or replace function public.gift_guest(p_token text) returns public.guests
language plpgsql stable security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  if g.status = 'pending' then raise exception 'not answered'; end if;
  return g;
end $$;

-- The organiser's name, in one place, because it is read from two different tables depending on
-- whether the organiser is a guest or one of the hosts.
create or replace function public.gift_organiser_name(p_gift public.group_gift) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select split_part(btrim(g.name), ' ', 1) from public.guests g where g.id = p_gift.organiser_guest_id),
    (select split_part(btrim(p.name), ' ', 1) from public.profiles p where p.id = p_gift.organiser_profile_id)
  );
$$;

-- What a guest reads. No amounts and no names of other contributors: how much somebody else gave
-- is between them and the organiser. The count is there because "eleven people have chipped in"
-- is the one number that tells a guest this is really happening.
create or replace function public.gift_json(p_event public.events, p_viewer uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not p_event.group_gift_enabled then null else (
    select jsonb_build_object(
      'enabled', true,
      'description', gg.description,
      'organiser', public.gift_organiser_name(gg),
      'message', gg.message,
      'suggested_amount', gg.suggested_amount,
      'chip_in_by', gg.chip_in_by,
      'pay_details', gg.pay_details,
      'pay_reference', gg.pay_reference,
      'latest_update', gg.latest_update,
      -- Until the organiser has said where the money goes there is nothing to ask anybody to do,
      -- so the block says it is being sorted rather than showing an empty how-to-pay.
      'ready', btrim(coalesce(gg.pay_details, '')) <> '',
      'chipped_in', exists (select 1 from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'my_amount', (select c.amount from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'chipped_count', (select count(*) from public.gift_contributions c where c.event_id = p_event.id),
      'is_organiser', gg.organiser_guest_id is not null and gg.organiser_guest_id = p_viewer
    )
    from public.group_gift gg where gg.event_id = p_event.id
  ) end;
$$;

create or replace function public.get_gift(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found or g.status = 'pending' then return null; end if;
  select * into e from public.events where id = g.event_id;
  return public.gift_json(e, g.id);
end $$;

-- Chipping in is a tick, not a payment. One row per guest, so tapping it twice does not count
-- them twice, and changing the amount is the same call again.
create or replace function public.gift_chip_in(p_token text, p_amount numeric default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events; amt numeric;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  if not e.group_gift_enabled then raise exception 'not open'; end if;
  -- A negative or absurd amount is a typo, not a contribution. Blank stays blank: plenty of
  -- people will tick the box and decline to say how much, which is their business.
  amt := case when p_amount is null or p_amount <= 0 or p_amount > 100000 then null else round(p_amount, 2) end;
  insert into public.gift_contributions (event_id, guest_id, amount)
  values (e.id, g.id, amt)
  on conflict (event_id, guest_id) do update set amount = excluded.amount, chipped_in_at = now();
  return public.gift_json(e, g.id);
end $$;

create or replace function public.gift_unchip(p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  delete from public.gift_contributions where event_id = e.id and guest_id = g.id;
  return public.gift_json(e, g.id);
end $$;

-- The organiser's own page. Everything a guest sees plus the two things only they need: who has
-- chipped in with what, and who has not, so the nudge goes to the right people.
create or replace function public.gift_board(p_event public.events, p_viewer uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(public.gift_json(p_event, p_viewer), jsonb_build_object('enabled', false)) || jsonb_build_object(
    'target', (select gg.target from public.group_gift gg where gg.event_id = p_event.id),
    'surprise', (select gg.surprise from public.group_gift gg where gg.event_id = p_event.id),
    'total', coalesce((select sum(c.amount) from public.gift_contributions c where c.event_id = p_event.id), 0),
    -- Whole names here. The organiser is chasing actual people and needs to know which Sam.
    'contributors', coalesce((
      select jsonb_agg(jsonb_build_object('name', g.name, 'amount', c.amount, 'at', c.chipped_in_at) order by c.chipped_in_at)
      from public.gift_contributions c join public.guests g on g.id = c.guest_id
      where c.event_id = p_event.id
    ), '[]'::jsonb),
    -- The chase list. Only the ones who said yes, because chasing somebody who already said they
    -- cannot come for money towards a present is the kind of message that ends a friendship, and
    -- never the organiser, who is the person reading it and does not need to text themselves.
    'waiting', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'phone', g.phone) order by g.name)
      from public.guests g
      where g.event_id = p_event.id and g.status = 'yes' and g.id is distinct from p_viewer
        and not exists (select 1 from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = g.id)
    ), '[]'::jsonb)
  );
$$;

-- Only the organiser's own token opens this. Anybody else's gets the same nothing an unknown
-- token gets, so a guest poking at the address bar cannot tell a wrong token from a wrong page.
create or replace function public.get_gift_board(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events; gg public.group_gift;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  if not e.group_gift_enabled then return null; end if;
  select * into gg from public.group_gift where event_id = e.id;
  if not found or gg.organiser_guest_id is distinct from g.id then return null; end if;
  return public.gift_board(e, g.id);
end $$;

-- The organiser filling in their side. Everything in one call, because it is one form.
create or replace function public.gift_save(
  p_token text,
  p_pay_details text,
  p_pay_reference text,
  p_message text,
  p_suggested numeric,
  p_chip_in_by date,
  p_surprise boolean
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events; gg public.group_gift;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  select * into gg from public.group_gift where event_id = e.id;
  if not found or gg.organiser_guest_id is distinct from g.id then raise exception 'not the organiser'; end if;
  update public.group_gift set
    pay_details = nullif(btrim(coalesce(p_pay_details, '')), ''),
    pay_reference = nullif(btrim(coalesce(p_pay_reference, '')), ''),
    message = nullif(btrim(coalesce(p_message, '')), ''),
    suggested_amount = case when p_suggested is null or p_suggested <= 0 or p_suggested > 100000 then null else round(p_suggested, 2) end,
    chip_in_by = p_chip_in_by,
    surprise = coalesce(p_surprise, surprise)
  where event_id = e.id;
  return public.gift_board(e, g.id);
end $$;

-- One line to everybody: "target reached, buying Saturday". It replaces the last one rather than
-- stacking up, because this is a status, not a feed, and a guest opening their link wants the
-- state of the thing rather than its history.
create or replace function public.gift_post_update(p_token text, p_text text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events; gg public.group_gift;
begin
  g := public.gift_guest(p_token);
  select * into e from public.events where id = g.event_id;
  select * into gg from public.group_gift where event_id = e.id;
  if not found or gg.organiser_guest_id is distinct from g.id then raise exception 'not the organiser'; end if;
  update public.group_gift set latest_update = nullif(btrim(coalesce(p_text, '')), '') where event_id = e.id;
  return public.gift_board(e, g.id);
end $$;

-- A surprise gift is usually a gift for one of the hosts, and the whole point is that they do not
-- see it coming. The blanket "members all" policy let every host read the contributions, so the
-- switch was a label on a box that was not locked. This replaces it: hosts read contributions
-- unless the gift is a surprise they are not themselves running. The organiser's own page does
-- not go through this at all, since it reads through the security definer functions above.
drop policy if exists "members all" on public.gift_contributions;
-- Dropped first so the file can be run twice. create policy has no "or replace", and a migration
-- that only works the first time is a trap for whoever runs it next.
drop policy if exists "members read contributions" on public.gift_contributions;
create policy "members read contributions" on public.gift_contributions for select using (
  public.is_member(event_id) and not exists (
    select 1 from public.group_gift gg
    where gg.event_id = gift_contributions.event_id
      and gg.surprise
      and gg.organiser_profile_id is distinct from auth.uid()
  )
);
-- Read only, and deliberately no write policy at all: guests chip in through the functions
-- above, which run as definer and do not consult this. A permissive write policy would have been
-- a second grant sitting beside the one above, and policies are OR'd, so "for all" would have
-- handed back exactly the select this is meant to withhold.
