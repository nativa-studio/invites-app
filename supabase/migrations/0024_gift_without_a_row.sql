-- A group gift that is switched on but has no row yet still gets a block.
--
-- The flag lives on events and everything else about the gift lives on group_gift, and until now
-- the block was built by selecting that row: no row, no block. Which was fine while the only way
-- to switch it on was the Gift tab, because that creates the row in the same action. It stopped
-- being fine the moment the switch also appeared in the info booth, which writes the flag and
-- nothing else. A host ticking it there got a line on the invite saying there is a group gift and
-- no group gift anywhere on the page.
--
-- Built with a left join instead, so the switch alone is enough. With no row the block says what
-- it already says before an organiser has filled anything in: it is being sorted.
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
      'ready', btrim(coalesce(gg.pay_details, '')) <> '',
      'chipped_in', exists (select 1 from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'my_amount', (select c.amount from public.gift_contributions c where c.event_id = p_event.id and c.guest_id = p_viewer),
      'chipped_count', (select count(*) from public.gift_contributions c where c.event_id = p_event.id),
      'is_organiser', gg.organiser_guest_id is not null and gg.organiser_guest_id = p_viewer
    )
    -- One row of nothing to hang the left join on, so this returns a block whether or not the
    -- event has a group_gift row. Every field simply comes back null, which the block already
    -- knows how to draw.
    from (select 1) one
    left join public.group_gift gg on gg.event_id = p_event.id
  ) end;
$$;
