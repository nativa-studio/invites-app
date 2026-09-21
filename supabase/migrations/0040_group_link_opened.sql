-- Somebody opened a group link.
--
-- A personal link stamps opened_at on the guest it belongs to. A group link belongs to nobody, so
-- until now a host pasted it into a chat and the trail went silent until the first reply: no way
-- to tell "nobody has looked" from "people are looking and nobody has decided", which are
-- opposite problems with opposite answers.
--
-- Anonymous on purpose. There is no row to attribute it to and inventing one would put a guest on
-- the list who never replied, so this records that the link was opened and which link it was.
--
-- Throttled to one row per link per day. A link pasted into a chat of forty people is fetched
-- forty times in a minute, and forty identical lines would push every real thing off a feed that
-- shows the last eighty. One a day answers the question the feed is for.
create or replace function public.group_link_opened(p_slug text, p_group text default null)
returns void language plpgsql security definer set search_path = public as $$
declare e public.events; grp text;
begin
  select * into e from public.events where slug = p_slug and group_link_enabled;
  if not found then return; end if;
  grp := nullif(left(trim(coalesce(p_group, '')), 40), '');
  if exists (
    select 1 from public.activity
     where event_id = e.id and kind = 'group_open'
       and detail is not distinct from grp
       and at > now() - interval '1 day'
  ) then
    return;
  end if;
  insert into public.activity (event_id, kind, detail) values (e.id, 'group_open', grp);
end $$;

revoke all on function public.group_link_opened(text, text) from public;
grant execute on function public.group_link_opened(text, text) to anon, authenticated;
