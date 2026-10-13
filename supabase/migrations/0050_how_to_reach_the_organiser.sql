-- A number to reach the organiser on.
--
-- A guest reading the gift block already learns who is running it and where to send the money.
-- What they could not do is ask a question: whether the organiser has enough, whether it is too
-- late, whether somebody else already got that one. Marcia asked for three things on this block
-- and this was the only one missing: "who is organizing it, how to chip in, and a contact number
-- to get in touch."
--
-- Its own column rather than the organiser's guest row. The phone on a guest row was given to the
-- host for an invitation, and publishing it to every other guest because that person agreed to
-- collect money for a present is not what it was given for. This one is typed by the organiser on
-- their own page, prefilled from what the host holds so it is one tap to agree, and blank until
-- they do. Blank means the block says nothing about contacting anybody, which is the right answer
-- for an organiser who would rather not be rung.
alter table public.group_gift add column if not exists contact_phone text;

-- And out to the guests.
--
-- Restated in full rather than appended to, because a function cannot be appended to. The body
-- below is the one live in the database, with 'contact_phone' added beside the pay details, which
-- is what it belongs with: how to send the money, and who to ask about it.
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
      'contact_phone', gg.contact_phone,
      'latest_update', gg.latest_update,
      'ready', btrim(coalesce(gg.pay_details, '')) <> '',
      'chipped_in', exists (select 1 from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'my_amount', (select c.amount from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'chipped_count', (select count(*) from public.gift_contributions c where c.event_id = p_event.id),
      'is_organiser', gg.organiser_guest_id is not null and gg.organiser_guest_id = p_viewer
    )
    from public.group_gift gg where gg.event_id = p_event.id
  ) end;
$$;

-- The organiser's own board gains the number the host already holds for them, so the field on
-- their page opens with it filled in and agreeing to it is one tap rather than typing a phone
-- number on a phone. Only ever their own: p_viewer is the organiser reading their own page.
create or replace function public.gift_board(p_event public.events, p_viewer uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(public.gift_json(p_event, p_viewer), jsonb_build_object('enabled', false)) || jsonb_build_object(
    'target', (select gg.target from public.group_gift gg where gg.event_id = p_event.id),
    'surprise', (select gg.surprise from public.group_gift gg where gg.event_id = p_event.id),
    'my_phone', (select g.phone from public.guests g where g.id = p_viewer),
    'total', coalesce((select sum(c.amount) from public.gift_contributions c where c.event_id = p_event.id), 0),
    'contributors', coalesce((
      select jsonb_agg(jsonb_build_object('name', g.name, 'amount', c.amount, 'at', c.chipped_in_at) order by c.chipped_in_at)
      from public.gift_contributions c join public.guests g on g.id = c.guest_id
      where c.event_id = p_event.id
    ), '[]'::jsonb),
    'waiting', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'phone', g.phone) order by g.name)
      from public.guests g
      where g.event_id = p_event.id and g.status = 'yes' and g.id is distinct from p_viewer
        and not exists (select 1 from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = g.id)
    ), '[]'::jsonb)
  );
$$;

-- The organiser saving their side, now with the number on it.
--
-- The old seven argument version is dropped rather than left beside this one. Two functions of
-- the same name, one of which silently does not save the newest field, is the shape of fault this
-- project keeps finding: the screen says saved and one box did nothing.
drop function if exists public.gift_save(text, text, text, text, numeric, date, boolean);

create or replace function public.gift_save(
  p_token text,
  p_pay_details text,
  p_pay_reference text,
  p_message text,
  p_suggested numeric,
  p_chip_in_by date,
  p_surprise boolean,
  p_contact_phone text
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
    surprise = coalesce(p_surprise, surprise),
    -- Digits, spaces and the few marks a phone number wears. Anything else is not a number
    -- somebody can ring, and a block that prints whatever was pasted into it is a block that can
    -- be made to print anything.
    contact_phone = nullif(btrim(regexp_replace(coalesce(p_contact_phone, ''), '[^0-9+() -]', '', 'g')), '')
  where event_id = e.id;
  return public.gift_board(e, g.id);
end $$;

revoke all on function public.gift_save(text, text, text, text, numeric, date, boolean, text) from public;
grant execute on function public.gift_save(text, text, text, text, numeric, date, boolean, text) to anon, authenticated;
