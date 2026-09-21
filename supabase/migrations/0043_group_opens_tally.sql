-- A group link opened again is not a group link never opened.
--
-- 0040 wrote one row per link per day and threw away every open after the first, so Marcia opened
-- the Nest link six hours after somebody else had and watched the activity say nothing. The
-- throttle was right about the thing it was protecting against, a link pasted into a chat of
-- forty people being fetched forty times in a minute, and wrong about what to do: it answered
-- "do not flood the feed" with "lose the event", and the two are not the same answer.
--
-- So the row is kept and moved instead. One line per link per day still, which is the whole point
-- of the throttle, but its time is always the most recent open and it carries how many there have
-- been. That is the question the feature exists for, in the words of 0040's own comment: telling
-- "nobody has looked" from "people are looking and nobody has decided".
--
-- The day is a calendar day in Brisbane, not the rolling 24 hours 0040 used. Moving the time on
-- every open extends a rolling window forever: a link opened every few hours for a week would
-- never start a new row, and the host screen would say "opened 300 times today" about a week.
-- A calendar day cannot run away, and it is also the only reading of "today" that is true.
--
-- tally is null on every row written before this, and on every kind that is not a group open. The
-- host screen shows it only from two upwards, so a row that predates the column reads exactly as
-- it did yesterday rather than claiming to be a single open it cannot know it was.
alter table public.activity add column if not exists tally integer;

create or replace function public.group_link_opened(p_slug text, p_group text default null)
returns void language plpgsql security definer set search_path = public as $$
declare e public.events; grp text; hit bigint;
begin
  select * into e from public.events where slug = p_slug and group_link_enabled;
  if not found then return; end if;
  grp := nullif(left(trim(coalesce(p_group, '')), 40), '');

  select id into hit from public.activity
   where event_id = e.id and kind = 'group_open'
     and detail is not distinct from grp
     and at >= (date_trunc('day', now() at time zone 'Australia/Brisbane') at time zone 'Australia/Brisbane')
   order by at desc limit 1;

  if hit is not null then
    -- Moved to now, not duplicated. A host reading "2 minutes ago" against the Nest link is being
    -- told the true thing: that is when it was last opened.
    update public.activity set at = now(), tally = coalesce(tally, 1) + 1 where id = hit;
    return;
  end if;

  insert into public.activity (event_id, kind, detail, tally) values (e.id, 'group_open', grp, 1);
end $$;

revoke all on function public.group_link_opened(text, text) from public;
grant execute on function public.group_link_opened(text, text) to anon, authenticated;
